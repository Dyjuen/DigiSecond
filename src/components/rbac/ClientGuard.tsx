"use client";

import { RoleGuard, type UserRole } from "./RoleGuard";

interface ClientGuardProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    redirectTo?: string;
}

export function ClientGuard({ children, fallback, redirectTo = "/login" }: ClientGuardProps) {
    return (
        <RoleGuard allowedRoles={["BUYER", "SELLER", "ADMIN"]} fallback={fallback} redirectTo={redirectTo}>
            {children}
        </RoleGuard>
    );
}
