import { useEffect } from "react";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useAuthStore } from "../stores/authStore";

/**
 * Deep Link Authentication Hook
 * 
 * Listens for deep links in the format:
 * digisecond://auth-callback?token=<jwt>
 * 
 * When received:
 * 1. Extracts JWT token from URL
 * 2. Decodes token to get user info
 * 3. Stores token and user in authStore
 * 4. Navigates to home screen
 * 
 * Usage:
 * Call this hook at the root of your app (_layout.tsx)
 */
export function useDeepLinkAuth() {
    const { setAuth } = useAuthStore();

    useEffect(() => {
        // Handle initial URL (app opened via deep link)
        const handleInitialUrl = async () => {
            const initialUrl = await Linking.getInitialURL();
            if (initialUrl) {
                processAuthUrl(initialUrl);
            }
        };

        // Handle URL events (app already open, receives deep link)
        const handleUrlEvent = (event: { url: string }) => {
            processAuthUrl(event.url);
        };

        const processAuthUrl = (url: string) => {
            const { hostname, queryParams } = Linking.parse(url);

            // Only process auth-callback deep links
            if (hostname !== "auth-callback") {
                return;
            }

            const token = queryParams?.token as string | undefined;

            if (!token) {
                console.warn("[DeepLink] No token in auth-callback URL");
                return;
            }

            try {
                // Decode JWT to extract user info
                // JWT format: header.payload.signature
                const payloadBase64 = token.split(".")[1];
                if (!payloadBase64) {
                    throw new Error("Invalid token format");
                }

                // Decode base64url (replace - with +, _ with /, and pad)
                const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
                const paddedBase64 = base64.padEnd(
                    base64.length + ((4 - (base64.length % 4)) % 4),
                    "="
                );
                const jsonPayload = atob(paddedBase64);
                const payload = JSON.parse(jsonPayload);

                // Extract user data from JWT payload
                const user = {
                    id: payload.sub,
                    email: payload.email,
                    name: payload.name || payload.email,
                    avatar: null,
                    role: payload.role,
                    verified: payload.verified,
                };

                // Store auth data
                setAuth(token, user);

                console.log("[DeepLink] Authentication successful:", user.email);

                // Navigate to home screen
                router.replace("/(tabs)");
            } catch (error) {
                console.error("[DeepLink] Failed to process auth token:", error);
            }
        };

        handleInitialUrl();

        const subscription = Linking.addEventListener("url", handleUrlEvent);

        return () => {
            subscription.remove();
        };
    }, [setAuth]);
}
