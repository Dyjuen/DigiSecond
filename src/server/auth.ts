import { type GetServerSidePropsContext } from "next";
import {
    getServerSession,
    type NextAuthOptions,
} from "next-auth";
import * as nodemailer from "nodemailer";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { CustomPrismaAdapter } from "./prisma-adapter";
import { db } from "./db";

// Small helper to read environment variables and optionally throw
function envOrUndefined(key: string): string | undefined {
    const v = process.env[key];
    return v === undefined || v === "" ? undefined : v;
}



export type Role = "BUYER" | "SELLER" | "ADMIN";

/**
 * Module augmentation for next-auth types
 * Adds custom fields to the session user
 */
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: "BUYER" | "SELLER" | "ADMIN";
            verified: boolean;
            suspended: boolean;
            tier: "FREE" | "PRO" | "ENTERPRISE";
            phone?: string | null;
            name?: string | null;
            email?: string | null;
            image?: string | null;
        };
    }

    interface User {
        role: "BUYER" | "SELLER" | "ADMIN";
        verified: boolean;
        suspended: boolean;
        tier: "FREE" | "PRO" | "ENTERPRISE";
        phone?: string | null;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: "BUYER" | "SELLER" | "ADMIN";
        verified: boolean;
        suspended: boolean;
        tier: "FREE" | "PRO" | "ENTERPRISE";
        phone?: string | null;
    }
}

/**
 * NextAuth.js configuration
 */
