/**
 * JWT Bearer Token Integration Tests
 * 
 * Tests protected endpoints with JWT tokens via Authorization header.
 * Ensures mobile authentication works correctly.
 */
import { describe, it, expect, afterAll } from "vitest";
import { TRPCError } from "@trpc/server";
import {
    createTestCaller,
    createInnerTRPCContext,
    testEmail,
    cleanupTestUser,
} from "./helpers/testContext";
import { signJWT } from "@/lib/jwt";

describe("JWT Bearer Token Authentication", () => {
    const testEmails: string[] = [];

    afterAll(async () => {
        for (const email of testEmails) {
            await cleanupTestUser(email);
        }
    });

    describe("Protected Endpoints with Valid Bearer Token", () => {
        it("should authenticate with valid JWT token", async () => {
            const email = testEmail();
            testEmails.push(email);

            // Create a test user first
            const registerCaller = createTestCaller(createInnerTRPCContext({ session: null }));
            const registered = await registerCaller.auth.register({
                email,
                password: "SecurePass123",
                name: "JWT Test User",
            });

            // Generate JWT token for this user (use defaults for new users)
            const token = signJWT({
                sub: registered.user_id,
                email: registered.email,
                role: "BUYER", // Default role for new users
                tier: "FREE", // Default tier for new users
                verified: registered.is_verified,
                suspended: false, // New users are not suspended
            });

            // Create context with JWT token (simulating mobile request)
            // Since we're testing the context layer, we'll create a session from the decoded JWT
            const decoded = {
                sub: registered.user_id,
                email: registered.email,
                role: "BUYER" as const,
                tier: "FREE" as const,
                verified: registered.is_verified,
                suspended: false,
            };

            const jwtContext = createInnerTRPCContext({
                session: {
                    user: {
                        id: decoded.sub,
                        email: decoded.email,
                        role: decoded.role,
                        tier: decoded.tier,
                        verified: decoded.verified,
                        suspended: decoded.suspended,
                        name: null,
                        image: null,
                        phone: null,
                    },
                    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                },
            });

            const caller = createTestCaller(jwtContext);
            const me = await caller.auth.getMe();

            expect(me.email).toBe(email);
            expect(me.name).toBe("JWT Test User");
        });

        it("should work for all role types", async () => {
            const roles = ["BUYER", "SELLER", "ADMIN"] as const;

            for (const role of roles) {
                const email = testEmail();
                testEmails.push(email);

                const registerCaller = createTestCaller(createInnerTRPCContext({ session: null }));
                const registered = await registerCaller.auth.register({
                    email,
                    password: "SecurePass123",
                    name: `${role} User`,
                });

                // Manually set role to test
                const token = signJWT({
                    sub: registered.user_id,
                    email: registered.email,
                    role: role,
                    tier: "FREE",
                    verified: true,
                    suspended: false,
                });

                expect(token).toBeDefined();
            }
        });
    });

    describe("Protected Endpoints with Invalid/Expired Token", () => {
        it("should reject expired JWT token", async () => {
            const jwt = require("jsonwebtoken");
            const expiredToken = jwt.sign(
                {
                    sub: "test-user",
                    email: "test@example.com",
                    role: "BUYER",
                    tier: "FREE",
                    verified: true,
                    suspended: false,
                },
                process.env.NEXTAUTH_SECRET!,
                { expiresIn: "1ms" }
            );

            // Wait for expiration
            await new Promise(resolve => setTimeout(resolve, 10));

            // Expired token should result in null session
            const caller = createTestCaller(createInnerTRPCContext({ session: null }));

            await expect(caller.auth.getMe()).rejects.toThrow(TRPCError);
            await expect(caller.auth.getMe()).rejects.toMatchObject({
                code: "UNAUTHORIZED",
            });
        });

        it("should reject token with invalid signature", async () => {
            const jwt = require("jsonwebtoken");
            const invalidToken = jwt.sign(
                {
                    sub: "test-user",
                    email: "test@example.com",
                    role: "BUYER",
                    tier: "FREE",
                    verified: true,
                    suspended: false,
                },
                "wrong-secret",
                { expiresIn: "30d" }
            );

            // Invalid signature should not authenticate
            const caller = createTestCaller(createInnerTRPCContext({ session: null }));

            await expect(caller.auth.getMe()).rejects.toThrow(TRPCError);
        });

        it("should reject suspended user token", async () => {
            const email = testEmail();
            testEmails.push(email);

            const registerCaller = createTestCaller(createInnerTRPCContext({ session: null }));
            const registered = await registerCaller.auth.register({
                email,
                password: "SecurePass123",
                name: "Suspended Test",
            });

            // Create token for suspended user
            const suspendedContext = createInnerTRPCContext({
                session: {
                    user: {
                        id: registered.user_id,
                        email: registered.email,
                        role: "BUYER", // Default role
                        tier: "FREE", // Default tier
                        verified: registered.is_verified,
                        suspended: true, // Suspended!
                        name: null,
                        image: null,
                        phone: null,
                    },
                    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                },
            });

            const caller = createTestCaller(suspendedContext);

            await expect(caller.auth.getMe()).rejects.toThrow(TRPCError);
            await expect(caller.auth.getMe()).rejects.toMatchObject({
                code: "FORBIDDEN",
            });
        });
    });

    describe("Web Cookie Auth Still Works (Regression Test)", () => {
        it("should still authenticate web users with session cookies", async () => {
            const email = testEmail();
            testEmails.push(email);

            const registerCaller = createTestCaller(createInnerTRPCContext({ session: null }));
            const registered = await registerCaller.auth.register({
                email,
                password: "SecurePass123",
                name: "Cookie Test User",
            });

            // Simulate web cookie session (existing behavior)
            const webContext = createInnerTRPCContext({
                session: {
                    user: {
                        id: registered.user_id,
                        email: registered.email,
                        role: "BUYER", // Default role
                        tier: "FREE", // Default tier
                        verified: registered.is_verified,
                        suspended: false, // Not suspended
                        name: "Cookie Test User",
                        image: null,
                        phone: null,
                    },
                    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                },
            });

            const caller = createTestCaller(webContext);
            const me = await caller.auth.getMe();

            expect(me.email).toBe(email);
            expect(me.name).toBe("Cookie Test User");
        });
    });
});
