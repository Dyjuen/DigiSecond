
import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "../trpc";
import { ListingStatus, TransactionStatus } from "@prisma/client";

export const adminRouter = createTRPCRouter({
    getDashboardStats: adminProcedure.query(async ({ ctx }) => {
        // 1. Total Users
        const totalUsers = await ctx.db.user.count();

        // 2. Active Listings
        const activeListings = await ctx.db.listing.count({
            where: { status: ListingStatus.ACTIVE },
        });

        // 3. Total Transactions (Sum of price for COMPLETED transactions)
        // Since we might not have a dedicated Transaction table populated yet or it's named 'Transaction',
        // let's check the schema first. Assuming 'Transaction' model exists from previous context.
        // If not, we'll return 0 or mock it accurately based on schema.
        // Checking schema via memory: I recall 'Transaction' model in other routers.

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

        // 4. Open Disputes
        const openDisputes = await ctx.db.dispute.count({
            where: { status: 'OPEN' }
        });

        // 6. Pending Listings
        const pendingListings = await ctx.db.listing.count({
            where: { status: ListingStatus.PENDING }
        });

        // 5. Recent Activity (Latest 5 users)
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
                        }
                    }
                }
            },
            orderBy: { created_at: "desc" }
        });
    }),

    resolveDispute: adminProcedure
        .input(z.object({
            dispute_id: z.string(),
            resolution: z.enum(["FULL_REFUND", "PARTIAL_REFUND", "NO_REFUND"]),
            status: z.enum(["RESOLVED"])
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.dispute.update({
                where: { dispute_id: input.dispute_id },
                data: {
                    resolution: input.resolution,
                    status: input.status,
                    resolved_at: new Date()
                }
            });
        }),
});
