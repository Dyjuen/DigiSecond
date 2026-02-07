/**
 * Transaction Router
 * Handles transaction lifecycle: creation, transfer, verification, completion
 * 
 * @module server/api/routers/transaction
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TransactionStatus, PaymentStatus, ListingStatus } from "@prisma/client";
import { checkRateLimit, userRateLimitKey } from "@/lib/rate-limit";
import { calculateFees, calculateVerificationDeadline, isVerificationExpired } from "@/lib/xendit";
import { getPlatformConfig } from "@/server/config";

const createTransactionInput = z.object({
    listing_id: z.string().uuid("ID listing tidak valid"),
    payment_method: z.enum(["VA", "EWALLET", "QRIS", "CARD", "RETAIL"]),
});

const getByIdInput = z.object({
    transaction_id: z.string().uuid("ID transaksi tidak valid"),
});

const getActiveInput = z.object({
    status: z.enum([
        "PENDING_PAYMENT",
        "PAID",
        "ITEM_TRANSFERRED",
        "VERIFIED",
        "COMPLETED",
        "DISPUTED",
        "REFUNDED",
        "CANCELLED",
    ]).optional(),
    role: z.enum(["buyer", "seller"]).optional(),
    limit: z.number().min(1).max(50).default(20),
    cursor: z.string().optional(),
});

const markTransferredInput = z.object({
    transaction_id: z.string().uuid("ID transaksi tidak valid"),
    transfer_proof_url: z.string().url("URL bukti transfer tidak valid"),
});

const confirmReceivedInput = z.object({
    transaction_id: z.string().uuid("ID transaksi tidak valid"),
});


export const transactionRouter = createTRPCRouter({
    /**
     * Create a new transaction for purchasing a listing
     * 
     * Business Logic:
     * - Validates buyer is not the seller
     * - Validates listing is active and available
     * - Calculates platform fee (5%)
     * - Creates payment record in PENDING status
     */
    create: protectedProcedure
        .input(createTransactionInput)
        .mutation(async ({ ctx, input }) => {
            const { db, session } = ctx;
            const userId = session.user.id;

            // Rate limit check: 10 transactions per hour per user
            if (process.env.ENABLE_RATE_LIMIT !== "false") {
                const rateLimit = await checkRateLimit(
                    userRateLimitKey("transaction.create", userId),
                    10,
                    3600
                );
                if (!rateLimit.success) {
                    throw new TRPCError({
                        code: "TOO_MANY_REQUESTS",
                        message: "Terlalu banyak transaksi. Coba lagi dalam 1 jam.",
                    });
                }
            }


            // KYC verification check
            const user = await db.user.findUnique({
                where: { user_id: userId },
                select: { phone: true, id_card_url: true },
            });

            if (!user?.phone || !user?.id_card_url) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Harap lengkapi profil (No. HP & KTP) sebelum melakukan pembelian.",
                });
            }

            // Get listing with seller info
            const listing = await db.listing.findUnique({
                where: { listing_id: input.listing_id },
                select: {
                    listing_id: true,
                    seller_id: true,
                    title: true,
                    price: true,
                    current_bid: true,
                    status: true,
                    listing_type: true,
                },
            });

            if (!listing) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Listing tidak ditemukan",
                });
            }

            if (listing.status !== ListingStatus.ACTIVE) {
                // Special handling for PENDING status
                if (listing.status === ListingStatus.PENDING) {
                    const userTransaction = await db.transaction.findFirst({
                        where: {
                            listing_id: input.listing_id,
                            buyer_id: userId,
                            status: "PENDING_PAYMENT"
                        }
                    });

                    if (userTransaction) {
                        throw new TRPCError({
                            code: "CONFLICT",
                            message: "Anda sudah memesan item ini. Silakan selesaikan pembayaran di menu Transaksi Saya.",
                        });
                    }

                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Maaf, item ini sedang dalam proses pembayaran oleh pembeli lain. Silakan coba lagi nanti.",
                    });
                }

                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Item tidak tersedia saat ini (Status: ${listing.status})`,
                });
            }

            if (listing.seller_id === userId) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Anda tidak dapat membeli item jualan Anda sendiri.",
                });
            }

            // Check for existing pending transaction on this listing
            const existingTx = await db.transaction.findFirst({
                where: {
                    listing_id: input.listing_id,
                    status: { not: TransactionStatus.CANCELLED }
                },
                select: { status: true },
            });

            if (existingTx) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "Item ini sudah dipesan oleh pengguna lain. Mohon tunggu.",
                });
            }

            // Calculate amounts: use current_bid for auctions, price for fixed
            const transactionAmount = listing.current_bid ?? listing.price;

            // Get system config
            const config = await getPlatformConfig(db);
            const { platformFee, sellerPayout } = calculateFees(transactionAmount, config.platformFeePercentage);

            // Create transaction with payment record in a transaction
            const transaction = await db.$transaction(async (tx) => {
                // Update listing status to PENDING
                await tx.listing.update({
                    where: { listing_id: input.listing_id },
                    data: { status: ListingStatus.PENDING },
                });

                // Create transaction
                const newTx = await tx.transaction.create({
                    data: {
                        listing_id: input.listing_id,
                        buyer_id: userId,
                        seller_id: listing.seller_id,
                        transaction_amount: transactionAmount,
                        platform_fee_amount: platformFee,
                        seller_payout_amount: sellerPayout,
                        status: TransactionStatus.PENDING_PAYMENT,
                    },
                });

                // Create payment record
                await tx.payment.create({
                    data: {
                        transaction_id: newTx.transaction_id,
                        xendit_payment_id: `pending_${Date.now()}_${Math.random().toString(36).slice(2)}`,
                        payment_method: input.payment_method,
                        payment_amount: transactionAmount,
                        status: PaymentStatus.PENDING,
                        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
                    },
                });

                return newTx;
            });

            return {
                transaction_id: transaction.transaction_id,
                amount: transactionAmount,
                platform_fee: platformFee,
                seller_payout: sellerPayout,
            };
        }),

    /**
     * Get transaction by ID with full details
     * Includes listing, buyer, seller, payments, dispute
     */
    getById: protectedProcedure
        .input(getByIdInput)
        .query(async ({ ctx, input }) => {
            const transaction = await ctx.db.transaction.findUnique({
                where: { transaction_id: input.transaction_id },
                include: {
                    listing: {
                        select: {
                            listing_id: true,
                            title: true,
                            description: true,
                            price: true,
                            photo_urls: true,
                            category: { select: { name: true } },
                        },
                    },
                    buyer: {
                        select: {
                            user_id: true,
                            name: true,
                            avatar_url: true,
                            rating: true,
                            rating_count: true,
                        },
                    },
                    seller: {
                        select: {
                            user_id: true,
                            name: true,
                            avatar_url: true,
                            rating: true,
                            rating_count: true,
                        },
                    },
                    payments: {
                        orderBy: { created_at: "desc" },
                        take: 1,
                    },
                    dispute: {
                        select: {
                            dispute_id: true,
                            dispute_category: true,
                            status: true,
                            created_at: true,
                        },
                    },
                },
            });

            if (!transaction) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Transaksi tidak ditemukan",
                });
            }

            // Authorization: only buyer, seller, or admin
            const userId = ctx.session.user.id;
            const isParticipant =
                transaction.buyer_id === userId || transaction.seller_id === userId;
            const isAdmin = ctx.session.user.role === "ADMIN";

            if (!isParticipant && !isAdmin) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Anda tidak memiliki akses ke transaksi ini",
                });
            }

            // Add computed fields
            const isExpired = isVerificationExpired(transaction.verification_deadline);

            return {
                ...transaction,
                is_verification_expired: isExpired,
                current_payment: transaction.payments[0] ?? null,
            };
        }),

    /**
     * Get active transactions for the current user
     * Supports filtering by status and role (buyer/seller)
     */
    getActive: protectedProcedure
        .input(getActiveInput)
        .query(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;
            const { status, role, limit, cursor } = input;

            // Build where clause
            const where: {
                status?: TransactionStatus;
                buyer_id?: string;
                seller_id?: string;
                OR?: Array<{ buyer_id: string } | { seller_id: string }>;
            } = {};

            if (status) {
                where.status = status as TransactionStatus;
            }

            if (role === "buyer") {
                where.buyer_id = userId;
            } else if (role === "seller") {
                where.seller_id = userId;
            } else {
                where.OR = [{ buyer_id: userId }, { seller_id: userId }];
            }

            const transactions = await ctx.db.transaction.findMany({
                where,
                take: limit + 1,
                cursor: cursor ? { transaction_id: cursor } : undefined,
                orderBy: { created_at: "desc" },
                include: {
                    listing: {
                        select: {
                            listing_id: true,
                            title: true,
                            photo_urls: true,
                        },
                    },
                    buyer: {
                        select: {
                            user_id: true,
                            name: true,
                            avatar_url: true,
                        },
                    },
                    seller: {
                        select: {
                            user_id: true,
                            name: true,
                            avatar_url: true,
                        },
                    },
                },
            });

            let nextCursor: string | undefined;
            if (transactions.length > limit) {
                const nextItem = transactions.pop();
                nextCursor = nextItem?.transaction_id;
            }

            return {
                transactions,
                nextCursor,
            };
        }),

    /**
     * Seller marks item as transferred
     * 
     * Business Logic:
     * - Only seller can call this
     * - Transaction must be in PAID status
     * - Sets verification deadline (24 hours from now)
     * - Updates status to ITEM_TRANSFERRED
     */
    markTransferred: protectedProcedure
        .input(markTransferredInput)
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            const transaction = await ctx.db.transaction.findUnique({
                where: { transaction_id: input.transaction_id },
                include: {
                    buyer: { select: { user_id: true, name: true } },
                    listing: { select: { title: true } },
                },
            });

            if (!transaction) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Transaksi tidak ditemukan",
                });
            }

            // Authorization: only seller
            if (transaction.seller_id !== userId) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Hanya penjual yang dapat menandai item sebagai terkirim",
                });
            }

            // Validate status
            if (transaction.status !== TransactionStatus.PAID) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Tidak dapat menandai sebagai terkirim. Status saat ini: ${transaction.status}`,
                });
            }

            const now = new Date();
            const config = await getPlatformConfig(ctx.db);
            const verificationDeadline = calculateVerificationDeadline(now, config.verificationPeriodHours);

            // Update transaction
            const updated = await ctx.db.transaction.update({
                where: { transaction_id: input.transaction_id },
                data: {
                    status: TransactionStatus.ITEM_TRANSFERRED,
                    item_transferred_at: now,
                    transfer_proof_url: input.transfer_proof_url,
                    verification_deadline: verificationDeadline,
                },
            });

            // Create notification for buyer
            await ctx.db.notification.create({
                data: {
                    user_id: transaction.buyer_id,
                    notification_type: "ITEM_TRANSFERRED",
                    title: "Item Telah Dikirim",
                    body: `Penjual telah mengirim item "${transaction.listing.title}". Konfirmasi penerimaan dalam 24 jam.`,
                    data_payload: {
                        transaction_id: input.transaction_id,
                        verification_deadline: verificationDeadline.toISOString(),
                    },
                },
            });

            // Audit log
            await ctx.db.auditLog.create({
                data: {
                    entity_type: "Transaction",
                    entity_id: input.transaction_id,
                    action_type: "MARK_TRANSFERRED",
                    action_description: "Seller marked item as transferred",
                    new_value: {
                        status: "ITEM_TRANSFERRED",
                        transfer_proof_url: input.transfer_proof_url,
                        verification_deadline: verificationDeadline.toISOString(),
                    },
                    performed_by_user_id: userId,
                },
            });

            return {
                success: true,
                transaction_id: updated.transaction_id,
                verification_deadline: verificationDeadline,
            };
        }),

    /**
     * Buyer confirms receipt of item
     * 
     * Business Logic:
     * - Only buyer can call this
     * - Transaction must be in ITEM_TRANSFERRED status
     * - No active dispute allowed
     * - Creates payout record for seller
     * - Updates status to COMPLETED
     */
    confirmReceived: protectedProcedure
        .input(confirmReceivedInput)
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            const transaction = await ctx.db.transaction.findUnique({
                where: { transaction_id: input.transaction_id },
                include: {
                    seller: {
                        select: {
                            user_id: true,
                            name: true,
                            bank_accounts: {
                                where: { is_default: true },
                                take: 1,
                            },
                        },
                    },
                    listing: { select: { title: true, listing_id: true } },
                    dispute: { select: { dispute_id: true, status: true } },
                },
            });

            if (!transaction) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Transaksi tidak ditemukan",
                });
            }

            // Authorization: only buyer
            if (transaction.buyer_id !== userId) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Hanya pembeli yang dapat mengkonfirmasi penerimaan",
                });
            }

            // Validate status
            if (transaction.status !== TransactionStatus.ITEM_TRANSFERRED) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Tidak dapat mengkonfirmasi. Status saat ini: ${transaction.status}`,
                });
            }

            // Check for active dispute
            if (transaction.dispute && transaction.dispute.status !== "RESOLVED") {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Tidak dapat mengkonfirmasi saat dispute aktif",
                });
            }

            const now = new Date();
            const bankAccount = transaction.seller.bank_accounts[0];

            // Complete transaction with payout record
            await ctx.db.$transaction(async (tx) => {
                // Update transaction status
                await tx.transaction.update({
                    where: { transaction_id: input.transaction_id },
                    data: {
                        status: TransactionStatus.COMPLETED,
                        completed_at: now,
                    },
                });

                // Update listing to SOLD
                await tx.listing.update({
                    where: { listing_id: transaction.listing.listing_id },
                    data: { status: ListingStatus.SOLD },
                });

                // Create payout record
                if (bankAccount) {
                    await tx.payout.create({
                        data: {
                            transaction_id: input.transaction_id,
                            seller_id: transaction.seller_id,
                            payout_amount: transaction.seller_payout_amount,
                            bank_code: bankAccount.bank_code,
                            bank_name: bankAccount.bank_name,
                            account_number: bankAccount.account_number,
                            account_holder_name: bankAccount.account_holder_name,
                            status: "PENDING",
                        },
                    });
                }

                // Create notification for seller
                await tx.notification.create({
                    data: {
                        user_id: transaction.seller_id,
                        notification_type: "ITEM_CONFIRMED",
                        title: "Pembeli Mengkonfirmasi Penerimaan",
                        body: `Pembeli telah mengkonfirmasi penerimaan "${transaction.listing.title}". Dana akan segera dikirim.`,
                        data_payload: {
                            transaction_id: input.transaction_id,
                            payout_amount: transaction.seller_payout_amount,
                        },
                    },
                });
            });

            // Audit log
            await ctx.db.auditLog.create({
                data: {
                    entity_type: "Transaction",
                    entity_id: input.transaction_id,
                    action_type: "CONFIRM_RECEIVED",
                    action_description: "Buyer confirmed item receipt",
                    new_value: {
                        status: "COMPLETED",
                        completed_at: now.toISOString(),
                        seller_payout: transaction.seller_payout_amount,
                    },
                    performed_by_user_id: userId,
                },
            });

            return {
                success: true,
                transaction_id: input.transaction_id,
                seller_payout: transaction.seller_payout_amount,
            };
        }),

    /**
     * Cancel a pending payment transaction
     * Only allowed before payment is completed
     */
    cancel: protectedProcedure
        .input(z.object({ transaction_id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            const transaction = await ctx.db.transaction.findUnique({
                where: { transaction_id: input.transaction_id },
                include: { listing: { select: { listing_id: true } } },
            });

            if (!transaction) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Transaksi tidak ditemukan",
                });
            }

            // Only buyer can cancel
            if (transaction.buyer_id !== userId) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Hanya pembeli yang dapat membatalkan transaksi",
                });
            }

            // Can only cancel pending payment
            if (transaction.status !== TransactionStatus.PENDING_PAYMENT) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Hanya transaksi yang belum dibayar yang dapat dibatalkan",
                });
            }

            // Cancel transaction and restore listing
            await ctx.db.$transaction(async (tx) => {
                await tx.transaction.update({
                    where: { transaction_id: input.transaction_id },
                    data: { status: TransactionStatus.CANCELLED },
                });

                await tx.payment.updateMany({
                    where: { transaction_id: input.transaction_id },
                    data: { status: PaymentStatus.EXPIRED },
                });

                await tx.listing.update({
                    where: { listing_id: transaction.listing.listing_id },
                    data: { status: ListingStatus.ACTIVE },
                });
            });

            return { success: true };
        }),

    /**
     * Get list of chats for the Global Chat Widget
     * Returns transactions with latest message and unread count
     */
    getChatList: protectedProcedure
        .query(async ({ ctx }) => {
            const userId = ctx.session.user.id;

            const transactions = await ctx.db.transaction.findMany({
                where: {
                    OR: [{ buyer_id: userId }, { seller_id: userId }],
                    // Only show transactions that have at least one message
                    messages: { some: {} }
                },
                include: {
                    listing: {
                        select: {
                            listing_id: true,
                            title: true,
                            photo_urls: true,
                        }
                    },
                    buyer: {
                        select: {
                            user_id: true,
                            name: true,
                            avatar_url: true,
                        }
                    },
                    seller: {
                        select: {
                            user_id: true,
                            name: true,
                            avatar_url: true,
                        }
                    },
                    messages: {
                        orderBy: { created_at: 'desc' },
                        take: 1,
                        select: {
                            message_content: true,
                            created_at: true,
                        }
                    },
                    // Count unread messages from OTHER person
                    _count: {
                        select: {
                            messages: {
                                where: {
                                    sender_user_id: { not: userId },
                                    is_read: false
                                }
                            }
                        }
                    }
                },
                // Initial sort by updated_at, we will refine in JS
                orderBy: { updated_at: 'desc' }
            });

            // Format and sort by latest message time OR transaction time
            const chats = transactions.map(t => {
                const isBuyer = t.buyer_id === userId;
                const partner = isBuyer ? t.seller : t.buyer;
                const lastMessage = t.messages[0];

                // Determine sort time: last message time or transaction update time
                const sortTime = lastMessage ? lastMessage.created_at.getTime() : t.updated_at.getTime();

                return {
                    id: t.transaction_id,
                    partnerName: partner.name || "Unknown User",
                    partnerAvatar: partner.avatar_url,
                    lastMessage: lastMessage?.message_content || "Belum ada pesan",
                    timestamp: lastMessage ? lastMessage.created_at : t.updated_at,
                    sortTime,
                    unread: t._count.messages,
                    listingTitle: t.listing.title,
                    listingImage: t.listing.photo_urls[0] || "",
                    status: t.status,
                    listingId: t.listing.listing_id // needed for navigation if clicked?
                };
            });

            // Sort descending
            return chats.sort((a, b) => b.sortTime - a.sortTime);
        }),
});
