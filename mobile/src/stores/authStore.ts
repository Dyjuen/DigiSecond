import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * User type from auth
 */
interface User {
    id: string;
    email: string;
    name: string;
    avatar: string | null;
    role: "BUYER" | "SELLER" | "ADMIN";
    verified: boolean;
}

/**
 * Auth store state
 */
interface AuthState {
    token: string | null;
    user: User | null;
    isLoading: boolean;
    setAuth: (token: string, user: User) => Promise<void>;
    clearAuth: () => Promise<void>;
    setLoading: (loading: boolean) => void;
    isTokenExpired: () => boolean;
    getTokenExpiry: () => Date | null;
}

/**
 * Auth store with persistence
 * Token and user are stored in AsyncStorage
 */
export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            token: null,
            user: null,
            isLoading: true,
            setAuth: async (token: string, user: User) => {
                set({ token, user, isLoading: false });
            },
            clearAuth: async () => {
                set({ token: null, user: null, isLoading: false });
            },
            setLoading: (isLoading) => set({ isLoading }),

            /**
             * Check if the stored token is expired
             * Decodes JWT client-side without server call
             */
            isTokenExpired: () => {
                const { token } = get();
                if (!token) return true;

                try {
                    // Decode JWT payload (base64url)
                    const payloadBase64 = token.split(".")[1];
                    if (!payloadBase64) return true;

                    const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
                    const paddedBase64 = base64.padEnd(
                        base64.length + ((4 - (base64.length % 4)) % 4),
                        "="
                    );
                    const jsonPayload = atob(paddedBase64);
                    const payload = JSON.parse(jsonPayload);

                    // Check expiration (exp is in seconds, Date.now() is in ms)
                    // Add 5 second buffer for clock skew
                    const expiryTime = payload.exp * 1000;
                    const now = Date.now();
                    return now >= expiryTime - 5000;
                } catch (error) {
                    console.error("[AuthStore] Error checking token expiry:", error);
                    return true; // Treat invalid tokens as expired
                }
            },

            /**
             * Get token expiry date
             * Returns null if no token or invalid
             */
            getTokenExpiry: () => {
                const { token } = get();
                if (!token) return null;

                try {
                    const payloadBase64 = token.split(".")[1];
                    if (!payloadBase64) return null;

                    const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
                    const paddedBase64 = base64.padEnd(
                        base64.length + ((4 - (base64.length % 4)) % 4),
                        "="
                    );
                    const jsonPayload = atob(paddedBase64);
                    const payload = JSON.parse(jsonPayload);

                    return new Date(payload.exp * 1000);
                } catch (error) {
                    console.error("[AuthStore] Error getting token expiry:", error);
                    return null;
                }
            },
        }),
        {
            name: "digisecond-auth",
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({ token: state.token, user: state.user }),
            onRehydrateStorage: () => (state) => {
                state?.setLoading(false);
            },
        }
    )
);
