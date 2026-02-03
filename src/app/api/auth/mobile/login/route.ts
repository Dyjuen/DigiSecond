import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { signJWT } from "@/lib/jwt";

/**
 * Mobile Login Endpoint
 * 
 * Generates JWT token for mobile authentication after user has been authenticated
 * via OAuth or magic link in web view / system browser.
 * 
 * @route POST /api/auth/mobile/login
 * @body { email: string }
 * @returns { token: string, user: {...} }
 */
export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email || typeof email !== "string") {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        // Find user by email
        const user = await db.user.findUnique({
            where: { email },
            select: {
                user_id: true,
                email: true,
                name: true,
                role: true,
                tier: true,
                is_verified: true,
                is_suspended: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Reject suspended users
        if (user.is_suspended) {
            return NextResponse.json(
                { error: "Account suspended" },
                { status: 403 }
            );
        }

        // Generate JWT token
        const token = signJWT({
            sub: user.user_id,
            email: user.email,
            role: user.role,
            tier: user.tier,
            verified: user.is_verified,
            suspended: user.is_suspended,
        });

        return NextResponse.json({
            token,
            user: {
                id: user.user_id,
                email: user.email,
                name: user.name,
                role: user.role,
                tier: user.tier,
                verified: user.is_verified,
            },
        });
    } catch (error) {
        console.error("[Mobile Login] Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
