/**
 * User Router Tests
 *
 * Tests user profile, KYC, admin operations.
 * Comprehensive edge cases for production readiness.
 */
import { describe, it, expect, afterAll } from "vitest";
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

describe("User Router", () => {
    const testEmails: string[] = [];

    afterAll(async () => {
        for (const email of testEmails) {
            await cleanupTestUser(email);
        }
    });

    describe("getById", () => {
        it("should return public profile without sensitive fields", async () => {
            const email = testEmail();
            testEmails.push(email);

            const user = await db.user.create({
                data: {
                    email,
                    name: "Public Profile Test",
                    avatar_url: "https://example.com/avatar.jpg",
                    role: "SELLER",
                },
            });

            const caller = createTestCaller(createUnauthenticatedContext());
            const result = await caller.user.getById({ id: user.user_id });

            expect(result.name).toBe("Public Profile Test");
            expect(result.avatar_url).toBe("https://example.com/avatar.jpg");
            expect(result.role).toBe("SELLER");
            // Sensitive fields should NOT be included
            expect(result).not.toHaveProperty("email");
            expect(result).not.toHaveProperty("is_verified");
            expect(result).not.toHaveProperty("is_suspended");
        });

        it("should throw NOT_FOUND for non-existent user", async () => {
            const caller = createTestCaller(createUnauthenticatedContext());

            await expect(
                caller.user.getById({ id: "non-existent-user-12345" })
            ).rejects.toThrow(TRPCError);
        });

        it("should work without authentication", async () => {
            const email = testEmail();
            testEmails.push(email);

            const user = await db.user.create({
                data: {
                    email,
                    name: "Public User",
                },
            });

            const caller = createTestCaller(createUnauthenticatedContext());
            const result = await caller.user.getById({ id: user.user_id });

            expect(result.user_id).toBe(user.user_id);
        });
    });

    describe("update", () => {
        it("should update phone with valid format", async () => {
            const email = testEmail();
            testEmails.push(email);

            const user = await db.user.create({
                data: {
                    email,
                    name: "Phone Update Test",
                },
            });

            const caller = createTestCaller(createBuyerContext({
                id: user.user_id,
            }));

            const result = await caller.user.update({
                phone: "08123456789",
            });

            expect(result.phone).toBe("08123456789");
        });

        it("should reject invalid phone format", async () => {
            const email = testEmail();
            testEmails.push(email);

            const user = await db.user.create({
                data: {
                    email,
                    name: "Invalid Phone Test",
                },
            });

            const caller = createTestCaller(createBuyerContext({
                id: user.user_id,
            }));

            await expect(
                caller.user.update({
                    phone: "123", // Too short
                })
            ).rejects.toThrow();
        });

        it("should reject phone with non-numeric characters", async () => {
            const email = testEmail();
            testEmails.push(email);

            const user = await db.user.create({
                data: {
                    email,
                    name: "Non-numeric Phone",
                },
            });

            const caller = createTestCaller(createBuyerContext({
                id: user.user_id,
            }));

            await expect(
                caller.user.update({
                    phone: "08123-456-789",
                })
            ).rejects.toThrow();
        });

        it("should update name", async () => {
            const email = testEmail();
            testEmails.push(email);

            const user = await db.user.create({
                data: {
                    email,
                    name: "Original Name",
                },
            });

            const caller = createTestCaller(createBuyerContext({
                id: user.user_id,
            }));

            const result = await caller.user.update({
                name: "Updated Name",
            });

            expect(result.name).toBe("Updated Name");
        });

        it("should update id_card_url", async () => {
            const email = testEmail();
            testEmails.push(email);

            const user = await db.user.create({
                data: {
                    email,
                    name: "KYC Test",
                },
            });

            const caller = createTestCaller(createBuyerContext({
                id: user.user_id,
            }));

            const result = await caller.user.update({
                id_card_url: "https://storage.example.com/ktp/123.jpg",
            });

            expect(result.id_card_url).toBe("https://storage.example.com/ktp/123.jpg");
        });

        it("should require authentication", async () => {
            const caller = createTestCaller(createUnauthenticatedContext());

            await expect(
                caller.user.update({ name: "Hacker" })
            ).rejects.toThrow(TRPCError);
        });

        it("should reject suspended user", async () => {
            const caller = createTestCaller(createSuspendedContext());

            await expect(
                caller.user.update({ name: "Suspended Update" })
            ).rejects.toThrow(TRPCError);
        });
    });

    describe("upgradeTier", () => {
        it("should upgrade to PRO", async () => {
            const email = testEmail();
            testEmails.push(email);

            const user = await db.user.create({
                data: {
                    email,
                    name: "Tier Upgrade Test",
                    tier: "FREE",
                },
            });

            const caller = createTestCaller(createBuyerContext({
                id: user.user_id,
            }));

            const result = await caller.user.upgradeTier({ tier: "PRO" });

            expect(result.tier).toBe("PRO");
        });

        it("should upgrade to ENTERPRISE", async () => {
            const email = testEmail();
            testEmails.push(email);

            const user = await db.user.create({
                data: {
                    email,
                    name: "Enterprise Test",
                    tier: "FREE",
                },
            });

            const caller = createTestCaller(createBuyerContext({
                id: user.user_id,
            }));

            const result = await caller.user.upgradeTier({ tier: "ENTERPRISE" });

            expect(result.tier).toBe("ENTERPRISE");
        });

        it("should reject invalid tier", async () => {
            const caller = createTestCaller(createBuyerContext());

            await expect(
                caller.user.upgradeTier({
                    // @ts-expect-error Testing invalid enum
                    tier: "PREMIUM",
                })
            ).rejects.toThrow();
        });
    });

    describe("search (Admin)", () => {
        it("should require admin role", async () => {
            const caller = createTestCaller(createBuyerContext());

            await expect(
                caller.user.search({ query: "test" })
            ).rejects.toThrow(TRPCError);
        });

        it("should search by name", async () => {
            const email = testEmail();
            testEmails.push(email);

            await db.user.create({
                data: {
                    email,
                    name: "UniqueSearchableName12345",
                },
            });

            const caller = createTestCaller(createAdminContext());
            const result = await caller.user.search({ query: "UniqueSearchableName12345" });

            expect(result.users.length).toBeGreaterThan(0);
            expect(result.users[0].name).toBe("UniqueSearchableName12345");
        });

        it("should search by email", async () => {
            const email = testEmail();
            testEmails.push(email);

            await db.user.create({
                data: {
                    email,
                    name: "Email Search Test",
                },
            });

            const caller = createTestCaller(createAdminContext());
            const result = await caller.user.search({ query: email });

            expect(result.users.length).toBeGreaterThan(0);
            expect(result.users[0].email).toBe(email);
        });

        it("should respect limit parameter", async () => {
            const caller = createTestCaller(createAdminContext());
            const result = await caller.user.search({
                query: "test",
                limit: 5,
            });

            expect(result.users.length).toBeLessThanOrEqual(5);
        });

        it("should return pagination cursor", async () => {
            const caller = createTestCaller(createAdminContext());
            const result = await caller.user.search({
                query: "test",
                limit: 1,
            });

            // If there are more users, should have nextCursor
            expect(result).toHaveProperty("nextCursor");
        });
    });

    describe("list (Admin)", () => {
        it("should require admin role", async () => {
            const caller = createTestCaller(createBuyerContext());

            await expect(caller.user.list({})).rejects.toThrow(TRPCError);
        });

        it("should list all users", async () => {
            const caller = createTestCaller(createAdminContext());
            const result = await caller.user.list({});

            expect(result.users).toBeDefined();
            expect(Array.isArray(result.users)).toBe(true);
        });

        it("should filter by role", async () => {
            const caller = createTestCaller(createAdminContext());
            const result = await caller.user.list({ role: "SELLER" });

            for (const user of result.users) {
                expect(user.role).toBe("SELLER");
            }
        });
    });

    describe("deleteAccount", () => {
        it("should require confirmation literal", async () => {
            const email = testEmail();
            testEmails.push(email);

            const user = await db.user.create({
                data: {
                    email,
                    name: "Delete Test",
                },
            });

            const caller = createTestCaller(createBuyerContext({
                id: user.user_id,
            }));

            await expect(
                caller.user.deleteAccount({
                    // @ts-expect-error Wrong confirmation
                    confirmation: "wrong_confirmation",
                })
            ).rejects.toThrow();
        });

        it("should delete account with correct confirmation", async () => {
            const email = testEmail();
            // Don't push to testEmails since it will be deleted

            const user = await db.user.create({
                data: {
                    email,
                    name: "Delete Me",
                },
            });

            const caller = createTestCaller(createBuyerContext({
                id: user.user_id,
            }));

            const result = await caller.user.deleteAccount({
                confirmation: "DELETE_MY_ACCOUNT",
            });

            expect(result.success).toBe(true);

            // Verify deletion
            const deleted = await db.user.findUnique({
                where: { user_id: user.user_id },
            });
            expect(deleted).toBeNull();
        });

        it("should require authentication", async () => {
            const caller = createTestCaller(createUnauthenticatedContext());

            await expect(
                caller.user.deleteAccount({
                    confirmation: "DELETE_MY_ACCOUNT",
                })
            ).rejects.toThrow(TRPCError);
        });
    });

    describe("getStats (Admin)", () => {
        it("should require admin role", async () => {
            const caller = createTestCaller(createBuyerContext());

            await expect(caller.user.getStats()).rejects.toThrow(TRPCError);
        });

        it("should return all stat fields", async () => {
            const caller = createTestCaller(createAdminContext());
            const stats = await caller.user.getStats();

            expect(stats).toHaveProperty("total");
            expect(stats).toHaveProperty("byRole");
            expect(stats.byRole).toHaveProperty("buyer");
            expect(stats.byRole).toHaveProperty("seller");
            expect(stats.byRole).toHaveProperty("admin");
            expect(stats).toHaveProperty("verified");
            expect(stats).toHaveProperty("suspended");
        });

        it("should return numeric values", async () => {
            const caller = createTestCaller(createAdminContext());
            const stats = await caller.user.getStats();

            expect(typeof stats.total).toBe("number");
            expect(typeof stats.verified).toBe("number");
            expect(typeof stats.suspended).toBe("number");
        });
    });

    describe("Edge Cases", () => {
        it("should handle case-insensitive search", async () => {
            const email = testEmail();
            testEmails.push(email);

            await db.user.create({
                data: {
                    email,
                    name: "UPPERCASE NAME",
                },
            });

            const caller = createTestCaller(createAdminContext());
            const result = await caller.user.search({ query: "uppercase name" });

            expect(result.users.length).toBeGreaterThan(0);
        });

        it("should handle empty search results", async () => {
            const caller = createTestCaller(createAdminContext());
            const result = await caller.user.search({
                query: "nonexistent_user_xyz_123_456",
            });

            expect(result.users).toEqual([]);
            expect(result.nextCursor).toBeUndefined();
        });

        it("should handle Unicode in name update", async () => {
            const email = testEmail();
            testEmails.push(email);

            const user = await db.user.create({
                data: {
                    email,
                    name: "Unicode Test",
                },
            });

            const caller = createTestCaller(createBuyerContext({
                id: user.user_id,
            }));

            const result = await caller.user.update({
                name: "用户名 🎮 Émoji",
            });

            expect(result.name).toBe("用户名 🎮 Émoji");
        });

        it("should store id_card_url as-is (sanitization at output)", async () => {
            const email = testEmail();
            testEmails.push(email);

            const user = await db.user.create({
                data: {
                    email,
                    name: "URL Storage Test",
                },
            });

            const caller = createTestCaller(createBuyerContext({
                id: user.user_id,
            }));

            // URL is stored as-is, XSS prevention happens at output/rendering
            const result = await caller.user.update({
                id_card_url: "javascript:alert('xss')",
            });

            expect(result.id_card_url).toBe("javascript:alert('xss')");
        });
    });
});
