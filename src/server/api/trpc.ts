import { initTRPC, TRPCError } from "@trpc/server";
import { type Session } from "next-auth";
import superjson from "superjson";
import { ZodError } from "zod";
import { db } from "../db";
import { getServerAuthSession, type Role } from "../auth";

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

type Context = Awaited<ReturnType<typeof createTRPCContext>>;
type AuthenticatedContext = Context & {
    session: NonNullable<Context["session"]>;
};

/**
 * tRPC Initialization
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
    transformer: superjson,
    errorFormatter({ shape, error }) {
        return {
            ...shape,
            data: {
                ...shape.data,
                zodError:
                    error.cause instanceof ZodError ? error.cause.flatten() : null,
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
            session: ctx.session as NonNullable<typeof ctx.session>,
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
            message: "Anda tidak memiliki akses admin",
        });
    }
    return next({ ctx });
});

/**
 * Seller procedure - requires seller or admin role
 */
export const sellerProcedure = protectedProcedure.use(({ ctx, next }) => {
    const role = ctx.session.user.role;
    if (role !== "SELLER" && role !== "ADMIN") {
        throw new TRPCError({
            code: "FORBIDDEN",
            message: "Anda harus menjadi penjual untuk mengakses ini",
        });
    }
    return next({ ctx });
});

/**
 * Buyer procedure - requires buyer or admin role
 */
export const buyerProcedure = protectedProcedure.use(({ ctx, next }) => {
    const role = ctx.session.user.role;
    if (role !== "BUYER" && role !== "ADMIN") {
        throw new TRPCError({
            code: "FORBIDDEN",
            message: "Anda harus menjadi pembeli untuk mengakses ini",
        });
    }
    return next({ ctx });
});
