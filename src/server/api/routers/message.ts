
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TransactionStatus } from "@prisma/client";
import { checkRateLimit, userRateLimitKey } from "@/lib/rate-limit";

// Max attachment size: 5MB
const MAX_ATTACHMENT_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Message Router
 * Handles transaction chat between buyer and seller
 */
export const messageRouter = createTRPCRouter({
    /**
     * Send a message in a transaction chat
     * Rate limited: 20 messages per minute per user
     */
    send: protectedProcedure
        .input(
            z.object({
                transaction_id: z.string(),
                content: z.string().min(1).max(2000),
                attachment_url: z.string().url().optional(),
                attachment_size_bytes: z.number().max(MAX_ATTACHMENT_SIZE_BYTES).optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            // Rate limit: 20 messages per minute
            const rateLimit = await checkRateLimit(
                userRateLimitKey("message.send", userId),
                20,
                60 // 1 minute window
            );
            if (!rateLimit.success) {
                throw new TRPCError({
                    code: "TOO_MANY_REQUESTS",
                    message: `Terlalu banyak pesan. Coba lagi dalam ${Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000)} detik.`,
                });
            }

            // Validate attachment size if provided
            if (input.attachment_size_bytes && input.attachment_size_bytes > MAX_ATTACHMENT_SIZE_BYTES) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Ukuran lampiran maksimal 5MB",
                });
            }

            const transaction = await ctx.db.transaction.findUnique({
                where: { transaction_id: input.transaction_id },
                select: {
                    buyer_id: true,
                    seller_id: true,
                    status: true,
                    completed_at: true,
                },
            });

            if (!transaction) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Transaksi tidak ditemukan" });
            }

            // Only buyer or seller can send messages
            const isParticipant =
                transaction.buyer_id === userId || transaction.seller_id === userId;

            if (!isParticipant) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Hanya peserta transaksi yang dapat mengirim pesan",
                });
            }

            // Check if chat is still open (7 days after completion)
            if (transaction.status === TransactionStatus.COMPLETED && transaction.completed_at) {
                const sevenDaysAfter = new Date(transaction.completed_at);
                sevenDaysAfter.setDate(sevenDaysAfter.getDate() + 7);

                if (new Date() > sevenDaysAfter) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Chat sudah ditutup (lebih dari 7 hari setelah transaksi selesai)",
                    });
                }
            }

            // Check for cancelled/refunded transactions
            if (
                transaction.status === TransactionStatus.CANCELLED ||
                transaction.status === TransactionStatus.REFUNDED
            ) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Tidak dapat mengirim pesan ke transaksi yang dibatalkan",
                });
            }

            // Create message
            const message = await ctx.db.message.create({
                data: {
                    transaction_id: input.transaction_id,
                    sender_user_id: userId,
                    message_content: input.content,
                    attachment_url: input.attachment_url,
                },
                include: {
                    sender: {
                        select: {
                            user_id: true,
                            name: true,
                            avatar_url: true,
                        },
                    },
                },
            });

            // Create notification for recipient
            const recipientId =
                transaction.buyer_id === userId
                    ? transaction.seller_id
                    : transaction.buyer_id;

            await ctx.db.notification.create({
                data: {
                    user_id: recipientId,
                    notification_type: "NEW_MESSAGE",
                    title: "Pesan Baru",
                    body: input.content.substring(0, 100) + (input.content.length > 100 ? "..." : ""),
                    data_payload: {
                        transaction_id: input.transaction_id,
                        message_id: message.message_id,
                        sender_name: message.sender.name,
                    },
                },
            });

            return message;
        }),

    /**
     * Get messages for a transaction
     */
    getByTransaction: protectedProcedure
        .input(
            z.object({
                transaction_id: z.string(),
                limit: z.number().min(1).max(100).default(50),
                cursor: z.string().optional(),
                direction: z.enum(["older", "newer"]).default("older"),
            })
        )
        .query(async ({ ctx, input }) => {
            const transaction = await ctx.db.transaction.findUnique({
                where: { transaction_id: input.transaction_id },
                select: { buyer_id: true, seller_id: true },
            });

            if (!transaction) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Transaksi tidak ditemukan" });
            }

            // Authorization check
            const userId = ctx.session.user.id;
            const isParticipant =
                transaction.buyer_id === userId || transaction.seller_id === userId;
            const isAdmin = ctx.session.user.role === "ADMIN";

            if (!isParticipant && !isAdmin) {
                throw new TRPCError({ code: "FORBIDDEN", message: "Anda tidak memiliki akses" });
            }

            const { limit, cursor, direction } = input;

            const messages = await ctx.db.message.findMany({
                where: { transaction_id: input.transaction_id },
                take: limit + 1,
                cursor: cursor ? { message_id: cursor } : undefined,
                orderBy: { created_at: direction === "older" ? "desc" : "asc" },
                include: {
                    sender: {
                        select: {
                            user_id: true,
                            name: true,
                            avatar_url: true,
                        },
                    },
                },
            });

            let nextCursor: string | undefined;
            if (messages.length > limit) {
                const nextItem = messages.pop();
                nextCursor = nextItem?.message_id;
            }

            // Reverse if getting newer messages to maintain chronological order
            if (direction === "newer") {
                messages.reverse();
            }

            return {
                messages,
                nextCursor,
            };
        }),

    /**
     * Mark messages as read
     */
    markRead: protectedProcedure
        .input(
            z.object({
                transaction_id: z.string(),
                message_ids: z.array(z.string()).optional(), // If not provided, mark all as read
            })
        )
        .mutation(async ({ ctx, input }) => {
            const transaction = await ctx.db.transaction.findUnique({
                where: { transaction_id: input.transaction_id },
                select: { buyer_id: true, seller_id: true },
            });

            if (!transaction) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Transaksi tidak ditemukan" });
            }

            // Authorization check
            const userId = ctx.session.user.id;
            const isParticipant =
                transaction.buyer_id === userId || transaction.seller_id === userId;

            if (!isParticipant) {
                throw new TRPCError({ code: "FORBIDDEN", message: "Anda tidak memiliki akses" });
            }

            const where: any = {
                transaction_id: input.transaction_id,
                sender_user_id: { not: userId }, // Only mark messages from others as read
                is_read: false,
            };

            if (input.message_ids && input.message_ids.length > 0) {
                where.message_id = { in: input.message_ids };
            }

            const result = await ctx.db.message.updateMany({
                where,
                data: {
                    is_read: true,
                    read_at: new Date(),
                },
            });

            return { count: result.count };
        }),

    /**
     * Get unread message count for a transaction
     */
    getUnreadCount: protectedProcedure
        .input(z.object({ transaction_id: z.string() }))
        .query(async ({ ctx, input }) => {
            const transaction = await ctx.db.transaction.findUnique({
                where: { transaction_id: input.transaction_id },
                select: { buyer_id: true, seller_id: true },
            });

            if (!transaction) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Transaksi tidak ditemukan" });
            }

            const userId = ctx.session.user.id;
            const isParticipant =
                transaction.buyer_id === userId || transaction.seller_id === userId;

            if (!isParticipant) {
                throw new TRPCError({ code: "FORBIDDEN", message: "Anda tidak memiliki akses" });
            }

            const count = await ctx.db.message.count({
                where: {
                    transaction_id: input.transaction_id,
                    sender_user_id: { not: userId },
                    is_read: false,
                },
            });

            return { count };
        }),

    /**
     * Get all unread counts for user's active transactions
     */
    getAllUnreadCounts: protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.session.user.id;

        // Get all active transactions for user
        const transactions = await ctx.db.transaction.findMany({
            where: {
                OR: [{ buyer_id: userId }, { seller_id: userId }],
                status: {
                    notIn: [TransactionStatus.CANCELLED, TransactionStatus.REFUNDED],
                },
            },
            select: { transaction_id: true },
        });

        const transactionIds = transactions.map((t) => t.transaction_id);

        // Get unread counts grouped by transaction
        const unreadCounts = await ctx.db.message.groupBy({
            by: ["transaction_id"],
            where: {
                transaction_id: { in: transactionIds },
                sender_user_id: { not: userId },
                is_read: false,
            },
            _count: { message_id: true },
        });

        const result: Record<string, number> = {};
        for (const item of unreadCounts) {
            result[item.transaction_id] = item._count.message_id;
        }

        return result;
    }),
});
