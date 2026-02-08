import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const wishlistRouter = createTRPCRouter({
    toggle: protectedProcedure
        .input(z.object({ listingId: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;
            const { listingId } = input;

            const existing = await ctx.db.wishlist.findUnique({
                where: {
                    user_id_listing_id: {
                        user_id: userId,
                        listing_id: listingId,
                    },
                },
            });

            if (existing) {
                await ctx.db.wishlist.delete({
                    where: {
                        user_id_listing_id: {
                            user_id: userId,
                            listing_id: listingId,
                        },
                    },
                });
                return { added: false };
            } else {
                await ctx.db.wishlist.create({
                    data: {
                        user_id: userId,
                        listing_id: listingId,
                    },
                });
                return { added: true };
            }
        }),

    check: protectedProcedure
        .input(z.object({ listingId: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;
            const { listingId } = input;

            const existing = await ctx.db.wishlist.findUnique({
                where: {
                    user_id_listing_id: {
                        user_id: userId,
                        listing_id: listingId,
                    },
                },
            });

            return { isWishlisted: !!existing };
        }),

    getUserWishlist: protectedProcedure
        .input(
            z.object({
                limit: z.number().min(1).max(50).default(20),
                cursor: z.string().optional(),
            })
        )
        .query(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;
            const { limit, cursor } = input;

            const wishlists = await ctx.db.wishlist.findMany({
                where: { user_id: userId },
                include: {
                    listing: {
                        include: {
                            category: {
                                select: { name: true, slug: true },
                            },
                        },
                    },
                },
                take: limit + 1,
                cursor: cursor ? { wishlist_id: cursor } : undefined,
                orderBy: { created_at: "desc" },
            });

            let nextCursor: string | undefined;
            if (wishlists.length > limit) {
                const nextItem = wishlists.pop();
                nextCursor = nextItem?.wishlist_id;
            }

            return {
                items: wishlists.map((w) => ({
                    ...w.listing,
                    game: w.listing.category.name,
                    wishlist_id: w.wishlist_id,
                    added_at: w.created_at,
                })),
                nextCursor,
            };
        }),
});
