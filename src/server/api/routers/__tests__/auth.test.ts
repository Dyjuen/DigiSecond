/**
 * Auth Router Tests
 *
 * Tests authentication, registration, session, and profile operations.
 * Comprehensive edge cases for production readiness.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";
import {
    createTestCaller,
    createUnauthenticatedContext,
    createBuyerContext,
    createAdminContext,
    createSuspendedContext,
    testEmail,
    cleanupTestUser,
    db,
} from "./helpers/testContext";

describe("Auth Router", () => {
    // Cleanup emails used in tests
    const testEmails: string[] = [];

    afterAll(async () => {
        // Clean up all test users
        for (const email of testEmails) {
            await cleanupTestUser(email);
        }
    });

    describe("getSession", () => {
        it("should return null for unauthenticated user", async () => {
            const caller = createTestCaller(createUnauthenticatedContext());
            const session = await caller.auth.getSession();
            expect(session).toBeNull();
        });

        it("should return session for authenticated user", async () => {
            const caller = createTestCaller(createBuyerContext());
            const session = await caller.auth.getSession();

            expect(session).not.toBeNull();
            expect(session?.user.id).toBe("test-buyer-id");
            expect(session?.user.role).toBe("BUYER");
        });

        it("should include all session fields", async () => {
            const caller = createTestCaller(createBuyerContext({
                name: "Full Session User",
                email: "full@test.com",
            }));
            const session = await caller.auth.getSession();

            expect(session?.user).toMatchObject({
                verified: true,
                suspended: false,
                tier: "FREE",
            });
        });
    });

    describe("register", () => {
        it("should create user with valid input", async () => {
            const email = testEmail();
            testEmails.push(email);

            const caller = createTestCaller(createUnauthenticatedContext());
            const result = await caller.auth.register({
                email,
                password: "SecurePass123",
                name: "New Test User",
            });

            expect(result.email).toBe(email);
            expect(result.name).toBe("New Test User");
            expect(result.is_verified).toBe(false);
            expect(result.user_id).toBeDefined();
        });

        it("should reject duplicate email", async () => {
            const email = testEmail();
            testEmails.push(email);

            const caller = createTestCaller(createUnauthenticatedContext());

            // First registration
            await caller.auth.register({
                email,
                password: "SecurePass123",
                name: "First User",
            });

            // Duplicate should fail
            await expect(
                caller.auth.register({
                    email,
                    password: "AnotherPass123",
                    name: "Duplicate User",
                })
            ).rejects.toThrow(TRPCError);
        });

        it("should reject password shorter than 8 characters", async () => {
            const caller = createTestCaller(createUnauthenticatedContext());

            await expect(
                caller.auth.register({
                    email: testEmail(),
                    password: "short",
                    name: "Short Password",
                })
            ).rejects.toThrow();
        });

        it("should reject empty name", async () => {
            const caller = createTestCaller(createUnauthenticatedContext());

            await expect(
                caller.auth.register({
                    email: testEmail(),
                    password: "ValidPass123",
                    name: "",
                })
            ).rejects.toThrow();
        });

        it("should reject invalid email format", async () => {
            const caller = createTestCaller(createUnauthenticatedContext());

            await expect(
                caller.auth.register({
                    email: "not-an-email",
                    password: "ValidPass123",
                    name: "Invalid Email",
                })
            ).rejects.toThrow();
        });

        it("should handle Unicode names correctly", async () => {
            const email = testEmail();
            testEmails.push(email);

            const caller = createTestCaller(createUnauthenticatedContext());
            const result = await caller.auth.register({
                email,
                password: "SecurePass123",
                name: "用户名 🎮 Émoji",
            });

            expect(result.name).toBe("用户名 🎮 Émoji");
        });

        it("should hash password (not stored as plaintext)", async () => {
            const email = testEmail();
            testEmails.push(email);

            const caller = createTestCaller(createUnauthenticatedContext());
            await caller.auth.register({
                email,
                password: "MySecretPassword123",
                name: "Hashed User",
            });

            const user = await db.user.findUnique({ where: { email } });
            expect(user?.password_hash).not.toBe("MySecretPassword123");
            expect(user?.password_hash).toMatch(/^\$2[aby]\$/); // bcrypt prefix
        });

        it("should reject name exceeding 100 characters", async () => {
            const caller = createTestCaller(createUnauthenticatedContext());
            const longName = "A".repeat(101);

            await expect(
                caller.auth.register({
                    email: testEmail(),
                    password: "ValidPass123",
                    name: longName,
                })
            ).rejects.toThrow();
        });
    });

    describe("getMe", () => {
        it("should return current user profile when authenticated", async () => {
            // First create a real user in DB
            const email = testEmail();
            testEmails.push(email);

            const registerCaller = createTestCaller(createUnauthenticatedContext());
            const registered = await registerCaller.auth.register({
                email,
                password: "SecurePass123",
                name: "GetMe Test",
            });

            // Create context with the real user ID
            const caller = createTestCaller(createBuyerContext({
                id: registered.user_id,
            }));

            const me = await caller.auth.getMe();

            expect(me.email).toBe(email);
            expect(me.name).toBe("GetMe Test");
            expect(me.is_verified).toBe(false);
        });

        it("should throw UNAUTHORIZED for unauthenticated user", async () => {
            const caller = createTestCaller(createUnauthenticatedContext());

            await expect(caller.auth.getMe()).rejects.toThrow(TRPCError);
            await expect(caller.auth.getMe()).rejects.toMatchObject({
                code: "UNAUTHORIZED",
            });
        });

        it("should throw FORBIDDEN for suspended user", async () => {
            const caller = createTestCaller(createSuspendedContext());

            await expect(caller.auth.getMe()).rejects.toThrow(TRPCError);
            await expect(caller.auth.getMe()).rejects.toMatchObject({
                code: "FORBIDDEN",
            });
        });

        it("should throw NOT_FOUND if user deleted from DB", async () => {
            // Pass a user ID that doesn't exist in DB
            const caller = createTestCaller(createBuyerContext({
                id: "non-existent-user-id-12345",
            }));

            await expect(caller.auth.getMe()).rejects.toThrow(TRPCError);
        });
    });

    describe("updateProfile", () => {
        it("should update name only", async () => {
            const email = testEmail();
            testEmails.push(email);

            const registerCaller = createTestCaller(createUnauthenticatedContext());
            const registered = await registerCaller.auth.register({
                email,
                password: "SecurePass123",
                name: "Original Name",
            });

            const caller = createTestCaller(createBuyerContext({
                id: registered.user_id,
            }));

            const updated = await caller.auth.updateProfile({
                name: "Updated Name",
            });

            expect(updated.name).toBe("Updated Name");
        });

        it("should update avatar_url only", async () => {
            const email = testEmail();
            testEmails.push(email);

            const registerCaller = createTestCaller(createUnauthenticatedContext());
            const registered = await registerCaller.auth.register({
                email,
                password: "SecurePass123",
                name: "Avatar Test",
            });

            const caller = createTestCaller(createBuyerContext({
                id: registered.user_id,
            }));

            const updated = await caller.auth.updateProfile({
                avatar_url: "https://example.com/avatar.jpg",
            });

            expect(updated.avatar_url).toBe("https://example.com/avatar.jpg");
        });

        it("should require authentication", async () => {
            const caller = createTestCaller(createUnauthenticatedContext());

            await expect(
                caller.auth.updateProfile({ name: "Hacker" })
            ).rejects.toThrow(TRPCError);
        });

        it("should reject invalid avatar URL", async () => {
            const email = testEmail();
            testEmails.push(email);

            const registerCaller = createTestCaller(createUnauthenticatedContext());
            const registered = await registerCaller.auth.register({
                email,
                password: "SecurePass123",
                name: "Invalid Avatar",
            });

            const caller = createTestCaller(createBuyerContext({
                id: registered.user_id,
            }));

            await expect(
                caller.auth.updateProfile({
                    avatar_url: "not-a-valid-url",
                })
            ).rejects.toThrow();
        });

        it("should handle empty update (no-op)", async () => {
            const email = testEmail();
            testEmails.push(email);

            const registerCaller = createTestCaller(createUnauthenticatedContext());
            const registered = await registerCaller.auth.register({
                email,
                password: "SecurePass123",
                name: "No Op Test",
            });

            const caller = createTestCaller(createBuyerContext({
                id: registered.user_id,
            }));

            // Empty update should work without crashing
            const updated = await caller.auth.updateProfile({});
            expect(updated).toBeDefined();
        });
    });

    describe("requestPasswordReset", () => {
        it("should return ok for existing email", async () => {
            const email = testEmail();
            testEmails.push(email);

            const registerCaller = createTestCaller(createUnauthenticatedContext());
            await registerCaller.auth.register({
                email,
                password: "SecurePass123",
                name: "Reset Test",
            });

            const caller = createTestCaller(createUnauthenticatedContext());
            const result = await caller.auth.requestPasswordReset({ email });

            expect(result.ok).toBe(true);
        });

        it("should throw NOT_FOUND for unknown email", async () => {
            const caller = createTestCaller(createUnauthenticatedContext());

            await expect(
                caller.auth.requestPasswordReset({
                    email: "nonexistent@example.com",
                })
            ).rejects.toThrow(TRPCError);
        });

        it("should reject invalid email format", async () => {
            const caller = createTestCaller(createUnauthenticatedContext());

            await expect(
                caller.auth.requestPasswordReset({
                    email: "invalid-email",
                })
            ).rejects.toThrow();
        });
    });

    describe("toggleUserSuspension (Admin)", () => {
        it("should require admin role", async () => {
            const caller = createTestCaller(createBuyerContext());

            await expect(
                caller.auth.toggleUserSuspension({
                    userId: "some-user-id",
                    suspended: true,
                })
            ).rejects.toThrow(TRPCError);
        });

        it("should suspend user when admin", async () => {
            const email = testEmail();
            testEmails.push(email);

            const registerCaller = createTestCaller(createUnauthenticatedContext());
            const registered = await registerCaller.auth.register({
                email,
                password: "SecurePass123",
                name: "To Suspend",
            });

            const adminCaller = createTestCaller(createAdminContext());
            const result = await adminCaller.auth.toggleUserSuspension({
                userId: registered.user_id,
                suspended: true,
            });

            expect(result.is_suspended).toBe(true);
        });

        it("should unsuspend user when admin", async () => {
            const email = testEmail();
            testEmails.push(email);

            const registerCaller = createTestCaller(createUnauthenticatedContext());
            const registered = await registerCaller.auth.register({
                email,
                password: "SecurePass123",
                name: "To Unsuspend",
            });

            const adminCaller = createTestCaller(createAdminContext());

            // First suspend
            await adminCaller.auth.toggleUserSuspension({
                userId: registered.user_id,
                suspended: true,
            });

            // Then unsuspend
            const result = await adminCaller.auth.toggleUserSuspension({
                userId: registered.user_id,
                suspended: false,
            });

            expect(result.is_suspended).toBe(false);
        });
    });

    describe("changeUserRole (Admin)", () => {
        it("should require admin role", async () => {
            const caller = createTestCaller(createBuyerContext());

            await expect(
                caller.auth.changeUserRole({
                    userId: "some-user-id",
                    role: "SELLER",
                })
            ).rejects.toThrow(TRPCError);
        });

        it("should change user role to SELLER", async () => {
            const email = testEmail();
            testEmails.push(email);

            const registerCaller = createTestCaller(createUnauthenticatedContext());
            const registered = await registerCaller.auth.register({
                email,
                password: "SecurePass123",
                name: "Role Change",
            });

            const adminCaller = createTestCaller(createAdminContext());
            const result = await adminCaller.auth.changeUserRole({
                userId: registered.user_id,
                role: "SELLER",
            });

            expect(result.role).toBe("SELLER");
        });

        it("should change user role to ADMIN", async () => {
            const email = testEmail();
            testEmails.push(email);

            const registerCaller = createTestCaller(createUnauthenticatedContext());
            const registered = await registerCaller.auth.register({
                email,
                password: "SecurePass123",
                name: "New Admin",
            });

            const adminCaller = createTestCaller(createAdminContext());
            const result = await adminCaller.auth.changeUserRole({
                userId: registered.user_id,
                role: "ADMIN",
            });

            expect(result.role).toBe("ADMIN");
        });

        it("should reject invalid role enum", async () => {
            const adminCaller = createTestCaller(createAdminContext());

            await expect(
                adminCaller.auth.changeUserRole({
                    userId: "some-user-id",
                    // @ts-expect-error Testing invalid input
                    role: "INVALID_ROLE",
                })
            ).rejects.toThrow();
        });
    });

    describe("Edge Cases", () => {
        it("should handle SQL injection attempts in email", async () => {
            const caller = createTestCaller(createUnauthenticatedContext());

            await expect(
                caller.auth.register({
                    email: "'; DROP TABLE users; --@test.com",
                    password: "ValidPass123",
                    name: "SQL Injection",
                })
            ).rejects.toThrow(); // Invalid email format
        });

        it("should handle XSS attempts in name", async () => {
            const email = testEmail();
            testEmails.push(email);

            const caller = createTestCaller(createUnauthenticatedContext());
            const result = await caller.auth.register({
                email,
                password: "ValidPass123",
                name: "<script>alert('xss')</script>",
            });

            // Should store as-is (sanitization happens on output)
            expect(result.name).toBe("<script>alert('xss')</script>");
        });

        it("should handle concurrent registrations", async () => {
            const email1 = testEmail();
            const email2 = testEmail();
            testEmails.push(email1, email2);

            const caller = createTestCaller(createUnauthenticatedContext());

            const [result1, result2] = await Promise.all([
                caller.auth.register({
                    email: email1,
                    password: "Pass123456",
                    name: "Concurrent 1",
                }),
                caller.auth.register({
                    email: email2,
                    password: "Pass123456",
                    name: "Concurrent 2",
                }),
            ]);

            expect(result1.user_id).not.toBe(result2.user_id);
        });
    });
});
