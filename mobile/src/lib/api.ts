import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "../../../src/server/api/root";

/**
 * tRPC React client for mobile
 * Shares types with web backend
 */
export const api = createTRPCReact<AppRouter>();

/**
 * Create tRPC client with auth token
 * @param token - JWT auth token from auth store
 */
export function createTRPCClient(token: string | null) {
    return api.createClient({
        links: [
            httpBatchLink({
                url: `${process.env.EXPO_PUBLIC_API_URL}/api/trpc`,
                headers: () => ({
                    Authorization: token ? `Bearer ${token}` : "",
                }),
                transformer: superjson,
            }),
        ],
    });
}
