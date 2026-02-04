
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TransactionStatus } from "@prisma/client";

/**
 * Review Router
 * Handles post-transaction reviews and ratings
 */
export const reviewRouter = createTRPCRouter({
    /**
     * Create a review after completed transaction
     */
    create: protectedProcedure
        .input(
            z.object({
                transaction_id: z.string(),
                rating: z.number().min(1).max(5),
                comment: z.string().min(10).max(1000).optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            const transaction = await ctx.db.transaction.findUnique({
                where: { transaction_id: input.transaction_id },
                select: {
                    buyer_id: true,
                    seller_id: true,
                    status: true,
                },
            });

            if (!transaction) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Transaksi tidak ditemukan" });
            }

            // Must be a participant
            const isBuyer = transaction.buyer_id === userId;
            const isSeller = transaction.seller_id === userId;

            if (!isBuyer && !isSeller) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Hanya peserta transaksi yang dapat memberikan review",
                });
            }

            // Transaction must be completed
            if (transaction.status !== TransactionStatus.COMPLETED) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Review hanya dapat diberikan setelah transaksi selesai",
                });
            }

            // Determine who is being reviewed
            const reviewedUserId = isBuyer ? transaction.seller_id : transaction.buyer_id;

            // Check for existing review
            const existingReview = await ctx.db.review.findUnique({
                where: {
                    transaction_id_reviewer_user_id: {
                        transaction_id: input.transaction_id,
                        reviewer_user_id: userId,
                    },
                },
            });

            if (existingReview) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Anda sudah memberikan review untuk transaksi ini",
                });
            }

            // Create review
            const review = await ctx.db.review.create({
                data: {
                    transaction_id: input.transaction_id,
                    reviewer_user_id: userId,
                    reviewed_user_id: reviewedUserId,
                    rating_score: input.rating,
                    review_comment: input.comment,
                },
            });

            // Update user's rating
            const reviewedUser = await ctx.db.user.findUnique({
                where: { user_id: reviewedUserId },
                select: { rating: true, rating_count: true },
            });

            if (reviewedUser) {
                const newRatingCount = reviewedUser.rating_count + 1;
                const newRating =
                    (reviewedUser.rating * reviewedUser.rating_count + input.rating) / newRatingCount;

                await ctx.db.user.update({
                    where: { user_id: reviewedUserId },
                    data: {
                        rating: Math.round(newRating * 10) / 10, // Round to 1 decimal
                        rating_count: newRatingCount,
                    },
                });
            }

            // Create notification for reviewed user
            await ctx.db.notification.create({
                data: {
                    user_id: reviewedUserId,
                    notification_type: "REVIEW_RECEIVED",
                    title: "Review Baru",
                    body: `Anda menerima review ${input.rating} bintang`,
                    data_payload: {
                        transaction_id: input.transaction_id,
                        review_id: review.review_id,
                        rating: input.rating,
                    },
                },
            });

            return review;
        }),

    /**
     * Get reviews for a user
     */
    getByUser: publicProcedure
        .input(
            z.object({
                user_id: z.string(),
                limit: z.number().min(1).max(50).default(20),
                cursor: z.string().optional(),
            })
        )
        .query(async ({ ctx, input }) => {
            const { user_id, limit, cursor } = input;

            const reviews = await ctx.db.review.findMany({
                where: { reviewed_user_id: user_id },
                take: limit + 1,
                cursor: cursor ? { review_id: cursor } : undefined,
                orderBy: { created_at: "desc" },
                include: {
                    reviewer: {
                        select: {
                            user_id: true,
                            name: true,
                            avatar_url: true,
                        },
                    },
                    transaction: {
                        select: {
                            listing: {
                                select: { title: true },
                            },
                        },
                    },
                },
            });

            let nextCursor: string | undefined;
            if (reviews.length > limit) {
                const nextItem = reviews.pop();
                nextCursor = nextItem?.review_id;
            }

            return {
                reviews: reviews.map((r) => ({
                    review_id: r.review_id,
                    rating: r.rating_score,
                    comment: r.review_comment,
                    created_at: r.created_at,
                    reviewer: r.reviewer,
                    listing_title: r.transaction.listing.title,
                })),
                nextCursor,
            };
        }),

    /**
     * Get review for a specific transaction
     */
    getByTransaction: protectedProcedure
        .input(z.object({ transaction_id: z.string() }))
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

            const reviews = await ctx.db.review.findMany({
                where: { transaction_id: input.transaction_id },
                include: {
                    reviewer: {
                        select: {
                            user_id: true,
                            name: true,
                            avatar_url: true,
                        },
                    },
                    reviewed: {
                        select: {
                            user_id: true,
                            name: true,
                            avatar_url: true,
                        },
                    },
                },
            });

            // Check if current user has reviewed
            const hasReviewed = reviews.some((r) => r.reviewer_user_id === userId);

            return {
                reviews,
                hasReviewed,
            };
        }),

    /**
     * Get user's rating summary
     */
    getRatingSummary: publicProcedure
        .input(z.object({ user_id: z.string() }))
        .query(async ({ ctx, input }) => {
            const user = await ctx.db.user.findUnique({
                where: { user_id: input.user_id },
                select: { rating: true, rating_count: true },
            });

            if (!user) {
                throw new TRPCError({ code: "NOT_FOUND", message: "User tidak ditemukan" });
            }

            // Get rating distribution
            const distribution = await ctx.db.review.groupBy({
                by: ["rating_score"],
                where: { reviewed_user_id: input.user_id },
                _count: { review_id: true },
            });

            const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            for (const d of distribution) {
                ratingDistribution[d.rating_score] = d._count.review_id;
            }

            return {
                average: user.rating,
                count: user.rating_count,
                distribution: ratingDistribution,
            };
        }),
});
