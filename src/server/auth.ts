import { type GetServerSidePropsContext } from "next";
import {
    getServerSession,
    type DefaultSession,
    type NextAuthOptions,
} from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";

/**
 * Module augmentation for next-auth types
 * Adds custom fields to the session user
 */
declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string;
            role: "BUYER" | "SELLER" | "ADMIN";
            verified: boolean;
            suspended: boolean;
        } & DefaultSession["user"];
    }

    interface User {
        role: "BUYER" | "SELLER" | "ADMIN";
        verified: boolean;
        suspended: boolean;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: "BUYER" | "SELLER" | "ADMIN";
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
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            profile(profile) {
                return {
                    id: profile.sub,
                    email: profile.email,
                    name: profile.name,
                    image: profile.picture,
                    role: "BUYER" as const,
                    verified: true,
                    suspended: false,
                };
            },
        }),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email dan password diperlukan");
                }

                const user = await db.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user || !user.passwordHash) {
                    throw new Error("Email atau password salah");
                }

                const isValid = await bcrypt.compare(
                    credentials.password,
                    user.passwordHash
                );

                if (!isValid) {
                    throw new Error("Email atau password salah");
                }

                if (user.suspended) {
                    throw new Error("Akun Anda telah dinonaktifkan");
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.avatar,
                    role: user.role,
                    verified: user.verified,
                    suspended: user.suspended,
                };
            },
        }),
    ],
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.verified = user.verified;
                token.suspended = user.suspended;
            }
            return token;
        },
        session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.verified = token.verified;
                session.user.suspended = token.suspended;
            }
            return session;
        },
    },
    events: {
        async signIn({ user, isNewUser }) {
            if (isNewUser) {
                // Log new user registration
                console.log(`New user registered: ${user.email}`);
            }
        },
    },
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
