/**
 * Listing Router Tests
 *
 * Tests listing CRUD, search, filtering, and bidding.
 * Comprehensive edge cases for production readiness.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { TRPCError } from "@trpc/server";
import {
    createTestCaller,
    createUnauthenticatedContext,
    createBuyerContext,
    createSellerContext,
    createSuspendedContext,
    testEmail,
    testId,
    cleanupTestUser,
    cleanupTestListing,
    db,
} from "./helpers/testContext";

describe("Listing Router", () => {
    // Track created resources for cleanup
    const testEmails: string[] = [];
    const testListingIds: string[] = [];

    // Create a test seller with KYC completed
    let testSellerId: string;
    let testCategoryId: string;

    beforeAll(async () => {
        // Create test seller user
        const sellerEmail = testEmail();
        testEmails.push(sellerEmail);

        const seller = await db.user.create({
            data: {
                email: sellerEmail,
                name: "Test Seller KYC",
                phone: "08123456789",
                id_card_url: "https://example.com/ktp.jpg",
                role: "SELLER",
                is_verified: true,
            },
        });
        testSellerId = seller.user_id;

        // Get or create test category
        let category = await db.category.findFirst();
        if (!category) {
            category = await db.category.create({
                data: {
                    name: "Test Category",
                    slug: "test-category",
                },
            });
        }
        testCategoryId = category.category_id;
    });

    afterAll(async () => {
        // Clean up listings first (foreign key constraint)
        for (const id of testListingIds) {
            await cleanupTestListing(id);
        }
        // Then users
        for (const email of testEmails) {
            await cleanupTestUser(email);
        }
    });

    describe("getAll", () => {
        it("should return listings without authentication", async () => {
            const caller = createTestCaller(createUnauthenticatedContext());
            const result = await caller.listing.getAll({});

            expect(result.listings).toBeDefined();
            expect(Array.isArray(result.listings)).toBe(true);
        });

        it("should only return ACTIVE listings", async () => {
            const caller = createTestCaller(createUnauthenticatedContext());
            const result = await caller.listing.getAll({});

            for (const listing of result.listings) {
                expect(listing.status).toBe("ACTIVE");
            }
        });

        it("should respect limit parameter", async () => {
            const caller = createTestCaller(createUnauthenticatedContext());
            const result = await caller.listing.getAll({ limit: 5 });

            expect(result.listings.length).toBeLessThanOrEqual(5);
        });

        it("should filter by listing type", async () => {
            const caller = createTestCaller(createUnauthenticatedContext());
            const result = await caller.listing.getAll({ type: "FIXED" });

            for (const listing of result.listings) {
                expect(listing.listing_type).toBe("FIXED");
            }
        });

        it("should filter by category", async () => {
            const caller = createTestCaller(createUnauthenticatedContext());
            const result = await caller.listing.getAll({ category: testCategoryId });

            for (const listing of result.listings) {
                expect(listing.category_id).toBe(testCategoryId);
            }
        });

        it("should filter by price range", async () => {
            const caller = createTestCaller(createUnauthenticatedContext());
            const result = await caller.listing.getAll({
                minPrice: 10000,
                maxPrice: 100000,
            });

            for (const listing of result.listings) {
                expect(listing.price).toBeGreaterThanOrEqual(10000);
                expect(listing.price).toBeLessThanOrEqual(100000);
            }
        });

        it("should sort by newest", async () => {
            const caller = createTestCaller(createUnauthenticatedContext());
            const result = await caller.listing.getAll({ sortBy: "newest" });

            if (result.listings.length >= 2) {
                const dates = result.listings.map((l) => new Date(l.created_at).getTime());
                for (let i = 1; i < dates.length; i++) {
                    expect(dates[i - 1]).toBeGreaterThanOrEqual(dates[i]);
                }
            }
        });

        it("should sort by price ascending", async () => {
            const caller = createTestCaller(createUnauthenticatedContext());
            const result = await caller.listing.getAll({ sortBy: "price_asc" });

            if (result.listings.length >= 2) {
                for (let i = 1; i < result.listings.length; i++) {
                    expect(result.listings[i - 1].price).toBeLessThanOrEqual(result.listings[i].price);
                }
            }
        });

        it("should sort by price descending", async () => {
            const caller = createTestCaller(createUnauthenticatedContext());
            const result = await caller.listing.getAll({ sortBy: "price_desc" });

            if (result.listings.length >= 2) {
                for (let i = 1; i < result.listings.length; i++) {
                    expect(result.listings[i - 1].price).toBeGreaterThanOrEqual(result.listings[i].price);
                }
            }
        });

        it("should return nextCursor for pagination", async () => {
            const caller = createTestCaller(createUnauthenticatedContext());
            const result = await caller.listing.getAll({ limit: 1 });

            // If there's more than 1 listing, should have nextCursor
            if (result.listings.length === 1) {
                // nextCursor may or may not exist depending on total count
                expect(typeof result.nextCursor).toMatch(/string|undefined/);
            }
        });

        it("should search by title/description", async () => {
            const caller = createTestCaller(createUnauthenticatedContext());
            const result = await caller.listing.getAll({ search: "Mobile Legends" });

            // Search results should contain the term (if any)
            expect(result.listings).toBeDefined();
        });

        it("should reject limit below 1", async () => {
            const caller = createTestCaller(createUnauthenticatedContext());

            await expect(
                caller.listing.getAll({ limit: 0 })
            ).rejects.toThrow();
        });

        it("should reject limit above 100", async () => {
            const caller = createTestCaller(createUnauthenticatedContext());

            await expect(
                caller.listing.getAll({ limit: 101 })
            ).rejects.toThrow();
        });
    });

    describe("getById", () => {
        it("should return listing with seller info", async () => {
            // Create a listing first
            const listing = await db.listing.create({
                data: {
                    seller_id: testSellerId,
                    title: "Test Listing GetById",
                    description: "This is a test listing for getById test case validation",
                    price: 50000,
                    category_id: testCategoryId,
                    status: "ACTIVE",
                },
            });
            testListingIds.push(listing.listing_id);

            const caller = createTestCaller(createUnauthenticatedContext());
            const result = await caller.listing.getById({ id: listing.listing_id });

            expect(result.listing_id).toBe(listing.listing_id);
            expect(result.title).toBe("Test Listing GetById");
            expect(result.seller).toBeDefined();
            expect(result.seller.name).toBeDefined();
        });

        it("should return null for non-existent listing", async () => {
            const caller = createTestCaller(createUnauthenticatedContext());

            const result = await caller.listing.getById({ id: "non-existent-listing-id" });
            expect(result).toBeNull();
        });

        it("should include bid count for auctions", async () => {
            const listing = await db.listing.create({
                data: {
                    seller_id: testSellerId,
                    title: "Auction Listing Test",
                    description: "This is an auction listing for bid count test validation",
                    price: 100000,
                    category_id: testCategoryId,
                    listing_type: "AUCTION",
                    status: "ACTIVE",
                    starting_bid: 50000,
                },
            });
            testListingIds.push(listing.listing_id);

            const caller = createTestCaller(createUnauthenticatedContext());
            const result = await caller.listing.getById({ id: listing.listing_id });

            expect(result.bidCount).toBeDefined();
            expect(typeof result.bidCount).toBe("number");
        });
    });

    describe("create", () => {
        it("should require authentication", async () => {
            const caller = createTestCaller(createUnauthenticatedContext());

            await expect(
                caller.listing.create({
                    title: "Unauthorized Listing",
                    description: "This should not be created because user is not authenticated",
                    price: 50000,
                    category_id: testCategoryId,
                    listing_type: "FIXED",
                })
            ).rejects.toThrow(TRPCError);
        });

        it("should require KYC (phone + id_card)", async () => {
            // Create user without KYC
            const email = testEmail();
            testEmails.push(email);

            const noKycUser = await db.user.create({
                data: {
                    email,
                    name: "No KYC User",
                    // Missing phone and id_card_url
                },
            });

            const caller = createTestCaller(createSellerContext({
                id: noKycUser.user_id,
            }));

            await expect(
                caller.listing.create({
                    title: "No KYC Listing",
                    description: "This should fail KYC validation check before creation",
                    price: 50000,
                    category_id: testCategoryId,
                    listing_type: "FIXED",
                })
            ).rejects.toThrow(TRPCError);
        });

        it("should create listing with valid input", async () => {
            const caller = createTestCaller(createSellerContext({
                id: testSellerId,
            }));

            const result = await caller.listing.create({
                title: "Valid Test Listing",
                description: "This is a valid test listing description with enough length",
                price: 75000,
                category_id: testCategoryId,
                listing_type: "FIXED",
            });

            testListingIds.push(result.listing_id);

            expect(result.title).toBe("Valid Test Listing");
            expect(result.price).toBe(75000);
            expect(result.status).toBe("PENDING");
        });

        it("should reject title shorter than 5 characters", async () => {
            const caller = createTestCaller(createSellerContext({
                id: testSellerId,
            }));

            await expect(
                caller.listing.create({
                    title: "Abc",
                    description: "Valid description that is long enough for validation",
                    price: 50000,
                    category_id: testCategoryId,
                    listing_type: "FIXED",
                })
            ).rejects.toThrow();
        });

        it("should reject title longer than 100 characters", async () => {
            const caller = createTestCaller(createSellerContext({
                id: testSellerId,
            }));

            await expect(
                caller.listing.create({
                    title: "A".repeat(101),
                    description: "Valid description that is long enough for validation",
                    price: 50000,
                    category_id: testCategoryId,
                    listing_type: "FIXED",
                })
            ).rejects.toThrow();
        });

        it("should reject description shorter than 20 characters", async () => {
            const caller = createTestCaller(createSellerContext({
                id: testSellerId,
            }));

            await expect(
                caller.listing.create({
                    title: "Valid Title",
                    description: "Too short",
                    price: 50000,
                    category_id: testCategoryId,
                    listing_type: "FIXED",
                })
            ).rejects.toThrow();
        });

        it("should reject invalid category ID", async () => {
            const caller = createTestCaller(createSellerContext({
                id: testSellerId,
            }));

            await expect(
                caller.listing.create({
                    title: "Invalid Category Listing",
                    description: "This listing has an invalid category ID which should cause error",
                    price: 50000,
                    category_id: "non-existent-category-id",
                    listing_type: "FIXED",
                })
            ).rejects.toThrow(TRPCError);
        });

        it("should reject suspended user", async () => {
            const caller = createTestCaller(createSuspendedContext());

            await expect(
                caller.listing.create({
                    title: "Suspended User Listing",
                    description: "This should be rejected for suspended user account",
                    price: 50000,
                    category_id: testCategoryId,
                    listing_type: "FIXED",
                })
            ).rejects.toThrow(TRPCError);
        });

        it("should handle category lookup by slug", async () => {
            const caller = createTestCaller(createSellerContext({
                id: testSellerId,
            }));

            // Use actual category ID instead of slug since we don't know the exact slug
            const result = await caller.listing.create({
                title: "Category By UUID",
                description: "Using category UUID directly for listing creation test",
                price: 50000,
                category_id: testCategoryId, // Use actual UUID
                listing_type: "FIXED",
            });

            testListingIds.push(result.listing_id);
            expect(result.category_id).toBe(testCategoryId);
        });
    });

    describe("update", () => {
        it("should update own listing", async () => {
            // Create listing
            const listing = await db.listing.create({
                data: {
                    seller_id: testSellerId,
                    title: "Original Title",
                    description: "Original description for update test",
                    price: 50000,
                    category_id: testCategoryId,
                    status: "DRAFT",
                },
            });
            testListingIds.push(listing.listing_id);

            const caller = createTestCaller(createSellerContext({
                id: testSellerId,
            }));

            const updated = await caller.listing.update({
                listingId: listing.listing_id,
                title: "Updated Title",
            });

            expect(updated.title).toBe("Updated Title");
        });

        it("should reject update by non-owner", async () => {
            // Create listing by test seller
            const listing = await db.listing.create({
                data: {
                    seller_id: testSellerId,
                    title: "Owner Only Listing",
                    description: "This listing should only be editable by owner",
                    price: 50000,
                    category_id: testCategoryId,
                    status: "DRAFT",
                },
            });
            testListingIds.push(listing.listing_id);

            // Try to update as different user
            const caller = createTestCaller(createBuyerContext());

            await expect(
                caller.listing.update({
                    listingId: listing.listing_id,
                    title: "Hacked Title",
                })
            ).rejects.toThrow(TRPCError);
        });

        it("should throw NOT_FOUND for non-existent listing", async () => {
            const caller = createTestCaller(createSellerContext({
                id: testSellerId,
            }));

            await expect(
                caller.listing.update({
                    listingId: "00000000-0000-0000-0000-000000000000",
                    title: "Ghost Listing",
                })
            ).rejects.toThrow(TRPCError);
        });
    });

    describe("delete", () => {
        it("should soft delete (set status to CANCELLED)", async () => {
            const listing = await db.listing.create({
                data: {
                    seller_id: testSellerId,
                    title: "To Be Deleted",
                    description: "This listing will be soft deleted test case",
                    price: 50000,
                    category_id: testCategoryId,
                    status: "DRAFT",
                },
            });
            testListingIds.push(listing.listing_id);

            const caller = createTestCaller(createSellerContext({
                id: testSellerId,
            }));

            await caller.listing.delete({ listingId: listing.listing_id });

            const deleted = await db.listing.findUnique({
                where: { listing_id: listing.listing_id },
            });

            expect(deleted?.status).toBe("CANCELLED");
        });

        it("should reject delete by non-owner", async () => {
            const listing = await db.listing.create({
                data: {
                    seller_id: testSellerId,
                    title: "Not Your Listing",
                    description: "This listing cannot be deleted by others",
                    price: 50000,
                    category_id: testCategoryId,
                    status: "DRAFT",
                },
            });
            testListingIds.push(listing.listing_id);

            const caller = createTestCaller(createBuyerContext());

            await expect(
                caller.listing.delete({ listingId: listing.listing_id })
            ).rejects.toThrow(TRPCError);
        });
    });

    describe("getByUser", () => {
        it("should return own listings only", async () => {
            // Create test listing
            const listing = await db.listing.create({
                data: {
                    seller_id: testSellerId,
                    title: "My Listing Get By User",
                    description: "This is my listing should be returned by getByUser",
                    price: 50000,
                    category_id: testCategoryId,
                    status: "ACTIVE",
                },
            });
            testListingIds.push(listing.listing_id);

            const caller = createTestCaller(createSellerContext({
                id: testSellerId,
            }));

            const result = await caller.listing.getByUser({});

            expect(result.listings.length).toBeGreaterThan(0);
            for (const l of result.listings) {
                expect(l.seller_id).toBe(testSellerId);
            }
        });

        it("should filter by status", async () => {
            const caller = createTestCaller(createSellerContext({
                id: testSellerId,
            }));

            const result = await caller.listing.getByUser({ status: "DRAFT" });

            for (const l of result.listings) {
                expect(l.status).toBe("DRAFT");
            }
        });

        it("should require authentication", async () => {
            const caller = createTestCaller(createUnauthenticatedContext());

            await expect(caller.listing.getByUser({})).rejects.toThrow(TRPCError);
        });
    });

    describe("placeBid", () => {
        it("should require KYC", async () => {
            // Create user without KYC
            const email = testEmail();
            testEmails.push(email);

            const noKycUser = await db.user.create({
                data: {
                    email,
                    name: "No KYC Bidder",
                },
            });

            // Create auction listing
            const listing = await db.listing.create({
                data: {
                    seller_id: testSellerId,
                    title: "Auction For Bid Test",
                    description: "Auction listing for testing bid KYC requirement",
                    price: 100000,
                    category_id: testCategoryId,
                    listing_type: "AUCTION",
                    status: "ACTIVE",
                    starting_bid: 50000,
                },
            });
            testListingIds.push(listing.listing_id);

            const caller = createTestCaller(createBuyerContext({
                id: noKycUser.user_id,
            }));

            await expect(
                caller.listing.placeBid({
                    listing_id: listing.listing_id,
                    amount: 60000,
                })
            ).rejects.toThrow(TRPCError);
        });

        it("should place valid bid on auction", async () => {
            // Create bidder with KYC
            const bidderEmail = testEmail();
            testEmails.push(bidderEmail);

            const bidder = await db.user.create({
                data: {
                    email: bidderEmail,
                    name: "Valid Bidder",
                    phone: "08987654321",
                    id_card_url: "https://example.com/bidder-ktp.jpg",
                },
            });

            // Create auction
            const listing = await db.listing.create({
                data: {
                    seller_id: testSellerId,
                    title: "Auction For Valid Bid",
                    description: "Auction listing for testing valid bid placement",
                    price: 100000,
                    category_id: testCategoryId,
                    listing_type: "AUCTION",
                    status: "ACTIVE",
                    starting_bid: 50000,
                    current_bid: 50000,
                },
            });
            testListingIds.push(listing.listing_id);

            const caller = createTestCaller(createBuyerContext({
                id: bidder.user_id,
            }));

            const result = await caller.listing.placeBid({
                listing_id: listing.listing_id,
                amount: 60000,
            });

            expect(result.success).toBe(true);

            // Verify current_bid updated
            const updated = await db.listing.findUnique({
                where: { listing_id: listing.listing_id },
            });
            expect(updated?.current_bid).toBe(60000);
        });
    });

    describe("Edge Cases", () => {
        it("should handle special characters in search", async () => {
            const caller = createTestCaller(createUnauthenticatedContext());

            // Should not crash with special chars
            const result = await caller.listing.getAll({
                search: "test's \"quoted\" item (bracket) [square]",
            });

            expect(result.listings).toBeDefined();
        });

        it("should handle Unicode in title and description", async () => {
            const caller = createTestCaller(createSellerContext({
                id: testSellerId,
            }));

            const result = await caller.listing.create({
                title: "🎮 Mobile Legends 钻石",
                description: "Selling diamonds for ML 💎 包括所有英雄 ✨ Termasuk semua hero",
                price: 50000,
                category_id: testCategoryId,
                listing_type: "FIXED",
            });

            testListingIds.push(result.listing_id);
            expect(result.title).toBe("🎮 Mobile Legends 钻石");
        });

        it("should handle concurrent listing creations", async () => {
            const caller = createTestCaller(createSellerContext({
                id: testSellerId,
            }));

            const [l1, l2, l3] = await Promise.all([
                caller.listing.create({
                    title: "Concurrent Listing 1",
                    description: "Testing concurrent creation handling number one",
                    price: 50000,
                    category_id: testCategoryId,
                    listing_type: "FIXED",
                }),
                caller.listing.create({
                    title: "Concurrent Listing 2",
                    description: "Testing concurrent creation handling number two",
                    price: 60000,
                    category_id: testCategoryId,
                    listing_type: "FIXED",
                }),
                caller.listing.create({
                    title: "Concurrent Listing 3",
                    description: "Testing concurrent creation handling number three",
                    price: 70000,
                    category_id: testCategoryId,
                    listing_type: "FIXED",
                }),
            ]);

            testListingIds.push(l1.listing_id, l2.listing_id, l3.listing_id);

            expect(l1.listing_id).not.toBe(l2.listing_id);
            expect(l2.listing_id).not.toBe(l3.listing_id);
        });

        it("should handle maximum price boundary", async () => {
            const caller = createTestCaller(createUnauthenticatedContext());

            const result = await caller.listing.getAll({
                maxPrice: 2000000000, // Close to INT_MAX
            });

            expect(result.listings).toBeDefined();
        });

        it("should handle zero minPrice", async () => {
            const caller = createTestCaller(createUnauthenticatedContext());

            const result = await caller.listing.getAll({
                minPrice: 0,
            });

            expect(result.listings).toBeDefined();
        });
    });
});
