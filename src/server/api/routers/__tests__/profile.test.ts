import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
    createTestCaller,
    createUnauthenticatedContext,
    testEmail,
    cleanupTestUser,
    db,
} from "./helpers/testContext";
import { TransactionStatus } from "@prisma/client";

describe("Profile & Review Integration", () => {
    const testEmails: string[] = [];
    const testListingIds: string[] = [];
    const testReviewIds: string[] = [];
    const testTransactionIds: string[] = [];

    let sellerId: string;
    let buyerId: string;
    let categoryId: string;

    beforeAll(async () => {
        // Create Seller
        const sellerEmail = testEmail();
        testEmails.push(sellerEmail);
        const seller = await db.user.create({
            data: {
                email: sellerEmail,
                name: "Test Seller Profile",
                avatar_url: "https://example.com/seller.jpg",
                role: "SELLER",
                is_verified: true,
            },
        });
        sellerId = seller.user_id;

        // Create Buyer
        const buyerEmail = testEmail();
        testEmails.push(buyerEmail);
        const buyer = await db.user.create({
            data: {
                email: buyerEmail,
                name: "Test Buyer Reviewer",
                avatar_url: "https://example.com/buyer.jpg",
                role: "BUYER",
            },
        });
        buyerId = buyer.user_id;

        // Get Category
        let category = await db.category.findFirst();
        if (!category) {
            category = await db.category.create({
                data: { name: "Test Cat", slug: "test-cat" },
            });
        }
        categoryId = category.category_id;
    });

    afterAll(async () => {
        // Cleanup transactions and reviews will be handled by cascade or manual if needed
        // Ideally we should clean up created resources.
        // Cleanup Reviews
        for (const id of testReviewIds) {
            await db.review.deleteMany({ where: { review_id: id } });
        }
        // Cleanup Transactions
        for (const id of testTransactionIds) {
            await db.transaction.deleteMany({ where: { transaction_id: id } });
        }
        // Cleanup Listings
        for (const id of testListingIds) {
            await db.listing.deleteMany({ where: { listing_id: id } });
        }
        // Cleanup Users
        for (const email of testEmails) {
            await cleanupTestUser(email);
        }
    });

    describe("Public Profile (user.getById)", () => {
        it("should return public profile information", async () => {
            const caller = createTestCaller(createUnauthenticatedContext());
            const profile = await caller.user.getById({ id: sellerId });

            expect(profile.user_id).toBe(sellerId);
            expect(profile.name).toBe("Test Seller Profile");
            expect(profile.avatar_url).toBe("https://example.com/seller.jpg");
            expect(profile.role).toBe("SELLER");
            // Sensitive data check
            expect(profile).not.toHaveProperty("email");
            expect(profile).not.toHaveProperty("phone");
        });
    });

    describe("Reviews (review.getByUser)", () => {
        it("should return empty list when no reviews", async () => {
            const caller = createTestCaller(createUnauthenticatedContext());
            const result = await caller.review.getByUser({ user_id: sellerId });

            expect(result.reviews).toEqual([]);
            expect(result.nextCursor).toBeUndefined();
        });

        it("should return reviews after transaction and review creation", async () => {
            // 1. Create Transaction (Completed)
            const listing = await db.listing.create({
                data: {
                    seller_id: sellerId,
                    title: "Item for Review",
                    description: "Desc",
                    price: 10000,
                    category_id: categoryId,
                    status: "SOLD",
                }
            });
            testListingIds.push(listing.listing_id);

            const transaction = await db.transaction.create({
                data: {
                    listing_id: listing.listing_id,
                    buyer_id: buyerId,
                    seller_id: sellerId,
                    transaction_amount: 10000,
                    platform_fee_amount: 500,
                    seller_payout_amount: 9500,
                    status: TransactionStatus.COMPLETED,
                }
            });
            testTransactionIds.push(transaction.transaction_id);

            // 2. Create Review directly via DB to simulate existing data
            // (Or we could use the router if we want to test creation logic too, 
            // but here we focus on reading profile data)
            const review = await db.review.create({
                data: {
                    transaction_id: transaction.transaction_id,
                    reviewer_user_id: buyerId,
                    reviewed_user_id: sellerId,
                    rating_score: 5,
                    review_comment: "Great seller!",
                }
            });
            testReviewIds.push(review.review_id);

            // Update user rating aggregate manually since we bypassed api
            await db.user.update({
                where: { user_id: sellerId },
                data: { rating: 5, rating_count: 1 }
            });

            // 3. Test getByUser
            const caller = createTestCaller(createUnauthenticatedContext());
            const result = await caller.review.getByUser({ user_id: sellerId });

            expect(result.reviews.length).toBe(1);
            expect(result.reviews[0].rating).toBe(5);
            expect(result.reviews[0].comment).toBe("Great seller!");
            expect(result.reviews[0].reviewer.name).toBe("Test Buyer Reviewer");
        });
    });

    describe("Rating Summary (review.getRatingSummary)", () => {
        it("should return correct rating stats", async () => {
            const caller = createTestCaller(createUnauthenticatedContext());
            const summary = await caller.review.getRatingSummary({ user_id: sellerId });

            expect(summary.average).toBe(5);
            expect(summary.count).toBe(1);
            expect(summary.distribution['5']).toBe(1);
            expect(summary.distribution['1']).toBe(0);
        });
    });
});
