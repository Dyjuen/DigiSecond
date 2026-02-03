/**
 * JWT Utility Tests
 * Comprehensive edge case coverage for production readiness
 */
import { describe, it, expect, beforeAll } from "vitest";
import { signJWT, verifyJWT, type JWTPayload } from "../jwt";

describe("JWT Utility", () => {
    const validPayload = {
        sub: "test-user-123",
        email: "test@example.com",
        role: "BUYER" as const,
        tier: "FREE" as const,
        verified: true,
        suspended: false,
    };

    describe("signJWT", () => {
        it("should sign a valid token", () => {
            const token = signJWT(validPayload);
            expect(token).toBeDefined();
            expect(typeof token).toBe("string");
            expect(token.split(".").length).toBe(3); // JWT has 3 parts
        });

        it("should create tokens that can be verified", () => {
            const token = signJWT(validPayload);
            const decoded = verifyJWT(token);

            expect(decoded).not.toBeNull();
            expect(decoded?.sub).toBe(validPayload.sub);
            expect(decoded?.email).toBe(validPayload.email);
            expect(decoded?.role).toBe(validPayload.role);
        });
    });

    describe("verifyJWT - Happy Path", () => {
        it("should verify and decode valid token", () => {
            const token = signJWT(validPayload);
            const decoded = verifyJWT(token);

            expect(decoded).toMatchObject({
                sub: validPayload.sub,
                email: validPayload.email,
                role: validPayload.role,
                tier: validPayload.tier,
                verified: validPayload.verified,
                suspended: validPayload.suspended,
            });

            // Auto-added claims
            expect(decoded?.iat).toBeDefined();
            expect(decoded?.exp).toBeDefined();
        });
    });

    describe("verifyJWT - Time-Based Edge Cases", () => {
        it("should reject expired token", async () => {
            // Create token that expires immediately
            const jwt = await import("jsonwebtoken");
            const token = jwt.default.sign(
                validPayload,
                process.env.NEXTAUTH_SECRET!,
                { expiresIn: "1ms" } // Expires in 1 millisecond
            );

            // Wait for expiration
            await new Promise(resolve => setTimeout(resolve, 10));

            const decoded = verifyJWT(token);
            expect(decoded).toBeNull();
        });

        it("should handle clock skew (future-issued token)", () => {
            const jwt = require("jsonwebtoken");
            const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour in future

            const token = jwt.sign(
                { ...validPayload, iat: futureTime },
                process.env.NEXTAUTH_SECRET!,
                { expiresIn: "30d" }
            );

            // jsonwebtoken library does NOT reject future iat by default
            // This is considered valid per JWT spec (clock skew tolerance)
            // If you want to enforce "not before" claim, use nbf instead
            const decoded = verifyJWT(token);
            expect(decoded).not.toBeNull(); // Current behavior: accepts it
        });
    });

    describe("verifyJWT - Security Edge Cases", () => {
        it("should reject token with tampered signature", () => {
            const token = signJWT(validPayload);

            // Tamper with the signature (last part)
            const parts = token.split(".");
            const tamperedToken = `${parts[0]}.${parts[1]}.INVALID_SIGNATURE`;

            const decoded = verifyJWT(tamperedToken);
            expect(decoded).toBeNull();
        });

        it("should reject token with wrong secret", () => {
            const jwt = require("jsonwebtoken");
            const token = jwt.sign(validPayload, "wrong-secret", { expiresIn: "30d" });

            const decoded = verifyJWT(token);
            expect(decoded).toBeNull();
        });
    });

    describe("verifyJWT - Input Validation Edge Cases", () => {
        it("should reject malformed token (not 3 parts)", () => {
            const decoded = verifyJWT("not.a.valid.jwt.token");
            expect(decoded).toBeNull();
        });

        it("should reject token with bad base64 encoding", () => {
            const decoded = verifyJWT("this-is-not-base64!@#.invalid.token");
            expect(decoded).toBeNull();
        });

        it("should reject empty string", () => {
            const decoded = verifyJWT("");
            expect(decoded).toBeNull();
        });

        it("should reject whitespace-only string", () => {
            const decoded = verifyJWT("   ");
            expect(decoded).toBeNull();
        });
    });

    describe("verifyJWT - Schema Validation Edge Cases", () => {
        it("should reject token missing 'sub' claim", () => {
            const jwt = require("jsonwebtoken");
            const { sub, ...payloadWithoutSub } = validPayload;

            const token = jwt.sign(
                payloadWithoutSub,
                process.env.NEXTAUTH_SECRET!,
                { expiresIn: "30d" }
            );

            const decoded = verifyJWT(token);
            expect(decoded).toBeNull();
        });

        it("should reject token missing 'role' claim", () => {
            const jwt = require("jsonwebtoken");
            const { role, ...payloadWithoutRole } = validPayload;

            const token = jwt.sign(
                payloadWithoutRole,
                process.env.NEXTAUTH_SECRET!,
                { expiresIn: "30d" }
            );

            const decoded = verifyJWT(token);
            expect(decoded).toBeNull();
        });

        it("should reject token missing 'email' claim", () => {
            const jwt = require("jsonwebtoken");
            const { email, ...payloadWithoutEmail } = validPayload;

            const token = jwt.sign(
                payloadWithoutEmail,
                process.env.NEXTAUTH_SECRET!,
                { expiresIn: "30d" }
            );

            const decoded = verifyJWT(token);
            expect(decoded).toBeNull();
        });
    });

    describe("verifyJWT - DoS Protection", () => {
        it("should reject very long token (>10KB)", () => {
            // Create a token with massive payload
            const bloatedPayload = {
                ...validPayload,
                junk: "A".repeat(15000), // 15KB of junk data
            };

            const jwt = require("jsonwebtoken");
            const token = jwt.sign(
                bloatedPayload,
                process.env.NEXTAUTH_SECRET!,
                { expiresIn: "30d" }
            );

            const decoded = verifyJWT(token);
            expect(decoded).toBeNull();
        });
    });

    describe("Integration - Round Trip", () => {
        it("should handle suspended user flag", () => {
            const suspendedPayload = { ...validPayload, suspended: true };
            const token = signJWT(suspendedPayload);
            const decoded = verifyJWT(token);

            expect(decoded?.suspended).toBe(true);
        });

        it("should handle unverified user flag", () => {
            const unverifiedPayload = { ...validPayload, verified: false };
            const token = signJWT(unverifiedPayload);
            const decoded = verifyJWT(token);

            expect(decoded?.verified).toBe(false);
        });

        it("should preserve all user roles", () => {
            const roles = ["BUYER", "SELLER", "ADMIN"] as const;

            roles.forEach(role => {
                const payload = { ...validPayload, role };
                const token = signJWT(payload);
                const decoded = verifyJWT(token);

                expect(decoded?.role).toBe(role);
            });
        });

        it("should preserve all tier levels", () => {
            const tiers = ["FREE", "PRO", "ENTERPRISE"] as const;

            tiers.forEach(tier => {
                const payload = { ...validPayload, tier };
                const token = signJWT(payload);
                const decoded = verifyJWT(token);

                expect(decoded?.tier).toBe(tier);
            });
        });
    });
});
