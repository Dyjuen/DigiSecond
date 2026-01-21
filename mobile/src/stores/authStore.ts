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
    setAuth: (token: string, user: User) => void;
    clearAuth: () => void;
    setLoading: (loading: boolean) => void;
}

/**
 * Auth store with persistence
 * Token and user are stored in AsyncStorage
 */
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            isLoading: true,
            setAuth: (token, user) => set({ token, user, isLoading: false }),
            clearAuth: () => set({ token: null, user: null, isLoading: false }),
            setLoading: (isLoading) => set({ isLoading }),
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
