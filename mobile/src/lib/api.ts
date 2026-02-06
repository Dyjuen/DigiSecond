import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "../../../src/server/api/root";

/**
 * tRPC React client for mobile
 * Shares types with web backend
 */
export const api = createTRPCReact<AppRouter>();

import { useAuthStore } from "../stores/authStore";

/**
 * Create tRPC client with dynamic auth token
 */
export function createTRPCClient() {
    return api.createClient({
        links: [
            httpBatchLink({
                url: `${process.env.EXPO_PUBLIC_API_URL}/api/trpc`,
                headers: () => {
                    const token = useAuthStore.getState().token;
                    return {
                        Authorization: token ? `Bearer ${token}` : "",
                    };
                },
                transformer: superjson,
            }),
        ],
    });
}
