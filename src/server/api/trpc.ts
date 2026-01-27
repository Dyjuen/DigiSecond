import { initTRPC, TRPCError } from "@trpc/server";
import { type Session } from "next-auth";
import superjson from "superjson";
import { z } from "zod";
import { db } from "../db";
import { getServerAuthSession } from "../auth";

/**
 * tRPC Context
 * Available in all procedures
 */
interface CreateContextOptions {
    session: Session | null;
}

export const createInnerTRPCContext = (opts: CreateContextOptions) => {
    return {
        session: opts.session,
        db,
    };
};

export const createTRPCContext = async () => {
    const session = await getServerAuthSession();
    return createInnerTRPCContext({ session });
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

/**
 * tRPC Initialization
 */
const t = initTRPC.context<Context>().create({
    transformer: superjson,
    errorFormatter({ shape, error }) {
        return {
            ...shape,
            data: {
                ...shape.data,
                zodError:
                    error.cause instanceof z.ZodError ? error.cause.flatten() : null,
            },
        };
    },
});

/**
 * Router and procedure helpers
 */
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

/**
 * Public procedure - no authentication required
 */
export const publicProcedure = t.procedure;

/**
 * Protected procedure - requires authenticated session
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
    if (!ctx.session?.user) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Anda harus login untuk mengakses ini",
        });
    }
    if (ctx.session.user.suspended) {
        throw new TRPCError({
            code: "FORBIDDEN",
            message: "Akun Anda telah ditangguhkan",
        });
    }
    return next({
        ctx: {
            ...ctx,
            session: { ...ctx.session, user: ctx.session.user },
        },
    });
});

/**
 * Verified procedure - requires verified email
 */
export const verifiedProcedure = protectedProcedure.use(({ ctx, next }) => {
    if (!ctx.session.user.verified) {
        throw new TRPCError({
            code: "FORBIDDEN",
            message: "Anda harus memverifikasi email terlebih dahulu",
        });
    }
    return next({ ctx });
});

/**
 * Admin procedure - requires admin role
 */
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
    if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({
            code: "FORBIDDEN",
            message: "Anda tidak memiliki akses",
        });
    }
    return next({ ctx });
});