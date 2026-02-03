/**
 * Test Helper: Context Factory
 *
 * Creates mock and real contexts for testing tRPC procedures.
 * Uses real Supabase PostgreSQL database.
 */
import { vi, type Mock } from "vitest";
import { type Session } from "next-auth";
import { createInnerTRPCContext, type Context } from "@/server/api/trpc";
import { appRouter } from "@/server/api/root";
import { db } from "@/server/db";

// Re-export for JWT integration tests
export { createInnerTRPCContext };

/**
 * Create a test context with optional session
 */
export function createTestContext(session: Session | null = null): Context {
    return createInnerTRPCContext({ session });
}

/**
 * Create an unauthenticated context
 */
export function createUnauthenticatedContext(): Context {
    return createTestContext(null);
}

/**
 * Create an authenticated buyer context
 */
export function createBuyerContext(overrides: Partial<Session["user"]> = {}): Context {
    return createTestContext({
        user: {
            id: "test-buyer-id",
            role: "BUYER",
            verified: true,
            suspended: false,
            tier: "FREE",
            name: "Test Buyer",
            email: "buyer@test.com",
            image: null,
            phone: "08123456789",
            ...overrides,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        id: "test-session-id",
    } as Session);
}

/**
 * Create an authenticated seller context (with KYC)
 */
export function createSellerContext(overrides: Partial<Session["user"]> = {}): Context {
    return createTestContext({
        user: {
            id: "test-seller-id",
            role: "SELLER",
            verified: true,
            suspended: false,
            tier: "FREE",
            name: "Test Seller",
            email: "seller@test.com",
            image: null,
            phone: "08123456789",
            ...overrides,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        id: "test-session-id",
    } as Session);
}

/**
 * Create an admin context
 */
export function createAdminContext(overrides: Partial<Session["user"]> = {}): Context {
    return createTestContext({
        user: {
            id: "test-admin-id",
            role: "ADMIN",
            verified: true,
            suspended: false,
            tier: "ENTERPRISE",
            name: "Test Admin",
            email: "admin@test.com",
            image: null,
            phone: "08123456789",
            ...overrides,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        id: "test-session-id",
    } as Session);
}

/**
 * Create a suspended user context
 */
export function createSuspendedContext(): Context {
    return createTestContext({
        user: {
            id: "test-suspended-id",
            role: "BUYER",
            verified: true,
            suspended: true,
            tier: "FREE",
            name: "Suspended User",
            email: "suspended@test.com",
            image: null,
            phone: null,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        id: "test-session-id",
    } as Session);
}

/**
 * Create a caller for the router with given context
 */
export function createTestCaller(ctx: Context) {
    return appRouter.createCaller(ctx);
}

/**
 * Helper to generate unique test identifiers
 */
export function testId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Helper to generate test email
 */
export function testEmail(): string {
    return `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.com`;
}

/**
 * Export database client for direct access in tests
 */
export { db };

/**
 * Clean up test data helper
 * Use with caution - only in test environment
 */
export async function cleanupTestUser(email: string): Promise<void> {
    try {
        await db.user.delete({ where: { email } });
    } catch {
        // User doesn't exist, that's fine
    }
}

/**
 * Clean up test listing helper
 */
export async function cleanupTestListing(listingId: string): Promise<void> {
    try {
        await db.listing.delete({ where: { listing_id: listingId } });
    } catch {
        // Listing doesn't exist, that's fine
    }
}
