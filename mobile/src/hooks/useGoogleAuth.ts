import { useState, useEffect } from "react";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import { useAuthStore } from "../stores/authStore";

// Complete WebBrowser session on redirect
WebBrowser.maybeCompleteAuthSession();

interface UseGoogleAuthProps {
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

export function useGoogleAuth({ onSuccess, onError }: UseGoogleAuthProps) {
    const [loading, setLoading] = useState(false);
    const { setAuth } = useAuthStore();

    // Use Expo's auth.expo.io proxy for Expo Go
    const redirectUri = makeRedirectUri({
        scheme: "digisecond",
        path: "redirect",
    });

    const [, response, promptAsync] = Google.useAuthRequest({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
        redirectUri,
    });

    useEffect(() => {
        if (response?.type === "success") {
            exchangeToken(response.authentication?.idToken);
        } else if (response?.type === "error") {
            setLoading(false);
            onError?.(response.error?.message || "OAuth failed");
        }
    }, [response]);

    const exchangeToken = async (googleToken: string | undefined) => {
        if (!googleToken) {
            onError?.("No access token received");
            setLoading(false);
            return;
        }

        setLoading(true);

        try {
            const apiUrl = process.env.EXPO_PUBLIC_API_URL;
            const res = await fetch(`${apiUrl}/api/auth/mobile/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accessToken: googleToken }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Authentication failed");
            }

            const data = await res.json();

            // Update auth store
            setAuth(data.token, data.user);

            onSuccess?.();
        } catch (err: unknown) {
            console.error("Google auth error:", err);
            const message = err instanceof Error ? err.message : "Failed to authenticate";
            onError?.(message);
        } finally {
            setLoading(false);
        }
    };

    return {
        promptAsync,
        loading,
    };
}
