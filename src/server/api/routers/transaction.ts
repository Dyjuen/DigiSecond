
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TransactionStatus, PaymentStatus } from "@prisma/client";

export const transactionRouter = createTRPCRouter({
    create: protectedProcedure
        .input(
            z.object({
                listing_id: z.string(),
                payment_method: z.enum(["VA", "EWALLET", "QRIS", "CARD", "RETAIL"]),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { db, session } = ctx;

            // KYC GUARD
            const user = await db.user.findUnique({ where: { user_id: session.user.id } });
            if (!user?.phone || !user?.id_card_url) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Harap lengkapi profil (No. HP & KTP) sebelum melakukan pembelian.",
                });
            }

            // Get Listing
            const listing = await db.listing.findUnique({
                where: { listing_id: input.listing_id },
            });

            if (!listing) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Listing tidak ditemukan" });
            }

            if (listing.status !== "ACTIVE") {
                throw new TRPCError({ code: "BAD_REQUEST", message: "Listing tidak tersedia" });
            }

            if (listing.seller_id === session.user.id) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "Tidak dapat membeli listing sendiri" });
            }

            // Create Transaction
            const transactionAmt = listing.current_bid || listing.price;
            const fee = Math.floor(transactionAmt * 0.05); // 5% fee
            const payout = transactionAmt - fee;

            const transaction = await db.transaction.create({
                data: {
                    listing_id: input.listing_id,
                    buyer_id: session.user.id,
                    seller_id: listing.seller_id,
                    transaction_amount: transactionAmt,
                    platform_fee_amount: fee,
                    seller_payout_amount: payout,
                    status: TransactionStatus.PENDING_PAYMENT,
                },
            });

            // Create Payment Recod (Mock Xendit)
            await db.payment.create({
                data: {
                    transaction_id: transaction.transaction_id,
                    xendit_payment_id: `mock_xendit_${Date.now()}`,
                    payment_method: input.payment_method,
                    payment_amount: transactionAmt,
                    status: PaymentStatus.PENDING,
                },
            });

            // Update Listing Status
            // In real app, we update listing only after payment success, or reserve it.
            // For MVP simplicty:
            // await db.listing.update({ ... status: "SOLD" ... }) // on webhook

            return transaction;
        }),
});
