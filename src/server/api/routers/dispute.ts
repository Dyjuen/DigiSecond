import { DisputeStatus, TransactionStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

/**
 * Dispute Router
 * Handles dispute creation and evidence management
 * Admin resolution is in admin.ts
 */
export const disputeRouter = createTRPCRouter({
    /**
     * Create a dispute (buyer only, during verification period)
     */
    create: protectedProcedure
        .input(
            z.object({
                transaction_id: z.string(),
                category: z.enum(["NOT_AS_DESCRIBED", "ACCESS_ISSUE", "FRAUD", "OTHER"]),
                description: z.string().min(20).max(2000),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const transaction = await ctx.db.transaction.findUnique({
                where: { transaction_id: input.transaction_id },
                include: { dispute: true },
            });

            if (!transaction) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Transaksi tidak ditemukan" });
            }

            // Only buyer can create dispute
            if (transaction.buyer_id !== ctx.session.user.id) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Hanya pembeli yang dapat membuat dispute",
                });
            }

            // Check if dispute already exists
            if (transaction.dispute) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Dispute sudah dibuat untuk transaksi ini",
                });
            }

            // Must be in ITEM_TRANSFERRED status
            if (transaction.status !== TransactionStatus.ITEM_TRANSFERRED) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Dispute hanya dapat dibuat setelah penjual mengirim item",
                });
            }

            // Check verification period (24 hours after transfer)
            if (transaction.verification_deadline && new Date() > transaction.verification_deadline) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Periode verifikasi sudah berakhir. Hubungi support untuk bantuan.",
                });
            }

            // Create dispute
            const dispute = await ctx.db.dispute.create({
                data: {
                    transaction_id: input.transaction_id,
                    initiator_id: ctx.session.user.id,
                    dispute_category: input.category,
                    description: input.description,
                    status: DisputeStatus.OPEN,
                },
            });

            // Update transaction status to DISPUTED
            await ctx.db.transaction.update({
                where: { transaction_id: input.transaction_id },
                data: { status: TransactionStatus.DISPUTED },
            });

            // Create notification for seller
            await ctx.db.notification.create({
                data: {
                    user_id: transaction.seller_id,
                    notification_type: "DISPUTE_OPENED",
                    title: "Dispute Dibuka",
                    body: `Pembeli telah membuka dispute untuk transaksi Anda. Kategori: ${input.category}`,
                    data_payload: {
                        transaction_id: input.transaction_id,
                        dispute_id: dispute.dispute_id,
                    },
                },
            });

            return dispute;
        }),

    /**
     * Get dispute by ID
     */
    getById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const dispute = await ctx.db.dispute.findUnique({
                where: { dispute_id: input.id },
                include: {
                    transaction: {
                        select: {
                            transaction_id: true,
                            buyer_id: true,
                            seller_id: true,
                            transaction_amount: true,
                            listing: {
                                select: {
                                    title: true,
                                    photo_urls: true,
                                },
                            },
                        },
                    },
                    initiator: {
                        select: {
                            user_id: true,
                            name: true,
                            avatar_url: true,
                        },
                    },
                    evidences: {
                        orderBy: { created_at: "desc" },
                    },
                },
            });

            if (!dispute) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Dispute tidak ditemukan" });
            }

            // Authorization: only participants or admin
            const userId = ctx.session.user.id;
            const isParticipant =
                dispute.transaction.buyer_id === userId ||
                dispute.transaction.seller_id === userId;
            const isAdmin = ctx.session.user.role === "ADMIN";

            if (!isParticipant && !isAdmin) {
                throw new TRPCError({ code: "FORBIDDEN", message: "Anda tidak memiliki akses" });
            }

            return dispute;
        }),

    /**
     * Get dispute by transaction ID
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

            const dispute = await ctx.db.dispute.findUnique({
                where: { transaction_id: input.transaction_id },
                include: {
                    evidences: {
                        orderBy: { created_at: "desc" },
                    },
                },
            });

            return dispute; // Can be null if no dispute exists
        }),

    /**
     * Add evidence to a dispute
     */
    addEvidence: protectedProcedure
        .input(
            z.object({
                dispute_id: z.string(),
                file_url: z.string().url(),
                file_type: z.string(),
                file_name: z.string(),
                file_size_bytes: z.number().max(10 * 1024 * 1024), // Max 10MB
            })
        )
        .mutation(async ({ ctx, input }) => {
            const dispute = await ctx.db.dispute.findUnique({
                where: { dispute_id: input.dispute_id },
                include: {
                    transaction: {
                        select: { buyer_id: true, seller_id: true },
                    },
                },
            });

            if (!dispute) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Dispute tidak ditemukan" });
            }

            // Only participants can add evidence
            const userId = ctx.session.user.id;
            const isParticipant =
                dispute.transaction.buyer_id === userId ||
                dispute.transaction.seller_id === userId;

            if (!isParticipant) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Hanya peserta transaksi yang dapat menambah bukti",
                });
            }

            // Cannot add evidence to resolved dispute
            if (dispute.status === DisputeStatus.RESOLVED) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Tidak dapat menambah bukti ke dispute yang sudah selesai",
                });
            }

            // Check max evidences per user (10)
            const existingCount = await ctx.db.evidence.count({
                where: {
                    dispute_id: input.dispute_id,
                    uploader_user_id: userId,
                },
            });

            if (existingCount >= 10) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Maksimal 10 bukti per pengguna",
                });
            }

            const evidence = await ctx.db.evidence.create({
                data: {
                    dispute_id: input.dispute_id,
                    uploader_user_id: userId,
                    file_url: input.file_url,
                    file_type: input.file_type,
                    file_name: input.file_name,
                    file_size_bytes: input.file_size_bytes,
                },
            });

            return evidence;
        }),

    /**
     * Get user's disputes
     */
    getMyDisputes: protectedProcedure
        .input(
            z.object({
                status: z.enum(["OPEN", "UNDER_REVIEW", "RESOLVED"]).optional(),
                limit: z.number().min(1).max(50).default(20),
                cursor: z.string().optional(),
            })
        )
        .query(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;
            const { status, limit, cursor } = input;

            const where: any = {
                OR: [
                    { initiator_id: userId },
                    { transaction: { seller_id: userId } },
                ],
            };

            if (status) {
                where.status = status;
            }

            const disputes = await ctx.db.dispute.findMany({
                where,
                take: limit + 1,
                cursor: cursor ? { dispute_id: cursor } : undefined,
                orderBy: { created_at: "desc" },
                include: {
                    transaction: {
                        select: {
                            transaction_id: true,
                            transaction_amount: true,
                            listing: {
                                select: { title: true, photo_urls: true },
                            },
                        },
                    },
                },
            });

            let nextCursor: string | undefined;
            if (disputes.length > limit) {
                const nextItem = disputes.pop();
                nextCursor = nextItem?.dispute_id;
            }

            return {
                disputes,
                nextCursor,
            };
        }),

    /**
     * Upload evidence photo
     * Generates signed URL for Supabase Storage
     */
    uploadEvidence: protectedProcedure
        .input(
            z.object({
                fileName: z.string().min(1),
                fileType: z.enum(["image/jpeg", "image/png", "image/webp"]),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { fileName, fileType } = input;
            const userId = ctx.session.user.id;

            const extension = fileType.split("/")[1];
            // Path: disputes/{userId}/{timestamp}-{random}.{ext}
            const uniqueName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
            const storagePath = `disputes/${uniqueName}`;

            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

            if (!supabaseUrl || !supabaseKey) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Supabase tidak dikonfigurasi",
                });
            }

            const { createClient } = await import("@supabase/supabase-js");
            const supabase = createClient(supabaseUrl, supabaseKey);

            // Use the same "uploads" bucket as listings
            const { data, error } = await supabase.storage
                .from("uploads")
                .createSignedUploadUrl(storagePath);

            if (error) {
                console.error("Supabase upload error:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Gagal membuat upload URL",
                });
            }

            const publicUrl = `${supabaseUrl}/storage/v1/object/public/uploads/${storagePath}`;

            return {
                uploadUrl: data.signedUrl,
                publicUrl,
                path: storagePath,
            };
        }),
});
