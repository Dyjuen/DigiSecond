import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
    createTRPCRouter,
    publicProcedure,
    protectedProcedure,
    adminProcedure,
} from "../trpc";

/**
 * User router
 */
export const userRouter = createTRPCRouter({
    /**
     * Get user by ID
     */
    getById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const user = await ctx.db.user.findUnique({
                where: { user_id: input.id },
                select: {
                    user_id: true,
                    name: true,
                    avatar_url: true,
                    role: true,
                    created_at: true,
                    // Don't expose email, verified, or suspended in public view
                },
            });

            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User tidak ditemukan",
                });
            }

            return user;
        }),

    /**
     * Update own profile (including KYC data)
     */
    update: protectedProcedure
        .input(
            z.object({
                name: z.string().min(2).optional(),
                phone: z.string().regex(/^\d{11,13}$/, "Nomor HP harus 11-13 angka").optional(),
                id_card_url: z.string().url().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const user = await ctx.db.user.update({
                where: { user_id: ctx.session.user.id },
                data: input,
            });
            return user;
        }),

    /**
     * Upgrade Plan User
     */
    upgradeTier: protectedProcedure
        .input(z.object({
            tier: z.enum(["FREE", "PRO", "ENTERPRISE"])
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.user.update({
                where: { user_id: ctx.session.user.id },
                data: { tier: input.tier }
            });
        }),

    /**
     * Akses Admin buat cari User
     */
    search: adminProcedure
        .input(
            z.object({
                query: z.string().min(1),
                limit: z.number().min(1).max(100).default(20),
                cursor: z.string().optional(),
            })
        )
        .query(async ({ ctx, input }) => {
            const users = await ctx.db.user.findMany({
                where: {
                    OR: [
                        { name: { contains: input.query, mode: "insensitive" } },
                        { email: { contains: input.query, mode: "insensitive" } },
                    ],
                },
                take: input.limit + 1,
                cursor: input.cursor ? { user_id: input.cursor } : undefined,
                orderBy: { created_at: "desc" },
                select: {
                    user_id: true,
                    email: true,
                    name: true,
                    avatar_url: true,
                    role: true,
                    is_verified: true,
                    is_suspended: true,
                    created_at: true,
                },
            });

            let nextCursor: string | undefined = undefined;
            if (users.length > input.limit) {
                const nextItem = users.pop();
                nextCursor = nextItem?.user_id;
            }

            return {
                users,
                nextCursor,
            };
        }),

    /**
     * Akses Admin untuk display list User (Bisa pake pagination atau enggak ler, bebas)
     */
    list: adminProcedure
        .input(
            z.object({
                limit: z.number().min(1).max(100).default(20),
                cursor: z.string().optional(),
                role: z.enum(["BUYER", "SELLER", "ADMIN"]).optional(),
                suspended: z.boolean().optional(),
            })
        )
        .query(async ({ ctx, input }) => {
            const where: any = {};
            if (input.role) where.role = input.role;
            if (input.suspended !== undefined) where.suspended = input.suspended;

            const users = await ctx.db.user.findMany({
                where,
                take: input.limit + 1,
                cursor: input.cursor ? { user_id: input.cursor } : undefined,
                orderBy: { created_at: "desc" },
                select: {
                    user_id: true,
                    email: true,
                    name: true,
                    avatar_url: true,
                    role: true,
                    is_verified: true,
                    is_suspended: true,
                    created_at: true,
                },
            });

            let nextCursor: string | undefined = undefined;
            if (users.length > input.limit) {
                const nextItem = users.pop();
                nextCursor = nextItem?.user_id;
            }

            return {
                users,
                nextCursor,
            };
        }),

    /**
     * User hapus akun sendiri (Ini masih early phase, buat advanced dan tingkat produksi nanti ada validasi kalau user masih ada transaksi yang berjalan atau enggak dsb.)
     */
    deleteAccount: protectedProcedure
        .input(
            z.object({
                confirmation: z.literal("DELETE_MY_ACCOUNT"),
            })
        )
        .mutation(async ({ ctx, input }) => {

            await ctx.db.user.delete({
                where: { user_id: ctx.session.user.id },
            });

            return { success: true };
        }),

    /**
     * Akses Admin untuk lihat statistik user
     */
    getStats: adminProcedure.query(async ({ ctx }) => {
        const [total, buyers, sellers, admins, verified, suspended] =
            await Promise.all([
                ctx.db.user.count(),
                ctx.db.user.count({ where: { role: "BUYER" } }),
                ctx.db.user.count({ where: { role: "SELLER" } }),
                ctx.db.user.count({ where: { role: "ADMIN" } }),
                ctx.db.user.count({ where: { is_verified: true } }),
                ctx.db.user.count({ where: { is_suspended: true } }),
            ]);

        return {
            total,
            byRole: {
                buyer: buyers,
                seller: sellers,
                admin: admins,
            },
            verified,
            suspended,
        };
    }),
});
