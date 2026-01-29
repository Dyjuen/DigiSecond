"use client";

import { RoleGuard, type UserRole } from "./RoleGuard";

interface AdminGuardProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    redirectTo?: string;
}

export function AdminGuard({ children, fallback, redirectTo = "/login" }: AdminGuardProps) {
    return (
        <RoleGuard allowedRoles={["ADMIN"]} fallback={fallback} redirectTo={redirectTo}>
            {children}
        </RoleGuard>
    );
}
