import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { OAuth2Client } from "google-auth-library";
import * as jose from "jose";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Mobile Google OAuth Token Exchange
 * POST /api/auth/mobile/google
 * 
 * Exchanges Google access token for app JWT
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { accessToken } = body;

        if (!accessToken || typeof accessToken !== "string") {
            return NextResponse.json(
                { error: "Missing or invalid accessToken" },
                { status: 400 }
            );
        }

        // Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: accessToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            return NextResponse.json(
                { error: "Invalid Google token" },
                { status: 401 }
            );
        }

        // Find or create user
        let user = await db.user.findUnique({
            where: { email: payload.email },
        });

        if (!user) {
            // Create new user from Google profile
            user = await db.user.create({
                data: {
                    email: payload.email,
                    name: payload.name || payload.email.split("@")[0],
                    avatar_url: payload.picture || null,
                    is_verified: true, // Google OAuth users are verified
                    is_suspended: false,
                    role: "BUYER",
                },
            });
        }

        // Check if user is suspended
        if (user.is_suspended) {
            return NextResponse.json(
                { error: "Account suspended" },
                { status: 403 }
            );
        }

        // Generate JWT for mobile app
        const secret = new TextEncoder().encode(
            process.env.NEXTAUTH_SECRET || "fallback-secret-change-this"
        );

        const token = await new jose.SignJWT({
            userId: user.user_id,
            email: user.email,
            role: user.role,
        })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("30d")
            .sign(secret);

        // Return JWT + user data
        return NextResponse.json({
            token,
            user: {
                id: user.user_id,
                email: user.email,
                name: user.name,
                avatar: user.avatar_url,
                role: user.role,
                verified: user.is_verified,
            },
        });
    } catch (error: any) {
        console.error("Mobile Google auth error:", error);
        return NextResponse.json(
            { error: "Authentication failed", details: error.message },
            { status: 500 }
        );
    }
}