export const authOptions: NextAuthOptions = {
    adapter: CustomPrismaAdapter(db),
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    pages: {
        signIn: "/login",
        signOut: "/",
        error: "/login",
        verifyRequest: "/verify-email",
    },
    callbacks: {
        async jwt({ token, user, trigger }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.verified = user.verified;
                token.suspended = user.suspended;
                token.tier = user.tier;
                token.phone = user.phone;
            }

            // If session update is triggered, refresh data from DB to ensure tier is up to date
            if (trigger === "update" && token.id) {
                const freshUser = await db.user.findUnique({
                    where: { user_id: token.id as string }
                });

                if (freshUser) {
                    token.tier = (freshUser as any).tier;
                    token.role = freshUser.role;
                    token.verified = freshUser.is_verified;
                    token.suspended = freshUser.is_suspended;
                    // Add other fields if necessary
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as "BUYER" | "SELLER" | "ADMIN";
                session.user.verified = token.verified as boolean;
                session.user.suspended = token.suspended as boolean;
                session.user.tier = token.tier as "FREE" | "PRO" | "ENTERPRISE";
                session.user.phone = token.phone as string | null;
            }
            return session;
        },
        async redirect({ url, baseUrl }) {
            // Allows relative callback URLs
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            // Allows callback URLs on the same origin
            if (new URL(url).origin === baseUrl) return url;
            return baseUrl;
        }
    },

    providers: (() => {
        const list: any[] = [];

        // Admin Credentials Provider
        // Warning: This is a simplified implementation for the "bypass" request.
        // ideally you should fetch the user from DB and check password_hash.
        const CredentialsProvider = require("next-auth/providers/credentials").default;

        list.push(
            CredentialsProvider({
                name: "Admin Credentials",
                credentials: {
                    email: { label: "Email", type: "email" },
                    password: { label: "Password", type: "password" }
                },
                async authorize(credentials: any) {
                    // Hardcoded check for the specific admin bypass request
                    // In production, fetch user from DB -> compare bcrypt(password, user.password_hash)
                    if (
                        credentials?.email === "admin@digisecond.com" &&
                        credentials?.password === "admin123"
                    ) {
                        // Find the user to get real ID
                        const user = await db.user.findUnique({
                            where: { email: "admin@digisecond.com" }
                        });

                        if (user) {
                            return {
                                id: user.user_id,
                                email: user.email,
                                name: user.name,
                                role: "ADMIN",
                                verified: true,
                                suspended: false,
                                image: user.avatar_url
                            };
                        }
                    }
                    return null;
                }
            })
        );

        const googleId = envOrUndefined("GOOGLE_CLIENT_ID");
        const googleSecret = envOrUndefined("GOOGLE_CLIENT_SECRET");
        if (googleId && googleSecret) {
            list.push(
                GoogleProvider({
                    clientId: googleId,
                    clientSecret: googleSecret,
                    authorization: {
                        params: {
                            prompt: "login",
                        },
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    profile(profile) {
                        return {
                            id: profile.sub,
                            email: profile.email,
                            name: profile.name,
                            image: profile.picture,
                            role: "BUYER" as const,
                            verified: true,
                            suspended: false,
                            tier: "FREE" as const,
                        };
                    },
                })
            );
        } else {
            console.warn("Google OAuth not configured (missing GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET)");
        }

        const emailServer = envOrUndefined("EMAIL_SERVER");
        const emailFrom = envOrUndefined("EMAIL_FROM");
        if (emailServer && emailFrom) {
            list.push(
                EmailProvider({
                    server: emailServer,
                    from: emailFrom,
                    async sendVerificationRequest({ identifier, url, provider }) {
                        const { host } = new URL(url);

                        try {
                            // provider.server may be a string (URI) or an object with auth
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const transportConfig = typeof provider.server === "string" ? provider.server : (provider.server as any);
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const transport = nodemailer.createTransport(transportConfig as any);


                            const text = `Sign in to ${host}\n${url}\n\n`;
                            const html = verificationEmailHtml({ url, host, theme: { color: "#6366f1" } });

                            console.log(`[Email] Attempting to send magic link to ${identifier} from ${provider.from}`);

                            const result = await transport.sendMail({
                                to: identifier,
                                from: provider.from,
                                subject: `Sign in to ${host}`,
                                text,
                                html,
                            });

                            console.log(`[Email] Transport result:`, result);

                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const rejected = (result as any).rejected ?? [];
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const pending = (result as any).pending ?? [];
                            const failed = rejected.concat(pending).filter(Boolean);
                            if (failed.length) {
                                console.error(`[Email] Failed to send to: ${failed.join(", ")}`);
                                throw new Error(`Email(s) could not be sent to: ${failed.join(", ")}`);
                            }
                            console.log(`[Email] Successfully sent magic link to ${identifier}`);
                        } catch (error) {
                            console.error(`[Email] Error sending verification email:`, error);
                            throw new Error("SEND_VERIFICATION_EMAIL_ERROR");
                        }
                    },
                })
            );
        } else {
            console.warn("Email provider not configured (missing EMAIL_SERVER/EMAIL_FROM)");
        }

        return list;
    })(),
};

/**
 * Email HTML Template
 */
function verificationEmailHtml(params: { url: string; host: string; theme: { color: string } }) {
    const { url, host, theme } = params;
    const brandColor = theme.color || "#6366f1";

    return `
<body style="background: #09090b; font-family: sans-serif; padding: 20px;">
  <table width="100%" border="0" cellspacing="20" cellpadding="0" style="background: #09090b; max-width: 600px; margin: auto; border-radius: 10px;">
    <tr>
      <td align="center" style="padding: 10px 0px 0px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: #ffffff;">
        <strong>DigiSecond</strong>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellspacing="0" cellpadding="0" style="background: #18181b; border: 1px solid #27272a; border-radius: 16px; width: 100%; overflow: hidden;">
            <tr>
                <td align="center" style="padding: 40px 20px;">
                    <h2 style="color: #ffffff; margin-bottom: 24px; font-size: 22px; font-weight: 600;">Sign in to DigiSecond</h2>
                    <p style="color: #a1a1aa; font-size: 15px; line-height: 24px; margin-bottom: 32px;">
                        We received a request to access your account. Click the button below to sign in securely.
                    </p>
                    <table border="0" cellspacing="0" cellpadding="0">
                        <tr>
                            <td align="center" style="border-radius: 12px;" bgcolor="${brandColor}">
                                <a href="${url}" target="_blank" style="font-size: 16px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; border: 1px solid ${brandColor}; display: inline-block; font-weight: 600; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);">
                                    Sign In
                                </a>
                            </td>
                        </tr>
                    </table>
                    <p style="color: #52525b; font-size: 13px; margin-top: 40px;">
                        If you did not request this email, you can safely ignore it.
                    </p>
                </td>
            </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 0px 0px 10px 0px; font-size: 12px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: #52525b;">
        If you have trouble clicking the button, copy and paste this URL into your browser:
        <br />
        <a href="${url}" style="color: #71717a; text-decoration: none;">${url.replace(/https?:\/\//, '')}</a>
      </td>
    </tr>
  </table>
</body>
`;
}

/**
 * Wrapper for getServerSession for use in RSC
 */
export const getServerAuthSession = () => getServerSession(authOptions);

/**
 * Wrapper for getServerSession for use in API routes
 */
export const getServerAuthSessionPages = (ctx: {
    req: GetServerSidePropsContext["req"];
    res: GetServerSidePropsContext["res"];
}) => getServerSession(ctx.req, ctx.res, authOptions);
