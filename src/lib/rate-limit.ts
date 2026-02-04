/**
 * Rate Limiting Utility
 * Database-backed rate limiting using Prisma RateLimit table
 * 
 * @module lib/rate-limit
 */

import { db } from "@/server/db";

interface RateLimitResult {
    success: boolean;
    remaining: number;
    resetAt: Date;
}

/**
 * Check and increment rate limit for a given key
 * 
 * @param key - Unique identifier (e.g., "payment.create:user_id")
 * @param limit - Maximum requests allowed
 * @param windowSeconds - Time window in seconds
 * @returns Rate limit result with success status and remaining count
 * 
 * @example
 * const result = await checkRateLimit(`message.send:${userId}`, 20, 60);
 * if (!result.success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
 */
export async function checkRateLimit(
    key: string,
    limit: number,
    windowSeconds: number
): Promise<RateLimitResult> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowSeconds * 1000);
    const expiresAt = new Date(now.getTime() + windowSeconds * 1000);

    // Try to find existing rate limit entry
    const existing = await db.rateLimit.findUnique({
        where: { rate_limit_key: key },
    });

    // If exists and window is still valid, increment
    if (existing && existing.window_start_at > windowStart) {
        if (existing.request_count >= limit) {
            return {
                success: false,
                remaining: 0,
                resetAt: existing.expires_at,
            };
        }

        // Increment counter
        const updated = await db.rateLimit.update({
            where: { rate_limit_key: key },
            data: { request_count: { increment: 1 } },
        });

        return {
            success: true,
            remaining: limit - updated.request_count,
            resetAt: updated.expires_at,
        };
    }

    // Create or reset rate limit entry
    const created = await db.rateLimit.upsert({
        where: { rate_limit_key: key },
        create: {
            rate_limit_key: key,
            request_count: 1,
            window_start_at: now,
            expires_at: expiresAt,
        },
        update: {
            request_count: 1,
            window_start_at: now,
            expires_at: expiresAt,
        },
    });

    return {
        success: true,
        remaining: limit - 1,
        resetAt: created.expires_at,
    };
}

/**
 * Build rate limit key for user-scoped operations
 */
export function userRateLimitKey(operation: string, userId: string): string {
    return `${operation}:${userId}`;
}

/**
 * Build rate limit key for IP-scoped operations
 */
export function ipRateLimitKey(operation: string, ip: string): string {
    return `${operation}:ip:${ip}`;
}

/**
 * Cleanup expired rate limit entries
 * Should be called periodically (e.g., via cron job)
 */
export async function cleanupExpiredRateLimits(): Promise<number> {
    const result = await db.rateLimit.deleteMany({
        where: { expires_at: { lt: new Date() } },
    });
    return result.count;
}
