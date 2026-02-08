import jwt from "jsonwebtoken";
import { type Role } from "@/server/auth";

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET || process.env.NEXTAUTH_SECRET!;

if (!JWT_SECRET) {
    throw new Error("NEXTAUTH_SECRET is not defined in environment variables");
}

/**
 * JWT Payload Structure
 * Matches NextAuth session user shape for consistency
 */
export interface JWTPayload {
    sub: string;      // user_id
    email: string;
    role: Role;
    tier: "FREE" | "PRO" | "ENTERPRISE";
    verified: boolean;
    suspended: boolean;
    iat: number;      // issued at (auto-added by jwt.sign)
    exp: number;      // expiration (auto-added by jwt.sign)
}

/**
 * Sign a JWT token for mobile authentication
 * @param payload - User data to encode (without iat/exp)
 * @returns Signed JWT string
 */
export function signJWT(
    payload: Omit<JWTPayload, "iat" | "exp">
): string {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: "30d",
        algorithm: "HS256",
    });
}

/**
 * Verify and decode a JWT token
 * @param token - JWT string to verify
 * @returns Decoded payload or null if invalid/expired
 */
export function verifyJWT(token: string): JWTPayload | null {
    try {
        // Return null for empty/null tokens
        if (!token || token.trim() === "") {
            return null;
        }

        // Reject tokens that are suspiciously long (DoS protection)
        if (token.length > 10000) {
            console.warn("[JWT] Token exceeds maximum length");
            return null;
        }

        const decoded = jwt.verify(token, JWT_SECRET, {
            algorithms: ["HS256"],
        }) as JWTPayload;

        // Validate required claims exist
        if (!decoded.sub || !decoded.role || !decoded.email) {
            console.warn("[JWT] Token missing required claims");
            return null;
        }

        return decoded;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            console.warn("[JWT] Token expired");
        } else if (error instanceof jwt.JsonWebTokenError) {
            console.warn("[JWT] Invalid token:", error.message);
        } else {
            console.error("[JWT] Verification error:", error);
        }
        return null;
    }
}
