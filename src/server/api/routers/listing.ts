import { ListingStatus, TransactionStatus, PaymentStatus } from "@prisma/client";
import { getPlatformConfig } from "@/server/config";
import { calculateFees } from "@/lib/xendit";
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
                status: ListingStatus.ACTIVE,
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
                    bids: {
                        orderBy: { bid_amount: "desc" },
                        take: 10, // Limit to top 10 most recent/highest bids for the log
                        include: {
                            bidder: {
                                select: {
                                    name: true,
                                    avatar_url: true,
                                    created_at: true,
                                }
                            }
                        }
                    }
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
                },
                bids: listing.bids.map(bid => ({
                    ...bid,
                    bidderName: bid.bidder.name,
                    bidderAvatar: bid.bidder.avatar_url,
                    bidderJoinedAt: bid.bidder.created_at,
                }))
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
                photos: z.array(z.string()).optional(),
                status: z.enum(["DRAFT", "active", "ACTIVE", "PENDING"]).optional(), // Allow status input
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
                    status: (input.status as any) || "ACTIVE", // Default to ACTIVE for now
                    starting_bid: input.starting_bid,
                    current_bid: input.starting_bid,
                    bid_increment: input.bid_increment,
                    auction_ends_at: input.auction_ends_at,
                    buy_now_price: input.buy_now_price,
                    photo_urls: input.photos,
                },
            });
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
                    ...(finalCategoryId && { category: { connect: { category_id: finalCategoryId } } }),
                    ...(input.photos && { photo_urls: input.photos }),
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

            // Delete photos from Supabase storage
            if (listing.photo_urls && listing.photo_urls.length > 0) {
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

                if (supabaseUrl && supabaseKey) {
                    const { createClient } = await import("@supabase/supabase-js");
                    const supabase = createClient(supabaseUrl, supabaseKey);

                    // Extract file paths from URLs
                    const filePaths = listing.photo_urls
                        .map((url) => {
                            // URL format: https://[project].supabase.co/storage/v1/object/public/uploads/[path]
                            const match = url.match(/\/uploads\/(.+)$/);
                            return match ? match[1] : null;
                        })
                        .filter(Boolean) as string[];

                    if (filePaths.length > 0) {
                        const { error } = await supabase.storage
                            .from("uploads")
                            .remove(filePaths);

                        if (error) {
                            console.error("Failed to delete photos from storage:", error);
                            // Continue with listing deletion even if photo deletion fails
                        }
                    }
                }
            }

            // Hard delete the listing
            return ctx.db.listing.delete({
                where: { listing_id: input.listingId },
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

    finishAuction: protectedProcedure
        .input(z.object({ listingId: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            const { db, session } = ctx;
            const userId = session.user.id;

            const listing = await db.listing.findUnique({
                where: { listing_id: input.listingId },
                include: {
                    _count: { select: { bids: true } },
                },
            });

            if (!listing) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Listing tidak ditemukan",
                });
            }

            if (listing.seller_id !== userId) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Anda bukan penjual listing ini",
                });
            }

            if (listing.listing_type !== "AUCTION") {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Listing ini bukan lelang",
                });
            }

            if (listing.status !== "ACTIVE") {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Lelang sudah berakhir atau tidak aktif",
                });
            }

            // Check if there are any bids
            const highestBid = await db.bid.findFirst({
                where: { listing_id: listing.listing_id },
                orderBy: { bid_amount: "desc" },
                include: { bidder: true },
            });

            if (!highestBid) {
                // No bids, just end the auction
                await db.listing.update({
                    where: { listing_id: listing.listing_id },
                    data: {
                        // Or should we have an ENDED status that is not SOLD?
                        // Actually let's use auction_status if available or just keep it active but expired?
                        // Schema says AuctionStatus enum exists and ListingStatus has SOLD/CANCELLED/ACTIVE
                        // Let's use CANCELLED or check if we can add ENDED to ListingStatus.
                        // ListingStatus has DRAFT, ACTIVE, SOLD, CANCELLED, PENDING.
                        // If no bids, maybe just keep it active or cancel it?
                        // User request says "bisa user (penjual) menyelesaikan lelang".
                        // If no bids, typically it ends unsold.
                        // Let's mark as CANCELLED for now or we might need a new status "UNSOLD" or just leave it.
                        // Re-reading logic: "If no bid: Update Listing -> ENDED".
                        // Wait, ListingStatus doesn't have ENDED.
                        // I added NotificationType AUCTION_ENDED_NO_BIDS.
                        // I'll set status to CANCELLED for now as "Unsold".
                        status: "CANCELLED",
                    },
                });

                await db.notification.create({
                    data: {
                        user_id: userId,
                        notification_type: "AUCTION_ENDED_NO_BIDS",
                        title: "Lelang Berakhir Tanpa Penawar",
                        body: `Lelang untuk "${listing.title}" telah diakhiri manual dan tidak ada penawaran.`,
                        data_payload: { listing_id: listing.listing_id },
                    },
                });

                return { status: "CANCELLED", message: "Lelang diakhiri tanpa pemenang." };
            }

            // Has winner, create transaction
            const transactionAmount = highestBid.bid_amount;

            // Get system config
            const config = await getPlatformConfig(db);
            const { platformFee, sellerPayout } = calculateFees(transactionAmount, config.platformFeePercentage);

            // Create transaction within a transaction
            const transaction = await db.$transaction(async (tx) => {
                // Update listing to PENDING
                await tx.listing.update({
                    where: { listing_id: listing.listing_id },
                    data: { status: "PENDING" },
                });

                // Create transaction
                const newTx = await tx.transaction.create({
                    data: {
                        listing_id: listing.listing_id,
                        buyer_id: highestBid.bidder_id,
                        seller_id: listing.seller_id,
                        transaction_amount: transactionAmount,
                        platform_fee_amount: platformFee,
                        seller_payout_amount: sellerPayout,
                        status: TransactionStatus.PENDING_PAYMENT,
                    },
                });

                // Create notification for winner
                await tx.notification.create({
                    data: {
                        user_id: highestBid.bidder_id,
                        notification_type: "AUCTION_WON",
                        title: "Selamat! Anda Memenangkan Lelang",
                        body: `Anda memenangkan lelang "${listing.title}". Segera selesaikan pembayaran.`,
                        data_payload: {
                            listing_id: listing.listing_id,
                            transaction_id: newTx.transaction_id
                        },
                    },
                });

                return newTx;
            });

            return {
                status: "PENDING_PAYMENT",
                message: "Lelang selesai. Transaksi telah dibuat untuk pemenang.",
                transactionId: transaction.transaction_id
            };
        }),

    placeBid: protectedProcedure
        .input(z.object({
            listingId: z.string().uuid(),
            amount: z.number().min(1)
        }))
        .mutation(async ({ ctx, input }) => {
            const { db, session } = ctx;
            const userId = session.user.id;

            return await db.$transaction(async (tx) => {
                const listing = await tx.listing.findUnique({
                    where: { listing_id: input.listingId },
                    include: {
                        _count: { select: { bids: true } }
                    }
                });

                if (!listing) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Listing tidak ditemukan",
                    });
                }

                if (listing.seller_id === userId) {
                    throw new TRPCError({
                        code: "FORBIDDEN",
                        message: "Anda tidak dapat menawar listing sendiri",
                    });
                }

                if (listing.listing_type !== "AUCTION") {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Listing ini bukan lelang",
                    });
                }

                if (listing.status !== "ACTIVE") {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Lelang sudah berakhir atau tidak aktif",
                    });
                }

                if (listing.auction_ends_at && new Date() > listing.auction_ends_at) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Waktu sewa lelang sudah berakhir",
                    });
                }

                // Get current highest bid
                const highestBid = await tx.bid.findFirst({
                    where: { listing_id: input.listingId },
                    orderBy: { bid_amount: "desc" },
                });

                const currentPrice = highestBid ? highestBid.bid_amount : (listing.starting_bid || 0);
                const minBid = currentPrice + (listing.bid_increment || 10000);

                if (input.amount < minBid) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: `Penawaran minimal adalah Rp ${minBid.toLocaleString("id-ID")}`,
                    });
                }

                // Create Bid
                const newBid = await tx.bid.create({
                    data: {
                        listing_id: input.listingId,
                        bidder_id: userId,
                        bid_amount: input.amount,
                    },
                });

                // Update listing stats
                await tx.listing.update({
                    where: { listing_id: listing.listing_id },
                    data: {
                        current_bid: input.amount,
                    }
                });

                // Notification to previous bidder if exists
                if (highestBid && highestBid.bidder_id !== userId) {
                    await tx.notification.create({
                        data: {
                            user_id: highestBid.bidder_id,
                            notification_type: "AUCTION_OUTBID",
                            title: "Penawaran Anda Kalah!",
                            body: `Seseorang telah menawar lebih tinggi untuk "${listing.title}". Tawar lagi sekarang!`,
                            data_payload: { listing_id: listing.listing_id },
                        },
                    });
                }

                return { success: true, message: "Penawaran berhasil dikirim", bid: newBid };
            });
        }),

});
