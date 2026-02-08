/**
 * Wishlist Router Tests
 *
 * Tests wishlist toggle, check, and retrieval.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { TRPCError } from "@trpc/server";
import {
    createTestCaller,
    createUnauthenticatedContext,
    createBuyerContext,
    testEmail,
    cleanupTestUser,
    cleanupTestListing,
    db,
    createSellerContext,
} from "./helpers/testContext";

describe("Wishlist Router", () => {
    // Track created resources for cleanup
    const testEmails: string[] = [];
    const testListingIds: string[] = [];

    let testSellerId: string;
    let testCategoryId: string;
    let testListingId: string;

    beforeAll(async () => {
        // Create test seller
        const sellerEmail = testEmail();
        testEmails.push(sellerEmail);

        const seller = await db.user.create({
            data: {
                email: sellerEmail,
                name: "Wishlist Test Seller",
                role: "SELLER",
            },
        });
        testSellerId = seller.user_id;

        // Get or create test category
        let category = await db.category.findFirst();
        if (!category) {
            category = await db.category.create({
                data: {
                    name: "Wishlist Test Category",
                    slug: "wishlist-test-category",
                },
            });
        }
        testCategoryId = category.category_id;

        // Create a test listing
        const listing = await db.listing.create({
            data: {
                seller_id: testSellerId,
                title: "Wishlist Test Item",
                description: "Item for wishlist testing",
                price: 50000,
                category_id: testCategoryId,
                status: "ACTIVE",
            },
        });
        testListingId = listing.listing_id;
        testListingIds.push(testListingId);
    });

    afterAll(async () => {
        // Clean up listings first
        for (const id of testListingIds) {
            await cleanupTestListing(id);
        }
        // Then users
        for (const email of testEmails) {
            await cleanupTestUser(email);
        }
    });

    const createTestUser = async () => {
        const email = testEmail();
        testEmails.push(email);
        const user = await db.user.create({
            data: {
                email,
                name: "Wishlist Test User",
            },
        });
        return user;
    };

    describe("toggle", () => {
        it("should require authentication", async () => {
            const caller = createTestCaller(createUnauthenticatedContext());
            await expect(
                caller.wishlist.toggle({ listingId: testListingId })
            ).rejects.toThrow(TRPCError);
        });

        it("should add item to wishlist if not present", async () => {
            const user = await createTestUser();
            const caller = createTestCaller(createBuyerContext({ id: user.user_id }));

            const result = await caller.wishlist.toggle({ listingId: testListingId });
            expect(result.added).toBe(true);

            // Verify in DB
            const saved = await db.wishlist.findUnique({
                where: {
                    user_id_listing_id: {
                        user_id: user.user_id,
                        listing_id: testListingId,
                    },
                },
            });
            expect(saved).not.toBeNull();
        });

        it("should remove item from wishlist if present", async () => {
            const user = await createTestUser();
            const caller = createTestCaller(createBuyerContext({ id: user.user_id }));

            // Add first
            await caller.wishlist.toggle({ listingId: testListingId });

            // Remove
            const result = await caller.wishlist.toggle({ listingId: testListingId });
            expect(result.added).toBe(false);

            // Verify removed from DB
            const saved = await db.wishlist.findUnique({
                where: {
                    user_id_listing_id: {
                        user_id: user.user_id,
                        listing_id: testListingId,
                    },
                },
            });
            expect(saved).toBeNull();
        });
    });

    describe("check", () => {
        it("should return true if item is wishlisted", async () => {
            const user = await createTestUser();
            const caller = createTestCaller(createBuyerContext({ id: user.user_id }));

            await caller.wishlist.toggle({ listingId: testListingId });

            const result = await caller.wishlist.check({ listingId: testListingId });
            expect(result.isWishlisted).toBe(true);
        });

        it("should return false if item is not wishlisted", async () => {
            const user = await createTestUser();
            const caller = createTestCaller(createBuyerContext({ id: user.user_id }));

            const result = await caller.wishlist.check({ listingId: testListingId });
            expect(result.isWishlisted).toBe(false);
        });
    });

    describe("getUserWishlist", () => {
        it("should return empty list for user with no wishlist", async () => {
            const user = await createTestUser();
            const caller = createTestCaller(createBuyerContext({ id: user.user_id }));

            const result = await caller.wishlist.getUserWishlist({});
            expect(result.items).toHaveLength(0);
        });

        it("should return wishlisted items", async () => {
            const user = await createTestUser();
            const caller = createTestCaller(createBuyerContext({ id: user.user_id }));

            await caller.wishlist.toggle({ listingId: testListingId });

            const result = await caller.wishlist.getUserWishlist({});
            expect(result.items).toHaveLength(1);
            expect(result.items[0].listing_id).toBe(testListingId);
            expect(result.items[0].game).toBeDefined(); // Check mapped field
            expect(result.items[0].wishlist_id).toBeDefined();
        });

        it("should support pagination", async () => {
            const user = await createTestUser();
            const caller = createTestCaller(createBuyerContext({ id: user.user_id }));

            // Create 3 listings
            const listings = await Promise.all([
                db.listing.create({
                    data: { seller_id: testSellerId, title: "Item 1", description: "Desc", price: 1000, category_id: testCategoryId, status: "ACTIVE" }
                }),
                db.listing.create({
                    data: { seller_id: testSellerId, title: "Item 2", description: "Desc", price: 2000, category_id: testCategoryId, status: "ACTIVE" }
                }),
                db.listing.create({
                    data: { seller_id: testSellerId, title: "Item 3", description: "Desc", price: 3000, category_id: testCategoryId, status: "ACTIVE" }
                }),
            ]);
            testListingIds.push(...listings.map(l => l.listing_id));

            // Add all to wishlist
            for (const l of listings) {
                await caller.wishlist.toggle({ listingId: l.listing_id });
            }

            // Fetch page 1 (limit 2)
            const page1 = await caller.wishlist.getUserWishlist({ limit: 2 });
            expect(page1.items).toHaveLength(2);
            expect(page1.nextCursor).toBeDefined();

            // Fetch page 2
            const page2 = await caller.wishlist.getUserWishlist({ limit: 2, cursor: page1.nextCursor });
            expect(page2.items).toHaveLength(1);
        });
    });
});
