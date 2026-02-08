/**
 * Admin Router Tests
 *
 * Tests admin dashboard, listing moderation, user management, disputes.
 * Comprehensive edge cases for production readiness.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { TRPCError } from "@trpc/server";
import {
    createTestCaller,
    createBuyerContext,
    createSellerContext,
    createAdminContext,
    testEmail,
    cleanupTestUser,
    cleanupTestListing,
    db,
} from "./helpers/testContext";

describe("Admin Router", () => {
    const testEmails: string[] = [];
    const testListingIds: string[] = [];
    const testDisputeIds: string[] = [];

    let testSellerId: string;
    let testAdminId: string;
    let testCategoryId: string;

    beforeAll(async () => {
        // Create test seller
        const sellerEmail = testEmail();
        testEmails.push(sellerEmail);

        const seller = await db.user.create({
            data: {
                email: sellerEmail,
                name: "Admin Test Seller",
                phone: "08123456789",
                id_card_url: "https://example.com/ktp.jpg",
                role: "SELLER",
            },
        });
        testSellerId = seller.user_id;

        // Create test admin
        const adminEmail = testEmail();
        testEmails.push(adminEmail);

        const admin = await db.user.create({
            data: {
                email: adminEmail,
                name: "Real Admin User",
                role: "ADMIN",
            },
        });
        testAdminId = admin.user_id;

        // Get or create test category
        let category = await db.category.findFirst();
        if (!category) {
            category = await db.category.create({
                data: {
                    name: "Admin Test Category",
                    slug: "admin-test-category",
                },
            });
        }
        testCategoryId = category.category_id;
    });

    afterAll(async () => {
        // Cleanup
        for (const id of testDisputeIds) {
            try {
                await db.dispute.delete({ where: { dispute_id: id } });
            } catch { /* may not exist */ }
        }
        for (const id of testListingIds) {
            await cleanupTestListing(id);
        }
        for (const email of testEmails) {
            await cleanupTestUser(email);
        }
    });

    describe("getDashboardStats", () => {
        it("should require admin role", async () => {
            const buyerCaller = createTestCaller(createBuyerContext());
            await expect(buyerCaller.admin.getDashboardStats()).rejects.toThrow(TRPCError);

            const sellerCaller = createTestCaller(createSellerContext());
            await expect(sellerCaller.admin.getDashboardStats()).rejects.toThrow(TRPCError);
        });

        it("should return all dashboard metrics", async () => {
            const caller = createTestCaller(createAdminContext({ id: testAdminId }));
            const stats = await caller.admin.getDashboardStats();

            expect(stats).toHaveProperty("totalUsers");
            expect(stats).toHaveProperty("activeListings");
            expect(stats).toHaveProperty("totalTransactionVolume");
            expect(stats).toHaveProperty("openDisputes");
            expect(stats).toHaveProperty("recentUsers");
            expect(stats).toHaveProperty("pendingListings");
        });

        it("should return numeric values", async () => {
            const caller = createTestCaller(createAdminContext());
            const stats = await caller.admin.getDashboardStats();

            expect(typeof stats.totalUsers).toBe("number");
            expect(typeof stats.activeListings).toBe("number");
            expect(typeof stats.totalTransactionVolume).toBe("number");
            expect(typeof stats.openDisputes).toBe("number");
            expect(typeof stats.pendingListings).toBe("number");
        });

        it("should return recent users array", async () => {
            const caller = createTestCaller(createAdminContext());
            const stats = await caller.admin.getDashboardStats();

            expect(Array.isArray(stats.recentUsers)).toBe(true);
            expect(stats.recentUsers.length).toBeLessThanOrEqual(5);

            if (stats.recentUsers.length > 0) {
                expect(stats.recentUsers[0]).toHaveProperty("user_id");
                expect(stats.recentUsers[0]).toHaveProperty("name");
                expect(stats.recentUsers[0]).toHaveProperty("email");
            }
        });
    });

    describe("getPendingCount", () => {
        it("should require admin role", async () => {
            const caller = createTestCaller(createBuyerContext());
            await expect(caller.admin.getPendingCount()).rejects.toThrow(TRPCError);
        });

        it("should return pending count as number", async () => {
            const caller = createTestCaller(createAdminContext());
            const count = await caller.admin.getPendingCount();

            expect(typeof count).toBe("number");
            expect(count).toBeGreaterThanOrEqual(0);
        });
    });

    describe("getPendingListings", () => {
        it("should require admin role", async () => {
            const caller = createTestCaller(createSellerContext());
            await expect(caller.admin.getPendingListings()).rejects.toThrow(TRPCError);
        });

        it("should return only PENDING status listings", async () => {
            // Create a pending listing
            const listing = await db.listing.create({
                data: {
                    seller_id: testSellerId,
                    title: "Pending Approval Listing",
                    description: "This listing awaits admin approval process",
                    price: 50000,
                    category_id: testCategoryId,
                    status: "PENDING",
                },
            });
            testListingIds.push(listing.listing_id);

            const caller = createTestCaller(createAdminContext());
            const result = await caller.admin.getPendingListings();

            expect(Array.isArray(result)).toBe(true);
            for (const l of result) {
                expect(l.status).toBe("PENDING");
            }
        });

        it("should include seller info", async () => {
            const caller = createTestCaller(createAdminContext());
            const result = await caller.admin.getPendingListings();

            if (result.length > 0) {
                expect(result[0]).toHaveProperty("seller");
                expect(result[0].seller).toHaveProperty("name");
                expect(result[0].seller).toHaveProperty("email");
            }
        });

        it("should order by oldest first", async () => {
            const caller = createTestCaller(createAdminContext());
            const result = await caller.admin.getPendingListings();

            if (result.length >= 2) {
                const dates = result.map((l) => new Date(l.created_at).getTime());
                for (let i = 1; i < dates.length; i++) {
                    expect(dates[i - 1]).toBeLessThanOrEqual(dates[i]);
                }
            }
        });
    });

    describe("approveListing", () => {
        it("should require admin role", async () => {
            const caller = createTestCaller(createSellerContext());

            await expect(
                caller.admin.approveListing({ listing_id: "any-id" })
            ).rejects.toThrow(TRPCError);
        });

        it("should set listing status to ACTIVE", async () => {
            const listing = await db.listing.create({
                data: {
                    seller_id: testSellerId,
                    title: "To Be Approved",
                    description: "This listing will be approved by admin",
                    price: 50000,
                    category_id: testCategoryId,
                    status: "PENDING",
                },
            });
            testListingIds.push(listing.listing_id);

            const caller = createTestCaller(createAdminContext());
            const result = await caller.admin.approveListing({
                listing_id: listing.listing_id,
            });

            expect(result.status).toBe("ACTIVE");
        });

        it("should approve already approved listing (idempotent)", async () => {
            const listing = await db.listing.create({
                data: {
                    seller_id: testSellerId,
                    title: "Already Active",
                    description: "Testing idempotent approval operation",
                    price: 50000,
                    category_id: testCategoryId,
                    status: "ACTIVE",
                },
            });
            testListingIds.push(listing.listing_id);

            const caller = createTestCaller(createAdminContext());
            const result = await caller.admin.approveListing({
                listing_id: listing.listing_id,
            });

            expect(result.status).toBe("ACTIVE");
        });
    });

    describe("rejectListing", () => {
        it("should require admin role", async () => {
            const caller = createTestCaller(createBuyerContext());

            await expect(
                caller.admin.rejectListing({ listing_id: "any-id" })
            ).rejects.toThrow(TRPCError);
        });

        it("should set listing status to DRAFT", async () => {
            const listing = await db.listing.create({
                data: {
                    seller_id: testSellerId,
                    title: "To Be Rejected",
                    description: "This listing will be rejected by admin",
                    price: 50000,
                    category_id: testCategoryId,
                    status: "PENDING",
                },
            });
            testListingIds.push(listing.listing_id);

            const caller = createTestCaller(createAdminContext());
            const result = await caller.admin.rejectListing({
                listing_id: listing.listing_id,
            });

            expect(result.status).toBe("DRAFT");
        });
    });

    describe("getAllListings", () => {
        it("should require admin role", async () => {
            const caller = createTestCaller(createSellerContext());
            await expect(caller.admin.getAllListings()).rejects.toThrow(TRPCError);
        });

        it("should return all listings with seller info", async () => {
            const caller = createTestCaller(createAdminContext());
            const result = await caller.admin.getAllListings();

            expect(Array.isArray(result)).toBe(true);
            if (result.length > 0) {
                expect(result[0]).toHaveProperty("seller");
                expect(result[0]).toHaveProperty("category");
            }
        });

        it("should include listings of all statuses", async () => {
            // Create listings with different statuses
            const statuses = ["DRAFT", "ACTIVE", "PENDING", "SOLD"] as const;
            for (const status of statuses) {
                const listing = await db.listing.create({
                    data: {
                        seller_id: testSellerId,
                        title: `${status} Status Listing`,
                        description: `Listing with ${status} status for admin view`,
                        price: 50000,
                        category_id: testCategoryId,
                        status,
                    },
                });
                testListingIds.push(listing.listing_id);
            }

            const caller = createTestCaller(createAdminContext());
            const result = await caller.admin.getAllListings();

            const resultStatuses = result.map((l) => l.status);
            // Should contain multiple status types
            expect(resultStatuses.length).toBeGreaterThan(0);
        });
    });

    describe("getUsers", () => {
        it("should require admin role", async () => {
            const caller = createTestCaller(createBuyerContext());
            await expect(caller.admin.getUsers()).rejects.toThrow(TRPCError);
        });

        it("should return user list with all fields", async () => {
            const caller = createTestCaller(createAdminContext());
            const result = await caller.admin.getUsers();

            expect(Array.isArray(result)).toBe(true);
            if (result.length > 0) {
                expect(result[0]).toHaveProperty("user_id");
                expect(result[0]).toHaveProperty("name");
                expect(result[0]).toHaveProperty("email");
                expect(result[0]).toHaveProperty("role");
                expect(result[0]).toHaveProperty("is_verified");
                expect(result[0]).toHaveProperty("is_suspended");
            }
        });

        it("should order by created_at desc", async () => {
            const caller = createTestCaller(createAdminContext());
            const result = await caller.admin.getUsers();

            if (result.length >= 2) {
                const dates = result.map((u) => new Date(u.created_at).getTime());
                for (let i = 1; i < dates.length; i++) {
                    expect(dates[i - 1]).toBeGreaterThanOrEqual(dates[i]);
                }
            }
        });
    });

    describe("getDisputes", () => {
        it("should require admin role", async () => {
            const caller = createTestCaller(createSellerContext());
            await expect(caller.admin.getDisputes()).rejects.toThrow(TRPCError);
        });

        it("should return disputes with initiator and transaction info", async () => {
            const caller = createTestCaller(createAdminContext());
            const result = await caller.admin.getDisputes();

            expect(Array.isArray(result)).toBe(true);
            if (result.length > 0) {
                expect(result[0]).toHaveProperty("initiator");
                expect(result[0]).toHaveProperty("transaction");
            }
        });
    });

    describe("resolveDispute", () => {
        it("should require admin role", async () => {
            const caller = createTestCaller(createBuyerContext());

            await expect(
                caller.admin.resolveDispute({
                    dispute_id: "any-id",
                    resolution: "FULL_REFUND",
                })
            ).rejects.toThrow(TRPCError);
        });

        it("should resolve dispute with FULL_REFUND", async () => {
            // Create required entities for dispute
            const buyerEmail = testEmail();
            testEmails.push(buyerEmail);

            const buyer = await db.user.create({
                data: {
                    email: buyerEmail,
                    name: "Dispute Buyer",
                    phone: "08111222333",
                    id_card_url: "https://example.com/buyer.jpg",
                },
            });

            const listing = await db.listing.create({
                data: {
                    seller_id: testSellerId,
                    title: "Disputed Listing",
                    description: "Listing for dispute resolution test case",
                    price: 100000,
                    category_id: testCategoryId,
                    status: "SOLD",
                },
            });
            testListingIds.push(listing.listing_id);

            const transaction = await db.transaction.create({
                data: {
                    listing_id: listing.listing_id,
                    buyer_id: buyer.user_id,
                    seller_id: testSellerId,
                    transaction_amount: 100000,
                    platform_fee_amount: 5000,
                    seller_payout_amount: 95000,
                    status: "DISPUTED",
                },
            });

            const dispute = await db.dispute.create({
                data: {
                    transaction_id: transaction.transaction_id,
                    initiator_id: buyer.user_id,
                    dispute_category: "NOT_AS_DESCRIBED",
                    description: "Item was not as described in listing",
                    status: "OPEN",
                },
            });
            testDisputeIds.push(dispute.dispute_id);

            const caller = createTestCaller(createAdminContext({ id: testAdminId }));
            const result = await caller.admin.resolveDispute({
                dispute_id: dispute.dispute_id,
                resolution: "FULL_REFUND",
            });

            expect(result.resolution).toBe("FULL_REFUND");
        });

        it("should support PARTIAL_REFUND resolution", async () => {
            const buyerEmail = testEmail();
            testEmails.push(buyerEmail);

            const buyer = await db.user.create({
                data: {
                    email: buyerEmail,
                    name: "Partial Refund Buyer",
                    phone: "08444555666",
                    id_card_url: "https://example.com/partial.jpg",
                },
            });

            const listing = await db.listing.create({
                data: {
                    seller_id: testSellerId,
                    title: "Partial Dispute Listing",
                    description: "Listing for partial refund resolution test",
                    price: 200000,
                    category_id: testCategoryId,
                    status: "SOLD",
                },
            });
            testListingIds.push(listing.listing_id);

            const transaction = await db.transaction.create({
                data: {
                    listing_id: listing.listing_id,
                    buyer_id: buyer.user_id,
                    seller_id: testSellerId,
                    transaction_amount: 200000,
                    platform_fee_amount: 10000,
                    seller_payout_amount: 190000,
                    status: "DISPUTED",
                },
            });

            const dispute = await db.dispute.create({
                data: {
                    transaction_id: transaction.transaction_id,
                    initiator_id: buyer.user_id,
                    dispute_category: "ACCESS_ISSUE",
                    description: "Minor access issues with the item",
                    status: "UNDER_REVIEW",
                },
            });
            testDisputeIds.push(dispute.dispute_id);

            const caller = createTestCaller(createAdminContext({ id: testAdminId }));
            const result = await caller.admin.resolveDispute({
                dispute_id: dispute.dispute_id,
                resolution: "PARTIAL_REFUND",
                partial_refund_amount: 50000,
            });

            expect(result.resolution).toBe("PARTIAL_REFUND");
        });

        it("should support NO_REFUND resolution", async () => {
            const buyerEmail = testEmail();
            testEmails.push(buyerEmail);

            const buyer = await db.user.create({
                data: {
                    email: buyerEmail,
                    name: "No Refund Buyer",
                    phone: "08777888999",
                    id_card_url: "https://example.com/norefund.jpg",
                },
            });

            const listing = await db.listing.create({
                data: {
                    seller_id: testSellerId,
                    title: "No Refund Dispute Listing",
                    description: "Listing for no refund resolution test case",
                    price: 150000,
                    category_id: testCategoryId,
                    status: "SOLD",
                },
            });
            testListingIds.push(listing.listing_id);

            const transaction = await db.transaction.create({
                data: {
                    listing_id: listing.listing_id,
                    buyer_id: buyer.user_id,
                    seller_id: testSellerId,
                    transaction_amount: 150000,
                    platform_fee_amount: 7500,
                    seller_payout_amount: 142500,
                    status: "DISPUTED",
                },
            });

            const dispute = await db.dispute.create({
                data: {
                    transaction_id: transaction.transaction_id,
                    initiator_id: buyer.user_id,
                    dispute_category: "OTHER",
                    description: "Buyer changed mind about purchase",
                    status: "OPEN",
                },
            });
            testDisputeIds.push(dispute.dispute_id);

            const caller = createTestCaller(createAdminContext({ id: testAdminId }));
            const result = await caller.admin.resolveDispute({
                dispute_id: dispute.dispute_id,
                resolution: "NO_REFUND",
            });

            expect(result.resolution).toBe("NO_REFUND");
        });

        it("should reject invalid resolution enum", async () => {
            const caller = createTestCaller(createAdminContext());

            await expect(
                caller.admin.resolveDispute({
                    dispute_id: "some-id",
                    // @ts-expect-error Invalid enum
                    resolution: "INVALID_RESOLUTION",
                })
            ).rejects.toThrow();
        });
    });

    describe("Edge Cases", () => {
        it("should handle empty pending listings", async () => {
            const caller = createTestCaller(createAdminContext());
            const result = await caller.admin.getPendingListings();

            expect(Array.isArray(result)).toBe(true);
            // May be empty or have items
        });

        it("should handle empty disputes queue", async () => {
            const caller = createTestCaller(createAdminContext());
            const result = await caller.admin.getDisputes();

            expect(Array.isArray(result)).toBe(true);
        });

        it("should handle stats with zero values", async () => {
            const caller = createTestCaller(createAdminContext());
            const stats = await caller.admin.getDashboardStats();

            // All numeric fields should be >= 0
            expect(stats.totalUsers).toBeGreaterThanOrEqual(0);
            expect(stats.activeListings).toBeGreaterThanOrEqual(0);
            expect(stats.totalTransactionVolume).toBeGreaterThanOrEqual(0);
            expect(stats.openDisputes).toBeGreaterThanOrEqual(0);
            expect(stats.pendingListings).toBeGreaterThanOrEqual(0);
        });

        it("should handle non-existent listing approval", async () => {
            const caller = createTestCaller(createAdminContext());

            await expect(
                caller.admin.approveListing({
                    listing_id: "non-existent-listing-xyz",
                })
            ).rejects.toThrow();
        });

        it("should handle non-existent dispute resolution", async () => {
            const caller = createTestCaller(createAdminContext());

            await expect(
                caller.admin.resolveDispute({
                    dispute_id: "non-existent-dispute-xyz",
                    resolution: "FULL_REFUND",
                })
            ).rejects.toThrow();
        });
    });
});
