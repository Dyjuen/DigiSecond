
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, adminProcedure } from "../trpc";
import { ListingStatus, TransactionStatus } from "@prisma/client";

export const adminRouter = createTRPCRouter({
    getDashboardStats: adminProcedure.query(async ({ ctx }) => {
        const totalUsers = await ctx.db.user.count();

        const activeListings = await ctx.db.listing.count({
            where: { status: ListingStatus.ACTIVE },
        });

        let totalTransactionVolume = 0;
        try {
            const aggregate = await ctx.db.transaction.aggregate({
                _sum: {
                    transaction_amount: true
                },
                where: {
                    status: TransactionStatus.COMPLETED
                }
            });
            totalTransactionVolume = aggregate._sum.transaction_amount ? Number(aggregate._sum.transaction_amount) : 0;
        } catch (e) {
            console.warn("Transaction aggregate failed", e);
        }

        const openDisputes = await ctx.db.dispute.count({
            where: { status: 'OPEN' }
        });

        const pendingListings = await ctx.db.listing.count({
            where: { status: ListingStatus.PENDING }
        });

        const recentUsers = await ctx.db.user.findMany({
            take: 5,
            orderBy: { created_at: "desc" },
            select: {
                user_id: true,
                name: true,
                email: true,
                created_at: true,
                role: true,
                avatar_url: true
            }
        });

        return {
            totalUsers,
            activeListings,
            totalTransactionVolume,
            openDisputes,
            recentUsers,
            pendingListings
        };
    }),

    getPendingCount: adminProcedure.query(async ({ ctx }) => {
        return ctx.db.listing.count({ where: { status: ListingStatus.PENDING } });
    }),

    getPendingListings: adminProcedure.query(async ({ ctx }) => {
        return ctx.db.listing.findMany({
            where: { status: ListingStatus.PENDING },
            include: {
                seller: {
                    select: {
                        name: true,
                        email: true,
                        avatar_url: true,
                        rating: true,
                    }
                },
                category: true,
            },
            orderBy: { created_at: "asc" } // Oldest first
        });
    }),

    approveListing: adminProcedure
        .input(z.object({ listing_id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.listing.update({
                where: { listing_id: input.listing_id },
                data: { status: ListingStatus.ACTIVE }
            });
        }),

    rejectListing: adminProcedure
        .input(z.object({ listing_id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.listing.update({
                where: { listing_id: input.listing_id },
                data: { status: ListingStatus.DRAFT } // Revert to DRAFT so user can edit
            });
        }),

    approveAllPending: adminProcedure
        .mutation(async ({ ctx }) => {
            return ctx.db.listing.updateMany({
                where: { status: ListingStatus.PENDING },
                data: { status: ListingStatus.ACTIVE }
            });
        }),

    getAllListings: adminProcedure.query(async ({ ctx }) => {
        return ctx.db.listing.findMany({
            include: {
                seller: {
                    select: { name: true, email: true }
                },
                category: { select: { name: true } }
            },
            orderBy: { created_at: "desc" }
        });
    }),

    getUsers: adminProcedure.query(async ({ ctx }) => {
        return ctx.db.user.findMany({
            orderBy: { created_at: "desc" },
            select: {
                user_id: true,
                name: true,
                email: true,
                role: true,
                is_verified: true,
                is_suspended: true,
                created_at: true,
                avatar_url: true,
            }
        });
    }),

    getDisputes: adminProcedure.query(async ({ ctx }) => {
        return ctx.db.dispute.findMany({
            include: {
                initiator: {
                    select: {
                        name: true,
                        email: true,
                        avatar_url: true
                    }
                },
                transaction: {
                    select: {
                        transaction_id: true,
                        transaction_amount: true,
                        listing: {
                            select: {
                                title: true
                            }
                        },
                        buyer: {
                            select: {
                                name: true,
                                email: true,
                                avatar_url: true
                            }
                        },
                        seller: {
                            select: {
                                name: true,
                                email: true,
                                avatar_url: true
                            }
                        }
                    }
                }
            },
            orderBy: { created_at: "desc" }
        });
    }),

    /**
     * Resolve a dispute with fund release/refund execution
     * 
     * Resolutions:
     * - FULL_REFUND: Refund full amount to buyer, transaction -> REFUNDED
     * - PARTIAL_REFUND: Requires partial_amount, split between buyer refund and seller payout
     * - NO_REFUND: Release full amount to seller, transaction -> COMPLETED
     */
    resolveDispute: adminProcedure
        .input(z.object({
            dispute_id: z.string().uuid(),
            resolution: z.enum(["FULL_REFUND", "PARTIAL_REFUND", "NO_REFUND"]),
            partial_refund_amount: z.number().int().min(0).optional(),
            admin_notes: z.string().max(1000).optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const adminId = ctx.session.user.id;

            // Get dispute with transaction details
            const dispute = await ctx.db.dispute.findUnique({
                where: { dispute_id: input.dispute_id },
                include: {
                    transaction: {
                        include: {
                            listing: { select: { listing_id: true, title: true } },
                            buyer: { select: { user_id: true, name: true } },
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
                        },
                    },
                },
            });

            if (!dispute) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Dispute tidak ditemukan",
                });
            }

            if (dispute.status === "RESOLVED") {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Dispute sudah resolved",
                });
            }

            // Validate partial refund amount
            if (input.resolution === "PARTIAL_REFUND") {
                if (!input.partial_refund_amount) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Jumlah refund sebagian harus diisi",
                    });
                }
                if (input.partial_refund_amount > dispute.transaction.transaction_amount) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Jumlah refund tidak boleh melebihi total transaksi",
                    });
                }
            }

            const now = new Date();
            const bankAccount = dispute.transaction.seller.bank_accounts[0];

            await ctx.db.$transaction(async (tx) => {
                // Update dispute
                await tx.dispute.update({
                    where: { dispute_id: input.dispute_id },
                    data: {
                        resolution: input.resolution,
                        status: "RESOLVED",
                        resolved_at: now,
                    },
                });

                // Execute resolution based on type
                if (input.resolution === "FULL_REFUND") {
                    // Full refund to buyer
                    await tx.transaction.update({
                        where: { transaction_id: dispute.transaction_id },
                        data: { status: TransactionStatus.REFUNDED },
                    });

                    // Restore listing
                    await tx.listing.update({
                        where: { listing_id: dispute.transaction.listing.listing_id },
                        data: { status: ListingStatus.ACTIVE },
                    });

                    // Notify buyer
                    await tx.notification.create({
                        data: {
                            user_id: dispute.transaction.buyer_id,
                            notification_type: "DISPUTE_RESOLVED",
                            title: "Dispute Diselesaikan - Full Refund",
                            body: `Dispute Anda untuk "${dispute.transaction.listing.title}" telah diselesaikan. Dana akan di-refund sepenuhnya.`,
                            data_payload: {
                                dispute_id: input.dispute_id,
                                resolution: "FULL_REFUND",
                                refund_amount: dispute.transaction.transaction_amount,
                            },
                        },
                    });

                    // Notify seller
                    await tx.notification.create({
                        data: {
                            user_id: dispute.transaction.seller_id,
                            notification_type: "DISPUTE_RESOLVED",
                            title: "Dispute Diselesaikan",
                            body: `Dispute untuk "${dispute.transaction.listing.title}" telah diselesaikan dengan full refund ke pembeli.`,
                            data_payload: { dispute_id: input.dispute_id, resolution: "FULL_REFUND" },
                        },
                    });

                } else if (input.resolution === "PARTIAL_REFUND") {
                    const refundAmount = input.partial_refund_amount!;
                    const sellerAmount = dispute.transaction.transaction_amount - refundAmount;

                    await tx.transaction.update({
                        where: { transaction_id: dispute.transaction_id },
                        data: { status: TransactionStatus.COMPLETED },
                    });

                    // Create payout for seller portion
                    if (bankAccount && sellerAmount > 0) {
                        await tx.payout.create({
                            data: {
                                transaction_id: dispute.transaction_id,
                                seller_id: dispute.transaction.seller_id,
                                payout_amount: sellerAmount,
                                bank_code: bankAccount.bank_code,
                                bank_name: bankAccount.bank_name,
                                account_number: bankAccount.account_number,
                                account_holder_name: bankAccount.account_holder_name,
                                status: "PENDING",
                            },
                        });
                    }

                    // Notify both parties
                    await tx.notification.create({
                        data: {
                            user_id: dispute.transaction.buyer_id,
                            notification_type: "DISPUTE_RESOLVED",
                            title: "Dispute Diselesaikan - Partial Refund",
                            body: `Dispute Anda telah diselesaikan. Anda akan menerima refund Rp ${refundAmount.toLocaleString("id-ID")}.`,
                            data_payload: { dispute_id: input.dispute_id, refund_amount: refundAmount },
                        },
                    });

                    await tx.notification.create({
                        data: {
                            user_id: dispute.transaction.seller_id,
                            notification_type: "DISPUTE_RESOLVED",
                            title: "Dispute Diselesaikan",
                            body: `Dispute diselesaikan dengan partial refund. Anda akan menerima Rp ${sellerAmount.toLocaleString("id-ID")}.`,
                            data_payload: { dispute_id: input.dispute_id, seller_amount: sellerAmount },
                        },
                    });

                } else {
                    // NO_REFUND - release full amount to seller
                    await tx.transaction.update({
                        where: { transaction_id: dispute.transaction_id },
                        data: {
                            status: TransactionStatus.COMPLETED,
                            completed_at: now,
                        },
                    });

                    if (bankAccount) {
                        await tx.payout.create({
                            data: {
                                transaction_id: dispute.transaction_id,
                                seller_id: dispute.transaction.seller_id,
                                payout_amount: dispute.transaction.seller_payout_amount,
                                bank_code: bankAccount.bank_code,
                                bank_name: bankAccount.bank_name,
                                account_number: bankAccount.account_number,
                                account_holder_name: bankAccount.account_holder_name,
                                status: "PENDING",
                            },
                        });
                    }

                    // Notify seller
                    await tx.notification.create({
                        data: {
                            user_id: dispute.transaction.seller_id,
                            notification_type: "DISPUTE_RESOLVED",
                            title: "Dispute Diselesaikan - Favor Anda",
                            body: `Dispute untuk "${dispute.transaction.listing.title}" diselesaikan. Dana akan dikirim ke rekening Anda.`,
                            data_payload: {
                                dispute_id: input.dispute_id,
                                payout_amount: dispute.transaction.seller_payout_amount,
                            },
                        },
                    });

                    // Notify buyer
                    await tx.notification.create({
                        data: {
                            user_id: dispute.transaction.buyer_id,
                            notification_type: "DISPUTE_RESOLVED",
                            title: "Dispute Diselesaikan",
                            body: `Dispute Anda untuk "${dispute.transaction.listing.title}" telah diselesaikan tanpa refund.`,
                            data_payload: { dispute_id: input.dispute_id, resolution: "NO_REFUND" },
                        },
                    });
                }

                // Send System Message to Chat
                let systemMessageContent = "";
                if (input.resolution === "FULL_REFUND") {
                    systemMessageContent = "SYSTEM: Dispute resolved. Full refund issued to buyer.";
                } else if (input.resolution === "NO_REFUND") {
                    systemMessageContent = "SYSTEM: Dispute resolved. Funds released to seller.";
                } else if (input.resolution === "PARTIAL_REFUND") {
                    systemMessageContent = `SYSTEM: Dispute resolved with partial refund of Rp ${input.partial_refund_amount?.toLocaleString("id-ID")}.`;
                }

                if (systemMessageContent) {
                    await tx.message.create({
                        data: {
                            transaction_id: dispute.transaction_id,
                            sender_user_id: adminId,
                            message_content: systemMessageContent,
                            is_read: false
                        }
                    });
                }

                // Audit log
                await tx.auditLog.create({
                    data: {
                        entity_type: "Dispute",
                        entity_id: input.dispute_id,
                        action_type: "DISPUTE_RESOLVED",
                        action_description: `Admin resolved dispute with ${input.resolution}`,
                        old_value: { status: dispute.status },
                        new_value: {
                            status: "RESOLVED",
                            resolution: input.resolution,
                            partial_amount: input.partial_refund_amount,
                            admin_notes: input.admin_notes,
                        },
                        performed_by_user_id: adminId,
                    },
                });
            });

            return {
                success: true,
                dispute_id: input.dispute_id,
                resolution: input.resolution,
            };
        }),
    getTransactions: adminProcedure.query(async ({ ctx }) => {
        return ctx.db.transaction.findMany({
            include: {
                buyer: {
                    select: { name: true, email: true }
                },
                seller: {
                    select: { name: true, email: true }
                },
                listing: {
                    select: { title: true }
                }
            },
            orderBy: { created_at: "desc" },
            take: 100 // Limit for now
        });
    }),

    getChatMessages: adminProcedure
        .input(z.object({ transaction_id: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
            const transaction = await ctx.db.transaction.findUnique({
                where: { transaction_id: input.transaction_id },
                select: { buyer_id: true, seller_id: true }
            });

            if (!transaction) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Transaction not found"
                });
            }

            const messages = await ctx.db.message.findMany({
                where: { transaction_id: input.transaction_id },
                include: {
                    sender: {
                        select: { name: true, role: true, user_id: true }
                    }
                },
                orderBy: { created_at: "asc" }
            });

            return messages.map(msg => ({
                ...msg,
                sender: {
                    ...msg.sender,
                    role: msg.sender.user_id === transaction.buyer_id ? "buyer" : "seller"
                }
            }));
        }),

    getUserDetails: adminProcedure
        .input(z.object({ user_id: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.db.user.findUnique({
                where: { user_id: input.user_id },
                select: {
                    user_id: true,
                    name: true,
                    email: true,
                    role: true,
                    is_verified: true,
                    is_suspended: true,
                    created_at: true,
                    updated_at: true,
                    avatar_url: true,
                    id_card_url: true,
                    listings: {
                        orderBy: { created_at: "desc" },
                        take: 10,
                        select: {
                            listing_id: true,
                            title: true,
                            price: true,
                            status: true,
                            created_at: true,
                            photo_urls: true
                        }
                    },
                    _count: {
                        select: {
                            sales: true,
                            purchases: true
                        }
                    }
                }
            });
        }),
});
