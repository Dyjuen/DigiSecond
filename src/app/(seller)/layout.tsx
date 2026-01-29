import { ReactElement } from "react";
import { redirect } from "next/navigation";
import { SellerGuard } from "@/components/rbac";

export default function SellerLayout({ children }: { children: ReactElement }) {
    return (
        <SellerGuard redirectTo="/login">
            {children}
        </SellerGuard>
    );
}
