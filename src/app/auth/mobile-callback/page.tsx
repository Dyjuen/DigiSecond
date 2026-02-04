import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/server/auth";
import { signJWT } from "@/lib/jwt";
import MobileCallbackClient from "./client";

/**
 * Mobile Callback Page (Server Component)
 * 
 * After user clicks magic link in email, NextAuth creates a session.
 * This page generates a JWT token and passes it to the client component
 * which provides a button to deep link back to the mobile app.
 * 
 * Flow:
 * 1. User clicks magic link → NextAuth callback → session created
 * 2. User redirected here (via callbackUrl or manual navigation)
 * 3. Server generates JWT from session
 * 4. Client renders "Open in DigiSecond" button
 * 5. User taps button → deep link with token → mobile app
 */
export default async function MobileCallbackPage() {
    const session = await getServerAuthSession();

    // No session = user not authenticated
    if (!session?.user) {
        redirect("/login?error=no_session&callbackUrl=/auth/mobile-callback");
    }

    // Generate JWT token for mobile app
    const token = signJWT({
        sub: session.user.id,
        email: session.user.email!,
        role: session.user.role,
        tier: session.user.tier,
        verified: session.user.verified,
        suspended: session.user.suspended,
    });

    // Get deep link scheme from env (development = exp://, production = digisecond://)
    const deepLinkScheme = process.env.MOBILE_DEEP_LINK_SCHEME || "production";

    return (
        <MobileCallbackClient
            token={token}
            userName={session.user.name ?? session.user.email ?? "User"}
            deepLinkScheme={deepLinkScheme}
        />
    );
}
