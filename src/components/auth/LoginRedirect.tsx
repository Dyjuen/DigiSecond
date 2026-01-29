"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function LoginRedirect() {
    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
        // If user is authenticated, redirect to homepage or dashboard
        if (status === "authenticated") {
            router.push("/");
        }
    }, [status, router]);

    return null;
}
