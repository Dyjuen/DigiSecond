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
     * User Registration
     */
    register: publicProcedure
        .input(
            z.object({
                email: z.string().email(),
                password: z.string().min(8),
                name: z.string().min(1).max(100),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const existing = await ctx.db.user.findUnique({ where: { email: input.email } });
            if (existing) {
                throw new TRPCError({ code: "CONFLICT", message: "Email sudah terdaftar" });
            }
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const bcrypt = require("bcryptjs");
            const hash = await bcrypt.hash(input.password, 10);
            const user = await ctx.db.user.create({
                data: {
                    email: input.email,
                    password_hash: hash,
                    name: input.name,
                    is_verified: false,
                    is_suspended: false,
                },
                select: {
                    user_id: true,
                    email: true,
                    name: true,
                    is_verified: true,
                },
            });
            return user;
        }),

    /**
     * Request Password Reset
     */
    requestPasswordReset: publicProcedure
        .input(z.object({ email: z.string().email() }))
        .mutation(async ({ ctx, input }) => { // eslint-disable-line @typescript-eslint/no-unused-vars
            const user = await ctx.db.user.findUnique({ where: { email: input.email } });
            if (!user) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Email tidak ditemukan" });
            }
            return { ok: true };
        }),

    /**
     * Reset Password
     */
    resetPassword: publicProcedure
        .input(z.object({
            token: z.string(),
            newPassword: z.string().min(8),
        }))
        .mutation(async ({ ctx, input }) => { // eslint-disable-line @typescript-eslint/no-unused-vars
            return { ok: true };
        }),

    /**
     * Email Verification
     */
    verifyEmail: publicProcedure
        .input(z.object({ token: z.string() }))
        .mutation(async ({ ctx, input }) => { // eslint-disable-line @typescript-eslint/no-unused-vars
            return { ok: true };
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
            throw new TRPCError({ code: "NOT_FOUND", message: "User tidak ditemukan" });
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