/**
 * Dispute Router Tests
 *
 * Tests dispute creation, evidence management, and retrieval.
 */
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { type inferProcedureInput } from "@trpc/server";
import { type AppRouter } from "@/server/api/root";
import { createInnerTRPCContext } from "@/server/api/trpc";
import { disputeRouter } from "@/server/api/routers/dispute";
import { TRPCError } from "@trpc/server";
import {
    createTestCaller,
    createUnauthenticatedContext,
    createBuyerContext,
    testEmail,
    cleanupTestUser,
    cleanupTestListing,
    db,
} from "./helpers/testContext";
import { TransactionStatus, ListingStatus, DisputeStatus } from "@prisma/client";

// Mock rate limiter
vi.mock("@/lib/rate-limit", () => ({
    checkRateLimit: vi.fn().mockResolvedValue({ success: true }),
    userRateLimitKey: vi.fn((action: string, userId: string) => `test:${action}:${userId}`),
}));

// Mock notifications to avoid foreign key issues or side effects
vi.mock("@/server/api/routers/notification", () => ({
    createNotification: vi.fn(),
}));

describe("Dispute Router", () => {
    const testEmails: string[] = [];
    const testListingIds: string[] = [];
    const testTransactionIds: string[] = [];
    const testDisputeIds: string[] = [];

    let testSellerId: string;
    let testBuyerId: string;
    let testCategoryId: string;

    beforeAll(async () => {
        // Create Seller
        const sellerEmail = testEmail();
        testEmails.push(sellerEmail);
        const seller = await db.user.create({
            data: {
                email: sellerEmail,
                name: "Test Seller Dispute",
                role: "SELLER",
                is_verified: true,
            },
        });
        testSellerId = seller.user_id;

        // Create Buyer
        const buyerEmail = testEmail();
        testEmails.push(buyerEmail);
        const buyer = await db.user.create({
            data: {
                email: buyerEmail,
                name: "Test Buyer Dispute",
                role: "BUYER",
                is_verified: true,
            },
        });
        testBuyerId = buyer.user_id;

        // Get Category
        let category = await db.category.findFirst();
        if (!category) {
            category = await db.category.create({
                data: {
                    name: "Dispute Test Category",
                    slug: "dispute-test-category",
                },
            });
        }
        testCategoryId = category.category_id;
    });

    afterAll(async () => {
        for (const id of testDisputeIds) {
            try {
                await db.evidence.deleteMany({ where: { dispute_id: id } });
                await db.dispute.delete({ where: { dispute_id: id } });
            } catch { }
        }
        for (const id of testTransactionIds) {
            try {
                await db.payment.deleteMany({ where: { transaction_id: id } });
                await db.message.deleteMany({ where: { transaction_id: id } });
                // Dispute cascade delete usually handles dispute deletion, but explicit is safer
                await db.transaction.delete({ where: { transaction_id: id } });
            } catch { }
        }
        for (const id of testListingIds) {
            await cleanupTestListing(id);
        }
        for (const email of testEmails) {
            await cleanupTestUser(email);
        }
    });

    // Helper to create a transaction in a specific status
    const createTestTransaction = async (status: TransactionStatus = TransactionStatus.ITEM_TRANSFERRED) => {
        const listing = await db.listing.create({
            data: {
                seller_id: testSellerId,
                title: "Dispute Test Item",
                description: "Item for dispute testing",
                price: 50000,
                category_id: testCategoryId,
                status: ListingStatus.SOLD,
            },
        });
        testListingIds.push(listing.listing_id);

        const transaction = await db.transaction.create({
            data: {
                listing_id: listing.listing_id,
                buyer_id: testBuyerId,
                seller_id: testSellerId,
                transaction_amount: 50000,
                platform_fee_amount: 2500,
                seller_payout_amount: 47500,
                status: status,
                verification_deadline: status === TransactionStatus.ITEM_TRANSFERRED
                    ? new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
                    : undefined,
            },
        });
        testTransactionIds.push(transaction.transaction_id);

        return transaction;
    };

    describe("create", () => {
        it("should allow buyer to create dispute for eligible transaction", async () => {
            const transaction = await createTestTransaction(TransactionStatus.ITEM_TRANSFERRED);

            const caller = createTestCaller(createBuyerContext({ id: testBuyerId }));

            const result = await caller.dispute.create({
                transaction_id: transaction.transaction_id,
                category: "NOT_AS_DESCRIBED",
                description: "Item received matches description partially but has defects. ".repeat(3), // > 20 chars
            });

            testDisputeIds.push(result.dispute_id);

            expect(result).toBeDefined();
            expect(result.dispute_id).toBeDefined();
            expect(result.status).toBe(DisputeStatus.OPEN);

            // Verify transaction status updated
            const updatedTx = await db.transaction.findUnique({
                where: { transaction_id: transaction.transaction_id },
            });
            expect(updatedTx?.status).toBe(TransactionStatus.DISPUTED);
        });

        it("should fail if description is too short", async () => {
            const transaction = await createTestTransaction(TransactionStatus.ITEM_TRANSFERRED);

            const caller = createTestCaller(createBuyerContext({ id: testBuyerId }));

            await expect(
                caller.dispute.create({
                    transaction_id: transaction.transaction_id,
                    category: "OTHER",
                    description: "Too short",
                })
            ).rejects.toThrow();
        });

        it("should fail if transaction status is not ITEM_TRANSFERRED", async () => {
            // Test with COMPLETED status
            const transaction = await createTestTransaction(TransactionStatus.COMPLETED);

            const caller = createTestCaller(createBuyerContext({ id: testBuyerId }));

            await expect(
                caller.dispute.create({
                    transaction_id: transaction.transaction_id,
                    category: "FRAUD",
                    description: "Fraudulent transaction attempt. ".repeat(2),
                })
            ).rejects.toThrow("Dispute hanya dapat dibuat setelah penjual mengirim item");
        });

        it("should fail if user is not the buyer", async () => {
            const transaction = await createTestTransaction(TransactionStatus.ITEM_TRANSFERRED);

            // Try as Seller
            const caller = createTestCaller(createBuyerContext({ id: testSellerId })); // Reusing createBuyerContext just for auth context structure

            await expect(
                caller.dispute.create({
                    transaction_id: transaction.transaction_id,
                    category: "OTHER",
                    description: "Seller trying to dispute own sale. ".repeat(2),
                })
            ).rejects.toThrow("Hanya pembeli yang dapat membuat dispute");
        });

        it("should fail if dispute already exists", async () => {
            const transaction = await createTestTransaction(TransactionStatus.ITEM_TRANSFERRED);
            const caller = createTestCaller(createBuyerContext({ id: testBuyerId }));

            // First creation
            const dispute = await caller.dispute.create({
                transaction_id: transaction.transaction_id,
                category: "ACCESS_ISSUE",
                description: "First dispute creation. ".repeat(2),
            });
            testDisputeIds.push(dispute.dispute_id);

            // Second creation attempt
            await expect(
                caller.dispute.create({
                    transaction_id: transaction.transaction_id,
                    category: "ACCESS_ISSUE",
                    description: "Second dispute creation attempt. ".repeat(2),
                })
            ).rejects.toThrow("Dispute sudah dibuat untuk transaksi ini");
        });
    });

    describe("getById", () => {
        it("should retrieve dispute details", async () => {
            const transaction = await createTestTransaction(TransactionStatus.ITEM_TRANSFERRED);
            const caller = createTestCaller(createBuyerContext({ id: testBuyerId }));

            const created = await caller.dispute.create({
                transaction_id: transaction.transaction_id,
                category: "NOT_AS_DESCRIBED",
                description: "Test description for retrieval. ".repeat(2),
            });
            testDisputeIds.push(created.dispute_id);

            const retrieved = await caller.dispute.getById({ id: created.dispute_id });

            expect(retrieved.dispute_id).toBe(created.dispute_id);
            expect(retrieved.description).toContain("Test description");
            expect(retrieved.transaction.transaction_id).toBe(transaction.transaction_id);
        });
    });

    // Additional tests for evidence can be added here
});
