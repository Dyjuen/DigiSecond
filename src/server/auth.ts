import { type GetServerSidePropsContext } from "next";
import {
    getServerSession,
    type NextAuthOptions,
} from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import * as nodemailer from "nodemailer";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import FacebookProvider from "next-auth/providers/facebook";
import AppleProvider from "next-auth/providers/apple";
import { db } from "./db";

// Small helper to read environment variables and optionally throw
function envOrUndefined(key: string): string | undefined {
    const v = process.env[key];
    return v === undefined || v === "" ? undefined : v;
}

function envOrThrow(key: string): string {
    const v = envOrUndefined(key);
    if (!v) throw new Error(`Missing required environment variable: ${key}`);
    return v;
}

export type Role = "USER" | "ADMIN";

/**
 * Module augmentation for next-auth types
 * Adds custom fields to the session user
 */
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: "USER" | "ADMIN";
            verified: boolean;
            suspended: boolean;
            name?: string | null;
            email?: string | null;
            image?: string | null;
        };
    }

    interface User {
        role: "USER" | "ADMIN";
        verified: boolean;
        suspended: boolean;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: "USER" | "ADMIN";
        verified: boolean;
        suspended: boolean;
    }
}

/**
 * NextAuth.js configuration
 */
export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(db),
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
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.verified = user.verified;
                token.suspended = user.suspended;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as "USER" | "ADMIN";
                session.user.verified = token.verified as boolean;
                session.user.suspended = token.suspended as boolean;
            }
            return session;
        },
    },
    providers: (() => {
        const list: any[] = [];

        const googleId = envOrUndefined("GOOGLE_CLIENT_ID");
        const googleSecret = envOrUndefined("GOOGLE_CLIENT_SECRET");
        if (googleId && googleSecret) {
            list.push(
                GoogleProvider({
                    clientId: googleId,
                    clientSecret: googleSecret,
                    profile(profile) {
                        return {
                            id: profile.sub,
                            email: profile.email,
                            name: profile.name,
                            image: profile.picture,
                            role: "USER" as const,
                            verified: true,
                            suspended: false,
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

                        // provider.server may be a string (URI) or an object with auth
                        const transportConfig = typeof provider.server === "string" ? provider.server : (provider.server as any);
                        const transport = nodemailer.createTransport(transportConfig as any);

                        const text = `Sign in to ${host}\n\n${url}\n\n`;
                        const html = `<p>Sign in to <strong>${host}</strong></p><p><a href="${url}">Click here to sign in</a></p>`;

                        const result = await transport.sendMail({
                            to: identifier,
                            from: provider.from,
                            subject: `Sign in to ${host}`,
                            text,
                            html,
                        });

                        const rejected = (result as any).rejected ?? [];
                        const pending = (result as any).pending ?? [];
                        const failed = rejected.concat(pending).filter(Boolean);
                        if (failed.length) {
                            console.error(`Email(s) could not be sent to: ${failed.join(", ")}`);
                            throw new Error(`Email(s) could not be sent to: ${failed.join(", ")}`);
                        }
                    },
                })
            );
        } else {
            console.warn("Email provider not configured (missing EMAIL_SERVER/EMAIL_FROM)");
        }

        const fbId = envOrUndefined("FACEBOOK_CLIENT_ID");
        const fbSecret = envOrUndefined("FACEBOOK_CLIENT_SECRET");
        if (fbId && fbSecret) {
            list.push(
                FacebookProvider({
                    clientId: fbId,
                    clientSecret: fbSecret,
                })
            );
        } else {
            console.warn("Facebook OAuth not configured (missing FACEBOOK_CLIENT_ID/FACEBOOK_CLIENT_SECRET)");
        }

        const appleId = envOrUndefined("APPLE_CLIENT_ID");
        const appleTeam = envOrUndefined("APPLE_TEAM_ID");
        const appleKeyId = envOrUndefined("APPLE_KEY_ID");
        const applePrivateKey = envOrUndefined("APPLE_PRIVATE_KEY");
        if (appleId && appleTeam && appleKeyId && applePrivateKey) {
            list.push(
                AppleProvider({
                    clientId: appleId,
                    clientSecret: {
                        teamId: appleTeam,
                        privateKey: applePrivateKey.replace(/\\n/g, "\n"),
                        keyId: appleKeyId,
                        clientId: appleId,
                    } as any,
                    profile(profile: any) {
                        return {
                            id: profile.sub,
                            email: profile.email,
                            name: profile.name?.firstName
                                ? `${profile.name.firstName} ${profile.name.lastName ?? ""}`
                                : profile.email,
                            image: null,
                            role: "USER" as const,
                            verified: true,
                            suspended: false,
                        };
                    },
                })
            );
        } else {
            console.warn("Apple OAuth not configured (missing APPLE_CLIENT_ID/APPLE_TEAM_ID/APPLE_KEY_ID/APPLE_PRIVATE_KEY)");
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
