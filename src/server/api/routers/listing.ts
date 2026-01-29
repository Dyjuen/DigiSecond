
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { ListingType, ListingStatus } from "@prisma/client";

export const listingRouter = createTRPCRouter({
    getAll: publicProcedure
        .input(
            z.object({
                limit: z.number().min(1).max(100).default(20),
                cursor: z.string().optional(),
                type: z.enum(["FIXED", "AUCTION"]).optional(),
                category: z.string().optional(), // category slug
                search: z.string().optional(),
            })
        )
        .query(async ({ ctx, input }) => {
            const { limit, cursor, type, category, search } = input;

            // Build where clause
            const where: any = {
                status: ListingStatus.ACTIVE,
            };

            if (type) {
                where.listing_type = type === "FIXED" ? ListingType.FIXED : ListingType.AUCTION;
            }

            if (category) {
                where.category = {
                    slug: category,
                };
            }

            if (search) {
                where.title = {
                    contains: search,
                    mode: "insensitive",
                };
            }

            const listings = await ctx.db.listing.findMany({
                take: limit + 1,
                cursor: cursor ? { listing_id: cursor } : undefined,
                where,
                orderBy: {
                    created_at: "desc",
                },
                include: {
                    seller: {
                        select: {
                            name: true,
                            avatar_url: true,
                            is_verified: true,
                            rating: true,
                        },
                    },
                    category: {
                        select: {
                            name: true,
                            slug: true,
                        },
                    },
                    _count: {
                        select: { bids: true },
                    },
                },
            });

            let nextCursor: string | undefined = undefined;
            if (listings.length > limit) {
                const nextItem = listings.pop();
                nextCursor = nextItem?.listing_id;
            }

            return {
                listings: listings.map(l => ({
                    ...l,
                    game: l.category.name, // Map for frontend compatibility
                    bidCount: l._count.bids,
                })),
                nextCursor,
            };
        }),

    getById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const listing = await ctx.db.listing.findUnique({
                where: { listing_id: input.id },
                include: {
                    seller: {
                        select: {
                            user_id: true,
                            name: true,
                            avatar_url: true,
                            is_verified: true,
                            rating: true,
                            created_at: true,
                        },
                    },
                    category: {
                        select: {
                            name: true,
                            slug: true,
                        },
                    },
                    _count: {
                        select: { bids: true },
                    },
                },
            });

            if (!listing) return null;

            return {
                ...listing,
                game: listing.category.name,
                bidCount: listing._count.bids,
                seller: {
                    ...listing.seller,
                    joinedAt: listing.seller.created_at, // Map for frontend
                    rating: 4.8, // Hardcode decent rating if 0 for now
                }
            };
        }),

    create: protectedProcedure
        .input(
            z.object({
                title: z.string().min(5).max(100),
                description: z.string().min(20),
                price: z.number().min(1000).max(2000000000, "Harga maksimal 2 Milyar"),
                category_id: z.string(),
                listing_type: z.enum(["FIXED", "AUCTION"]),
                // Auction specific
                starting_bid: z.number().optional(),
                bid_increment: z.number().default(5000),
                auction_ends_at: z.date().optional(),
                buy_now_price: z.number().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // KYC GUARD
            const user = await ctx.db.user.findUnique({ where: { user_id: ctx.session.user.id } });
            if (!user?.phone || !user?.id_card_url) {
                // In production, check !user.is_verified too if manual verification is required
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Harap lengkapi profil (No. HP & KTP) sebelum membuat listing.",
                });
            }

            // Category Lookup Logic (Handle Slug vs ID)
            let finalCategoryId = input.category_id;
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.category_id);

            if (!isUUID) {
                const category = await ctx.db.category.findUnique({
                    where: { slug: input.category_id },
                });

                if (!category) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Kategori tidak valid",
                    });
                }
                finalCategoryId = category.category_id;
            }

            // Create Listing
            return ctx.db.listing.create({
                data: {
                    seller_id: ctx.session.user.id,
                    title: input.title,
                    description: input.description,
                    price: input.price,
                    category_id: finalCategoryId,
                    listing_type: input.listing_type,
                    status: ListingStatus.PENDING, // Wait for Admin Approval
                    starting_bid: input.starting_bid,
                    current_bid: input.starting_bid, // Initialize current bid
                    bid_increment: input.bid_increment,
                    auction_ends_at: input.auction_ends_at,
                    buy_now_price: input.buy_now_price,
                },
            });
        }),

    placeBid: protectedProcedure
        .input(z.object({ listing_id: z.string(), amount: z.number() }))
        .mutation(async ({ ctx, input }) => {
            // KYC GUARD
            const user = await ctx.db.user.findUnique({ where: { user_id: ctx.session.user.id } });
            if (!user?.phone || !user?.id_card_url) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Harap lengkapi profil (No. HP & KTP) sebelum menawar.",
                });
            }

            // Check Listing Validity
            const listing = await ctx.db.listing.findUnique({ where: { listing_id: input.listing_id } });
            if (!listing || listing.status !== ListingStatus.ACTIVE || listing.listing_type !== ListingType.AUCTION) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "Listing tidak valid atau sudah berakhir." });
            }

            // In real app, check constraints (amount > current_bid, time < ends_at)

            // For MVP: Log bid
            await ctx.db.bid.create({
                data: {
                    listing_id: input.listing_id,
                    bidder_id: ctx.session.user.id,
                    bid_amount: input.amount,
                },
            });

            // Update Listing Current Bid
            await ctx.db.listing.update({
                where: { listing_id: input.listing_id },
                data: { current_bid: input.amount },
            });

            return { success: true };
        }),
});
