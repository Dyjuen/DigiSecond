"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

// Mock user types matching the future tRPC structure
export type UserRole = "BUYER" | "SELLER" | "ADMIN";

export interface DummyUser {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    verified: boolean;
    suspended: boolean;
}

export interface DummySession {
    user: DummyUser | null;
}

interface AuthContextType {
    session: DummySession;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => void;
    status: "loading" | "authenticated" | "unauthenticated";
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Dummy users database (replace with tRPC later)
const DUMMY_USERS: Record<string, { password: string; user: DummyUser }> = {
    "admin@digisecond.com": {
        password: "admin123",
        user: {
            id: "admin-1",
            email: "admin@digisecond.com",
            name: "Admin User",
            role: "ADMIN",
            verified: true,
            suspended: false,
        },
    },
    "seller@digisecond.com": {
        password: "seller123",
        user: {
            id: "seller-1",
            email: "seller@digisecond.com",
            name: "Seller User",
            role: "SELLER",
            verified: true,
            suspended: false,
        },
    },
    "buyer@digisecond.com": {
        password: "buyer123",
        user: {
            id: "buyer-1",
            email: "buyer@digisecond.com",
            name: "Buyer User",
            role: "BUYER",
            verified: true,
            suspended: false,
        },
    },
};

export function DummyAuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<DummySession>({ user: null });
    const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

    // Check for existing session in localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem("dummy-auth-user");
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser) as DummyUser;
                setSession({ user });
                setStatus("authenticated");
            } catch {
                localStorage.removeItem("dummy-auth-user");
                setStatus("unauthenticated");
            }
        } else {
            setStatus("unauthenticated");
        }
    }, []);

    const signIn = async (email: string, password: string) => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const userRecord = DUMMY_USERS[email];
        if (!userRecord || userRecord.password !== password) {
            throw new Error("Invalid credentials");
        }

        // TODO: Replace with tRPC mutation
        // const result = await trpc.auth.signIn.mutate({ email, password });

        setSession({ user: userRecord.user });
        setStatus("authenticated");
        localStorage.setItem("dummy-auth-user", JSON.stringify(userRecord.user));
    };

    const signOut = () => {
        // TODO: Replace with tRPC mutation
        // await trpc.auth.signOut.mutate();

        setSession({ user: null });
        setStatus("unauthenticated");
        localStorage.removeItem("dummy-auth-user");
    };

    return (
        <AuthContext.Provider value={{ session, signIn, signOut, status }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useDummyAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useDummyAuth must be used within DummyAuthProvider");
    }
    return context;
}

// Hook compatible with NextAuth useSession API for easy migration
export function useSession() {
    const { session, status } = useDummyAuth();
    return {
        data: session.user ? { user: session.user } : null,
        status,
    };
}

// signOut compatible with NextAuth
export function signOut(options?: { callbackUrl?: string }) {
    const context = useContext(AuthContext);
    if (context) {
        context.signOut();
        if (options?.callbackUrl) {
            window.location.href = options.callbackUrl;
        }
    }
}
