import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

/**
 * Email Magic Link Endpoint  
 * POST /api/auth/signin/email
 * 
 * Sends a notification email (magic link coming soon)
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email } = body;

        if (!email || typeof email !== "string") {
            return NextResponse.json(
                { error: "Missing or invalid email" },
                { status: 400 }
            );
        }

        // Configure nodemailer transport from environment variables
        const transport = nodemailer.createTransport({
            host: process.env.EMAIL_SERVER_HOST || "smtp.mailersend.net",
            port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
            secure: false,
            auth: {
                user: process.env.EMAIL_SERVER_USER,
                pass: process.env.EMAIL_SERVER_PASSWORD,
            },
        });

        const host = "DigiSecond";

        await transport.sendMail({
            to: email,
            from: process.env.EMAIL_FROM!,
            subject: `Sign in to ${host}`,
            text: `Sign in to ${host}\n\nNote: Email magic link for mobile is coming soon. Please use Google OAuth for now.`,
            html: `<p>Sign in to <strong>${host}</strong></p><p>Note: Email magic link for mobile is coming soon. Please use Google OAuth for now.</p>`,
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Email magic link error:", error);
        return NextResponse.json(
            { error: "Failed to send magic link", details: error.message },
            { status: 500 }
        );
    }
}
