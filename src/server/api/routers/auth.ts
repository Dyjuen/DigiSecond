import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
    createTRPCRouter,
    publicProcedure,
    protectedProcedure,
    adminProcedure,
} from "../trpc";

/**
 * Auth router
 * Handles authentication, session, and basic user profile operations
 */
export const authRouter = createTRPCRouter({
    /**
     * Cek Sesi
     */
    getSession: publicProcedure.query(({ ctx }) => {
        return ctx.session;
    }),

    /**
     * Akses User untuk lihat Profile Sendiri
     */
    getMe: protectedProcedure.query(async ({ ctx }) => {
        const user = await ctx.db.user.findUnique({
            where: { user_id: ctx.session.user.id },
            select: {
                user_id: true,
                email: true,
                name: true,
                avatar_url: true,
                role: true,
                is_verified: true,
                is_suspended: true,
                created_at: true,
                updated_at: true,
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
     * Akses User untuk ubah/update Profile
     */
    updateProfile: protectedProcedure
        .input(
            z.object({
                name: z.string().min(1).max(100).optional(),
                avatar_url: z.string().url().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const updated = await ctx.db.user.update({
                where: { user_id: ctx.session.user.id },
                data: input,
                select: {
                    user_id: true,
                    name: true,
                    avatar_url: true,
                    updated_at: true,
                },
            });

            return updated;
        }),

    /**
     * Ubah Role jadi Seller
     */
    requestSellerRole: protectedProcedure.mutation(async ({ ctx }) => {
        const currentRole = ctx.session.user.role;

        if (currentRole === "SELLER" || currentRole === "ADMIN") {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Anda sudah memiliki akses penjual",
            });
        }

        if (!ctx.session.user.verified) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "Anda harus memverifikasi email terlebih dahulu",
            });
        }

        const updated = await ctx.db.user.update({
            where: { user_id: ctx.session.user.id },
            data: { role: "SELLER" },
            select: {
                user_id: true,
                role: true,
            },
        });

        return {
            success: true,
            newRole: updated.role,
        };
    }),

    /**
     * Akses Admin buat Suspend/Unsuspend User
     */
    toggleUserSuspension: adminProcedure
        .input(
            z.object({
                userId: z.string(),
                suspended: z.boolean(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const user = await ctx.db.user.update({
                where: { user_id: input.userId },
                data: { is_suspended: input.suspended },
                select: {
                    user_id: true,
                    email: true,
                    is_suspended: true,
                },
            });

            return user;
        }),

    /**
     * Akses Admin buat ganti Role User
     */
    changeUserRole: adminProcedure
        .input(
            z.object({
                userId: z.string(),
                role: z.enum(["BUYER", "SELLER", "ADMIN"]),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const user = await ctx.db.user.update({
                where: { user_id: input.userId },
                data: { role: input.role },
                select: {
                    user_id: true,
                    email: true,
                    role: true,
                },
            });

            return user;
        }),
});

/**
 * CATATAN
 * Router masih tahap basic belum production-ready, konfigurasi lanjutan seperti email verification nanti ya... nunggu frontend jadi dulu biar bisa request tampilan
 * Fitur-fitur lanjutan seperti reset password, 2FA, OAuth, dsb. juga menyusul ya
*/