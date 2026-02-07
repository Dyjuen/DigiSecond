/**
 * Payment Router
 * Handles Xendit payment integration for transactions
 * 
 * @module server/api/routers/payment
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { PaymentStatus, TransactionStatus, ListingStatus } from "@prisma/client";
import { createXenditInvoice } from "@/lib/xendit";
import { checkRateLimit, userRateLimitKey } from "@/lib/rate-limit";

const createPaymentInput = z.object({
    transaction_id: z.string().uuid("ID transaksi tidak valid"),
    redirect_url: z.string().url().optional(),
});

const getStatusInput = z.object({
    payment_id: z.string().uuid("ID pembayaran tidak valid"),
});

const getByTransactionInput = z.object({
    transaction_id: z.string().uuid("ID transaksi tidak valid"),
});

export const paymentRouter = createTRPCRouter({
    /**
     * Create a Xendit invoice for a transaction
     * 
     * Business Logic:
     * - Validates transaction belongs to buyer
     * - Checks for existing pending payment (idempotency)
     * - Creates Xendit invoice with 24hr expiry
     * - Returns invoice URL for payment
     */
    create: protectedProcedure
        .input(createPaymentInput)
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;
            console.log("[payment.create] Input:", input);
            console.log("[payment.create] Redirect URL:", input.redirect_url);

            // Rate limit: 10 payment attempts per hour
            const rateLimit = await checkRateLimit(
                userRateLimitKey("payment.create", userId),
                10,
                3600
            );
            if (!rateLimit.success) {
                throw new TRPCError({
                    code: "TOO_MANY_REQUESTS",
                    message: "Terlalu banyak percobaan pembayaran. Coba lagi nanti.",
                });
            }

            const transaction = await ctx.db.transaction.findUnique({
                where: { transaction_id: input.transaction_id },
                include: {
                    listing: {
                        select: { title: true },
                    },
                    buyer: {
                        select: { email: true, name: true },
                    },
                    payments: {
                        where: { status: PaymentStatus.PENDING },
                        orderBy: { created_at: "desc" },
                        take: 1,
                    },
                },
            });

            if (!transaction) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Transaksi tidak ditemukan",
                });
            }

            // Only buyer can create payment
            if (transaction.buyer_id !== userId) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Hanya pembeli yang dapat membuat pembayaran",
                });
            }

            // Check transaction status
            if (transaction.status !== TransactionStatus.PENDING_PAYMENT) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Transaksi sudah dibayar atau dibatalkan",
                });
            }

            // Idempotency: return existing pending payment if valid
            const existingPayment = transaction.payments[0];
            const isPlaceholder = existingPayment?.xendit_payment_id.startsWith("pending_");

            if (existingPayment && !isPlaceholder && existingPayment.expires_at && existingPayment.expires_at > new Date()) {
                return {
                    payment_id: existingPayment.payment_id,
                    xendit_id: existingPayment.xendit_payment_id,
                    amount: existingPayment.payment_amount,
                    invoice_url: `https://checkout.xendit.co/web/${existingPayment.xendit_payment_id}`,
                    expires_at: existingPayment.expires_at,
                    is_existing: true,
                };
            }

            // Create Xendit invoice
            const baseUrl = input.redirect_url ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";

            const successRedirectUrl = input.redirect_url
                ? input.redirect_url
                : `${baseUrl}/transactions/${input.transaction_id}?status=success`;

            const failureRedirectUrl = input.redirect_url
                ? input.redirect_url
                : `${baseUrl}/transactions/${input.transaction_id}?status=failed`;

            const invoice = await createXenditInvoice({
                externalId: input.transaction_id,
                amount: transaction.transaction_amount,
                payerEmail: transaction.buyer.email,
                description: `DigiSecond: ${transaction.listing.title}`,
                itemName: transaction.listing.title,
                successRedirectUrl: successRedirectUrl,
                failureRedirectUrl: failureRedirectUrl,
            });

            // Create or update payment record
            const payment = await ctx.db.payment.upsert({
                where: {
                    xendit_payment_id: existingPayment?.xendit_payment_id ?? `none_${Date.now()}`,
                },
                create: {
                    transaction_id: input.transaction_id,
                    xendit_payment_id: invoice.id,
                    payment_method: "VA", // Will be updated by webhook
                    payment_amount: transaction.transaction_amount,
                    status: PaymentStatus.PENDING,
                    expires_at: invoice.expiryDate,
                },
                update: {
                    xendit_payment_id: invoice.id,
                    status: PaymentStatus.PENDING,
                    expires_at: invoice.expiryDate,
                },
            });

            // Audit log
            await ctx.db.auditLog.create({
                data: {
                    entity_type: "Payment",
                    entity_id: payment.payment_id,
                    action_type: "INVOICE_CREATED",
                    action_description: "Xendit invoice created for payment",
                    new_value: {
                        xendit_id: invoice.id,
                        amount: transaction.transaction_amount,
                        expires_at: invoice.expiryDate.toISOString(),
                    },
                    performed_by_user_id: userId,
                },
            });

            return {
                payment_id: payment.payment_id,
                xendit_id: invoice.id,
                amount: payment.payment_amount,
                invoice_url: invoice.invoiceUrl,
                expires_at: invoice.expiryDate,
                is_existing: false,
            };
        }),

    /**
     * Get payment status by payment ID
     */
    getStatus: protectedProcedure
        .input(getStatusInput)
        .query(async ({ ctx, input }) => {
            const payment = await ctx.db.payment.findUnique({
                where: { payment_id: input.payment_id },
                include: {
                    transaction: {
                        select: {
                            buyer_id: true,
                            seller_id: true,
                            status: true,
                        },
                    },
                },
            });

            if (!payment) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Pembayaran tidak ditemukan",
                });
            }

            // Authorization check
            const userId = ctx.session.user.id;
            const isParticipant =
                payment.transaction.buyer_id === userId ||
                payment.transaction.seller_id === userId;
            const isAdmin = ctx.session.user.role === "ADMIN";

            if (!isParticipant && !isAdmin) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Anda tidak memiliki akses",
                });
            }

            return {
                payment_id: payment.payment_id,
                xendit_id: payment.xendit_payment_id,
                status: payment.status,
                amount: payment.payment_amount,
                method: payment.payment_method,
                paid_at: payment.paid_at,
                expires_at: payment.expires_at,
                transaction_status: payment.transaction.status,
            };
        }),

    /**
     * Get all payments for a transaction
     */
    getByTransaction: protectedProcedure
        .input(getByTransactionInput)
        .query(async ({ ctx, input }) => {
            const transaction = await ctx.db.transaction.findUnique({
                where: { transaction_id: input.transaction_id },
                select: { buyer_id: true, seller_id: true },
            });

            if (!transaction) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Transaksi tidak ditemukan",
                });
            }

            // Authorization check
            const userId = ctx.session.user.id;
            const isParticipant =
                transaction.buyer_id === userId || transaction.seller_id === userId;
            const isAdmin = ctx.session.user.role === "ADMIN";

            if (!isParticipant && !isAdmin) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Anda tidak memiliki akses",
                });
            }

            const payments = await ctx.db.payment.findMany({
                where: { transaction_id: input.transaction_id },
                orderBy: { created_at: "desc" },
            });

            return payments;
        }),

    /**
     * Simulate payment success (DEVELOPMENT ONLY)
     * Used for testing the payment flow without actual Xendit
     */
    simulateSuccess: protectedProcedure
        .input(z.object({ payment_id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            // Only allow in development
            if (process.env.NODE_ENV === "production") {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Tidak tersedia di production",
                });
            }

            const payment = await ctx.db.payment.findUnique({
                where: { payment_id: input.payment_id },
                include: {
                    transaction: {
                        include: { listing: true },
                    },
                },
            });

            if (!payment) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Pembayaran tidak ditemukan",
                });
            }

            if (payment.status !== PaymentStatus.PENDING) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Pembayaran sudah diproses",
                });
            }

            const now = new Date();

            // Update payment and transaction in a transaction
            await ctx.db.$transaction(async (tx) => {
                // Mark payment as paid
                await tx.payment.update({
                    where: { payment_id: input.payment_id },
                    data: {
                        status: PaymentStatus.PAID,
                        paid_at: now,
                    },
                });

                // Update transaction status
                await tx.transaction.update({
                    where: { transaction_id: payment.transaction_id },
                    data: { status: TransactionStatus.PAID },
                });

                // Update listing status
                await tx.listing.update({
                    where: { listing_id: payment.transaction.listing_id },
                    data: { status: ListingStatus.SOLD },
                });

                // Create notification for seller
                await tx.notification.create({
                    data: {
                        user_id: payment.transaction.seller_id,
                        notification_type: "PAYMENT_RECEIVED",
                        title: "Pembayaran Diterima",
                        body: `Pembayaran untuk "${payment.transaction.listing.title}" telah diterima. Silakan kirim item ke pembeli.`,
                        data_payload: {
                            transaction_id: payment.transaction_id,
                            amount: payment.payment_amount,
                        },
                    },
                });
            });

            return {
                success: true,
                message: "Payment simulated successfully",
                transaction_status: TransactionStatus.PAID,
            };
        }),

    /**
     * Simulate payment expiry (DEVELOPMENT ONLY)
     */
    simulateExpiry: protectedProcedure
        .input(z.object({ payment_id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            if (process.env.NODE_ENV === "production") {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Tidak tersedia di production",
                });
            }

            const payment = await ctx.db.payment.findUnique({
                where: { payment_id: input.payment_id },
                include: { transaction: { include: { listing: true } } },
            });

            if (!payment) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Pembayaran tidak ditemukan",
                });
            }

            await ctx.db.$transaction(async (tx) => {
                await tx.payment.update({
                    where: { payment_id: input.payment_id },
                    data: { status: PaymentStatus.EXPIRED },
                });

                // Check for other pending payments
                const otherPending = await tx.payment.count({
                    where: {
                        transaction_id: payment.transaction_id,
                        status: PaymentStatus.PENDING,
                        payment_id: { not: input.payment_id },
                    },
                });

                if (otherPending === 0) {
                    await tx.transaction.update({
                        where: { transaction_id: payment.transaction_id },
                        data: { status: TransactionStatus.CANCELLED },
                    });

                    await tx.listing.update({
                        where: { listing_id: payment.transaction.listing_id },
                        data: { status: ListingStatus.ACTIVE },
                    });
                }
            });

            return { success: true, message: "Payment expiry simulated" };
        }),
});
