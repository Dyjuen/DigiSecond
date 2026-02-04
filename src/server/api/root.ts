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

export const appRouter = createTRPCRouter({
    auth: authRouter,
    user: userRouter,
    listing: listingRouter,
    transaction: transactionRouter,
    admin: adminRouter,
    payment: paymentRouter,
    dispute: disputeRouter,
    message: messageRouter,
    review: reviewRouter,
});

export type AppRouter = typeof appRouter;
