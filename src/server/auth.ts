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

                            const text = `Sign in to ${host}\n\n${url}\n\n`;
                            const html = `<p>Sign in to <strong>${host}</strong></p><p><a href="${url}">Click here to sign in</a></p>`;

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
