/**
 * Custom Prisma Adapter for NextAuth.js
 * Adapted to work with DigiSecond's custom Prisma schema field names
 */
import { PrismaClient } from "@prisma/client";
import type { Adapter } from "next-auth/adapters";

export function CustomPrismaAdapter(prisma: PrismaClient): Adapter {
    return {
        async createUser(user) {
            const created = await prisma.user.create({
                data: {
                    email: user.email,
                    name: user.name ?? user.email?.split("@")[0] ?? "User",
                    avatar_url: user.image,
                    is_verified: user.emailVerified ? true : false,
                    role: "BUYER",
                    is_suspended: false,
                },
            });
            return {
                id: created.user_id,
                email: created.email,
                name: created.name,
                image: created.avatar_url,
                emailVerified: created.is_verified ? new Date() : null,
                role: created.role,
                verified: created.is_verified,
                suspended: created.is_suspended,
                tier: created.tier,
            };
        },

        async getUser(id) {
            const user = await prisma.user.findUnique({
                where: { user_id: id },
            });
            if (!user) return null;
            return {
                id: user.user_id,
                email: user.email,
                name: user.name,
                image: user.avatar_url,
                emailVerified: user.is_verified ? new Date() : null,
                role: user.role,
                verified: user.is_verified,
                suspended: user.is_suspended,
                tier: user.tier,
            };
        },

        async getUserByEmail(email) {
            const user = await prisma.user.findUnique({
                where: { email },
            });
            if (!user) return null;
            return {
                id: user.user_id,
                email: user.email,
                name: user.name,
                image: user.avatar_url,
                emailVerified: user.is_verified ? new Date() : null,
                role: user.role,
                verified: user.is_verified,
                suspended: user.is_suspended,
                tier: user.tier,
            };
        },

        async getUserByAccount({ providerAccountId, provider }) {
            const account = await prisma.account.findUnique({
                where: {
                    provider_provider_account_id: {
                        provider,
                        provider_account_id: providerAccountId,
                    },
                },
                include: { user: true },
            });
            if (!account?.user) return null;
            const user = account.user;
            return {
                id: user.user_id,
                email: user.email,
                name: user.name,
                image: user.avatar_url,
                emailVerified: user.is_verified ? new Date() : null,
                role: user.role,
                verified: user.is_verified,
                suspended: user.is_suspended,
                tier: user.tier,
            };
        },

        async updateUser(user) {
            const updated = await prisma.user.update({
                where: { user_id: user.id },
                data: {
                    email: user.email ?? undefined,
                    name: user.name ?? undefined,
                    avatar_url: user.image ?? undefined,
                    is_verified: user.emailVerified ? true : undefined,
                },
            });
            return {
                id: updated.user_id,
                email: updated.email,
                name: updated.name,
                image: updated.avatar_url,
                emailVerified: updated.is_verified ? new Date() : null,
                role: updated.role,
                verified: updated.is_verified,
                suspended: updated.is_suspended,
                tier: updated.tier,
            };
        },

        async deleteUser(userId) {
            await prisma.user.delete({
                where: { user_id: userId },
            });
        },

        async linkAccount(account) {
            await prisma.account.create({
                data: {
                    user_id: account.userId,
                    type: account.type,
                    provider: account.provider,
                    provider_account_id: account.providerAccountId,
                    refresh_token: account.refresh_token ?? null,
                    access_token: account.access_token ?? null,
                    expires_at: account.expires_at ?? null,
                    token_type: account.token_type ?? null,
                    scope: account.scope ?? null,
                    id_token: account.id_token ?? null,
                    session_state: account.session_state ?? null,
                },
            });
        },

        async unlinkAccount({ providerAccountId, provider }) {
            await prisma.account.delete({
                where: {
                    provider_provider_account_id: {
                        provider,
                        provider_account_id: providerAccountId,
                    },
                },
            });
        },

        async createSession({ sessionToken, userId, expires }) {
            const session = await prisma.session.create({
                data: {
                    session_token: sessionToken,
                    user_id: userId,
                    expires_at: expires,
                },
            });
            return {
                sessionToken: session.session_token,
                userId: session.user_id,
                expires: session.expires_at,
            };
        },

        async getSessionAndUser(sessionToken) {
            const session = await prisma.session.findUnique({
                where: { session_token: sessionToken },
                include: { user: true },
            });
            if (!session) return null;
            const user = session.user;
            return {
                session: {
                    sessionToken: session.session_token,
                    userId: session.user_id,
                    expires: session.expires_at,
                },
                user: {
                    id: user.user_id,
                    email: user.email,
                    name: user.name,
                    image: user.avatar_url,
                    emailVerified: user.is_verified ? new Date() : null,
                    role: user.role,
                    verified: user.is_verified,
                    suspended: user.is_suspended,
                    tier: user.tier,
                },
            };
        },

        async updateSession({ sessionToken, expires }) {
            const session = await prisma.session.update({
                where: { session_token: sessionToken },
                data: {
                    expires_at: expires ?? undefined,
                },
            });
            return {
                sessionToken: session.session_token,
                userId: session.user_id,
                expires: session.expires_at,
            };
        },

        async deleteSession(sessionToken) {
            await prisma.session.delete({
                where: { session_token: sessionToken },
            });
        },

        async createVerificationToken({ identifier, expires, token }) {
            const verificationToken = await prisma.verificationToken.create({
                data: {
                    identifier,
                    token,
                    expires,
                },
            });
            return {
                identifier: verificationToken.identifier,
                token: verificationToken.token,
                expires: verificationToken.expires,
            };
        },

        async useVerificationToken({ identifier, token }) {
            try {
                const verificationToken = await prisma.verificationToken.delete({
                    where: {
                        identifier_token: {
                            identifier,
                            token,
                        },
                    },
                });
                return {
                    identifier: verificationToken.identifier,
                    token: verificationToken.token,
                    expires: verificationToken.expires,
                };
            } catch (error) {
                // If token doesn't exist, return null
                return null;
            }
        },
    };
}
