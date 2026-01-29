"use client";

import { RoleGuard, type UserRole } from "./RoleGuard";

interface SellerGuardProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    redirectTo?: string;
}

export function SellerGuard({ children, fallback, redirectTo = "/login" }: SellerGuardProps) {
    return (
        <RoleGuard allowedRoles={["SELLER", "ADMIN"]} fallback={fallback} redirectTo={redirectTo}>
            {children}
        </RoleGuard>
    );
}
