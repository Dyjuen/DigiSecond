"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Assuming these are the roles defined in your system/Prisma schema
export type UserRole = "BUYER" | "SELLER" | "ADMIN";

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: UserRole[];
    fallback?: React.ReactNode;
    redirectTo?: string;
}

export function RoleGuard({
    children,
    allowedRoles,
    fallback = null,
    redirectTo
}: RoleGuardProps) {
    const { data: session, status } = useSession();
    const router = useRouter();

    const isLoading = status === "loading";
    const userRole = session?.user?.role as UserRole | undefined;

    const isAllowed = userRole && allowedRoles.includes(userRole);

    useEffect(() => {
        if (!isLoading && !session && redirectTo) {
            router.push(redirectTo);
        } else if (!isLoading && session && !isAllowed && redirectTo) {
            router.push(redirectTo); // Or a specific 403 page
        }
    }, [isLoading, session, isAllowed, redirectTo, router]);

    if (isLoading) {
        return null; // Or a loading spinner
    }

    if (!session) {
        return fallback;
    }

    if (isAllowed) {
        return <>{children}</>;
    }

    return fallback;
}
