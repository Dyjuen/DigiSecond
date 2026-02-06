import { createTRPCRouter } from "./trpc";
import { authRouter } from "./routers/auth";
import { userRouter } from "./routers/user";
import { listingRouter } from "./routers/listing";
import { transactionRouter } from "./routers/transaction";
import { adminRouter } from "./routers/admin";
import { paymentRouter } from "./routers/payment";
import { disputeRouter } from "./routers/dispute";
import { messageRouter } from "./routers/message";
import { reviewRouter } from "./routers/review";

import { categoryRouter } from "./routers/category";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
    admin: adminRouter,
    auth: authRouter,
    user: userRouter,
    listing: listingRouter,
    transaction: transactionRouter,
    payment: paymentRouter,
    dispute: disputeRouter,
    message: messageRouter,
    review: reviewRouter,
    category: categoryRouter,
});

export type AppRouter = typeof appRouter;
