
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const listingRouter = createTRPCRouter({
    getAll: publicProcedure
        .input(
            z.object({
                limit: z.number().min(1).max(100).default(24),
                page: z.number().min(1).default(1),
                cursor: z.string().optional(),
                type: z.enum(["FIXED", "AUCTION"]).optional(),
                category: z.string().optional(),
                search: z.string().optional(),
                minPrice: z.number().min(0).optional(),
                maxPrice: z.number().optional(),
                sortBy: z.enum(["newest", "price_asc", "price_desc"]).default("newest"),
            })
        )
        .query(async ({ ctx, input }) => {
            const { limit, page, cursor, type, category, search, minPrice, maxPrice, sortBy } = input;

            const where: any = {
                status: "ACTIVE",
            };

            if (type) {
                where.listing_type = type;
            }

            if (category) {
                where.category = {
                    slug: category,
                };
            }

            if (search) {
                where.OR = [
                    { title: { contains: search, mode: "insensitive" } },
                    { description: { contains: search, mode: "insensitive" } },
                ];
            }

            if (minPrice !== undefined || maxPrice !== undefined) {
                where.price = {};
                if (minPrice !== undefined) {
                    where.price.gte = minPrice;
                }
                if (maxPrice !== undefined) {
                    where.price.lte = maxPrice;
                }
            }

            let orderBy: any;
            switch (sortBy) {
                case "price_asc":
                    orderBy = { price: "asc" };
                    break;
                case "price_desc":
                    orderBy = { price: "desc" };
                    break;
                case "newest":
                default:
                    orderBy = { created_at: "desc" };
            }

            // Get total count for pagination
            const totalCount = await ctx.db.listing.count({ where });

            const listings = await ctx.db.listing.findMany({
                take: limit,
                skip: (page - 1) * limit,
                where,
                orderBy,
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

            return {
                listings: listings.map(l => ({
                    ...l,
                    game: l.category.name,
                    bidCount: l._count.bids,
                })),
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
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
                    joinedAt: listing.seller.created_at,
                    rating: 4.8,
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

                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Harap lengkapi profil (No. HP & KTP) sebelum membuat listing.",
                });
            }

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


            return ctx.db.listing.create({
                data: {
                    seller_id: ctx.session.user.id,
                    title: input.title,
                    description: input.description,
                    price: input.price,
                    category_id: finalCategoryId,
                    listing_type: input.listing_type,
                    status: "PENDING",
                    starting_bid: input.starting_bid,
                    current_bid: input.starting_bid,
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

            const listing = await ctx.db.listing.findUnique({ where: { listing_id: input.listing_id } });
            if (!listing || listing.status !== "ACTIVE" || listing.listing_type !== "AUCTION") {
                throw new TRPCError({ code: "BAD_REQUEST", message: "Listing tidak valid atau sudah berakhir." });
            }


            await ctx.db.bid.create({
                data: {
                    listing_id: input.listing_id,
                    bidder_id: ctx.session.user.id,
                    bid_amount: input.amount,
                },
            });


            await ctx.db.listing.update({
                where: { listing_id: input.listing_id },
                data: { current_bid: input.amount },
            });

            return { success: true };
        }),

    update: protectedProcedure
        .input(
            z.object({
                listingId: z.string().uuid(),
                title: z.string().min(5).max(100).optional(),
                description: z.string().min(20).max(5000).optional(),
                price: z.number().int().min(1000).max(2000000000).optional(),
                categoryId: z.string().optional(),
                photos: z.array(z.string().url()).max(5).optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const listing = await ctx.db.listing.findUnique({
                where: { listing_id: input.listingId },
            });

            if (!listing) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Listing tidak ditemukan",
                });
            }

            if (listing.seller_id !== ctx.session.user.id) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Anda tidak memiliki akses untuk mengedit listing ini",
                });
            }

            const editableStatuses = ["DRAFT", "PENDING", "ACTIVE"];
            if (!editableStatuses.includes(listing.status)) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Listing tidak dapat diedit karena sudah terjual atau dibatalkan",
                });
            }

            const activeTransaction = await ctx.db.transaction.findFirst({
                where: {
                    listing_id: input.listingId,
                    status: {
                        notIn: ["COMPLETED", "CANCELLED", "REFUNDED"],
                    },
                },
            });

            if (activeTransaction) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Listing tidak dapat diedit karena memiliki transaksi aktif",
                });
            }

            let finalCategoryId = input.categoryId;
            if (input.categoryId) {
                const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.categoryId);
                if (!isUUID) {
                    const category = await ctx.db.category.findUnique({
                        where: { slug: input.categoryId },
                    });
                    if (!category) {
                        throw new TRPCError({
                            code: "BAD_REQUEST",
                            message: "Kategori tidak valid",
                        });
                    }
                    finalCategoryId = category.category_id;
                }
            }


            return ctx.db.listing.update({
                where: { listing_id: input.listingId },
                data: {
                    ...(input.title && { title: input.title }),
                    ...(input.description && { description: input.description }),
                    ...(input.price && { price: input.price }),
                    ...(finalCategoryId && { category_id: finalCategoryId }),
                    ...(input.photos && { photos: input.photos }),
                },
            });
        }),

    delete: protectedProcedure
        .input(z.object({ listingId: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            const listing = await ctx.db.listing.findUnique({
                where: { listing_id: input.listingId },
            });

            if (!listing) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Listing tidak ditemukan",
                });
            }

            if (listing.seller_id !== ctx.session.user.id) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Anda tidak memiliki akses untuk menghapus listing ini",
                });
            }

            const pendingTransaction = await ctx.db.transaction.findFirst({
                where: {
                    listing_id: input.listingId,
                    status: {
                        notIn: ["COMPLETED", "CANCELLED", "REFUNDED"],
                    },
                },
            });

            if (pendingTransaction) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Tidak dapat menghapus listing dengan transaksi aktif",
                });
            }


            return ctx.db.listing.update({
                where: { listing_id: input.listingId },
                data: { status: "CANCELLED" },
            });
        }),

    getByUser: protectedProcedure
        .input(
            z.object({
                status: z.enum(["DRAFT", "PENDING", "ACTIVE", "SOLD", "CANCELLED"]).optional(),
                limit: z.number().min(1).max(50).default(20),
                cursor: z.string().optional(),
            })
        )
        .query(async ({ ctx, input }) => {
            const { status, limit, cursor } = input;

            const where: any = {
                seller_id: ctx.session.user.id,
            };

            if (status) {
                where.status = status;
            }

            const listings = await ctx.db.listing.findMany({
                take: limit + 1,
                cursor: cursor ? { listing_id: cursor } : undefined,
                where,
                orderBy: { created_at: "desc" },
                include: {
                    category: {
                        select: { name: true, slug: true },
                    },
                    _count: {
                        select: { bids: true },
                    },
                },
            });

            let nextCursor: string | undefined;
            if (listings.length > limit) {
                const nextItem = listings.pop();
                nextCursor = nextItem?.listing_id;
            }

            return {
                listings: listings.map((l) => ({
                    ...l,
                    game: l.category.name,
                    bidCount: l._count.bids,
                })),
                nextCursor,
            };
        }),

    uploadPhoto: protectedProcedure
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
            const uniqueName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
            const storagePath = `listings/${uniqueName}`;

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
                token: data.token,
                publicUrl,
                path: storagePath,
            };
        }),
});
