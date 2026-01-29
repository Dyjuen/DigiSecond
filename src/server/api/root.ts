import { createTRPCRouter } from "./trpc";
import { authRouter } from "./routers/auth";
import { userRouter } from "./routers/user";
import { listingRouter } from "./routers/listing";
import { transactionRouter } from "./routers/transaction";
import { adminRouter } from "./routers/admin";

/**
 * Root tRPC router
 * All routers are merged here
 */
export const appRouter = createTRPCRouter({
    auth: authRouter,
    user: userRouter,
    listing: listingRouter,
    transaction: transactionRouter,
    admin: adminRouter,
    // payment: paymentRouter,
    // dispute: disputeRouter,
    // message: messageRouter,
    // review: reviewRouter,
});

// Export type for client usage
export type AppRouter = typeof appRouter;
