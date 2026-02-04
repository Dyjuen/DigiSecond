import { TRPCError } from "@trpc/server";
import { db } from "@/server/db";

interface RateLimitConfig {
    /** Maximum number of requests allowed in the window */
    limit: number;
    /** Window duration in seconds */
    windowSeconds: number;
}

/**
 * Rate limit configurations per endpoint
 * Based on spec.md Section 7.4
 */
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
    // Auth endpoints
    "auth.login": { limit: 5, windowSeconds: 15 * 60 }, // 5/15min
    "auth.register": { limit: 3, windowSeconds: 60 * 60 }, // 3/hour

    // Listing endpoints
    "listing.create": { limit: 10, windowSeconds: 60 * 60 }, // 10/hour
    "listing.search": { limit: 60, windowSeconds: 60 }, // 60/min

    // Message endpoints
    "message.send": { limit: 20, windowSeconds: 60 }, // 20/min

    // Payment endpoints
    "payment.create": { limit: 10, windowSeconds: 60 * 60 }, // 10/hour
};

/**
 * Check rate limit for a given key and endpoint
 * Uses database-backed rate limiting with the RateLimit model
 * 
 * @param key - Unique identifier (user_id or IP address)
 * @param endpoint - The endpoint being rate limited
 * @returns true if within limit, throws TRPCError if exceeded
 */
export async function checkRateLimit(
    key: string,
    endpoint: string
): Promise<boolean> {
    const config = RATE_LIMITS[endpoint];

    if (!config) {
        // No rate limit configured for this endpoint
        return true;
    }

    const rateLimitKey = `${endpoint}:${key}`;
    const now = new Date();
    const windowStart = new Date(now.getTime() - config.windowSeconds * 1000);
    const expiresAt = new Date(now.getTime() + config.windowSeconds * 1000);

    try {
        // Check existing rate limit record
        const existing = await db.rateLimit.findUnique({
            where: { rate_limit_key: rateLimitKey },
        });

        if (existing) {
            // Check if window has expired
            if (existing.window_start_at < windowStart) {
                // Window expired, reset counter
                await db.rateLimit.update({
                    where: { rate_limit_key: rateLimitKey },
                    data: {
                        request_count: 1,
                        window_start_at: now,
                        expires_at: expiresAt,
                    },
                });
                return true;
            }

            // Check if limit exceeded
            if (existing.request_count >= config.limit) {
                const resetTime = new Date(
                    existing.window_start_at.getTime() + config.windowSeconds * 1000
                );
                const secondsUntilReset = Math.ceil(
                    (resetTime.getTime() - now.getTime()) / 1000
                );

                throw new TRPCError({
                    code: "TOO_MANY_REQUESTS",
                    message: `Terlalu banyak permintaan. Coba lagi dalam ${secondsUntilReset} detik.`,
                });
            }

            // Increment counter
            await db.rateLimit.update({
                where: { rate_limit_key: rateLimitKey },
                data: { request_count: { increment: 1 } },
            });
        } else {
            // Create new rate limit record
            await db.rateLimit.create({
                data: {
                    rate_limit_key: rateLimitKey,
                    request_count: 1,
                    window_start_at: now,
                    expires_at: expiresAt,
                },
            });
        }

        return true;
    } catch (error) {
        if (error instanceof TRPCError) {
            throw error;
        }
        // If rate limiting fails, allow the request (fail open)
        console.error("Rate limit check failed:", error);
        return true;
    }
}

/**
 * Create a rate-limited version of a procedure
 * Can be used as middleware in tRPC procedures
 * 
 * Example usage:
 * ```typescript
 * .use(rateLimitMiddleware("listing.create"))
 * ```
 */
export function rateLimitMiddleware(endpoint: string) {
    return async ({ ctx, next }: { ctx: any; next: () => Promise<any> }) => {
        // Use user ID if available, otherwise use a placeholder
        // In production, you'd want to get the IP from the request
        const key = ctx.session?.user?.id || "anonymous";
        await checkRateLimit(key, endpoint);
        return next();
    };
}

/**
 * Clean up expired rate limit records
 * Should be called periodically (e.g., via cron job)
 */
export async function cleanupExpiredRateLimits(): Promise<number> {
    const result = await db.rateLimit.deleteMany({
        where: {
            expires_at: { lt: new Date() },
        },
    });
    return result.count;
}
