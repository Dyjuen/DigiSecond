/**
 * Auto-Release Cron Endpoint
 * Automatically releases funds for transactions where verification period expired
 * 
 * Endpoint: POST /api/cron/auto-release
 * 
 * Should be called periodically (every hour) by:
 * - Vercel Cron Jobs
 * - External scheduler (Railway, etc.)
 * - Manual trigger for testing
 * 
 * Security:
 * - Protected by CRON_SECRET header
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { TransactionStatus, ListingStatus, PayoutStatus } from "@prisma/client";

// Verify cron secret for security
function verifyCronSecret(req: NextRequest): boolean {
    const cronSecret = process.env.CRON_SECRET;
    // Allow in development without secret
    if (process.env.NODE_ENV !== "production") return true;
    if (!cronSecret) return false;

    const authHeader = req.headers.get("authorization");
    return authHeader === `Bearer ${cronSecret}`;
}

export async function POST(req: NextRequest) {
    // Verify authorization
    if (!verifyCronSecret(req)) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const now = new Date();
    const results = {
        processed: 0,
        released: 0,
        skipped: 0,
        errors: [] as string[],
    };

    try {
        // Find transactions with expired verification and no dispute
        const expiredTransactions = await db.transaction.findMany({
            where: {
                status: TransactionStatus.ITEM_TRANSFERRED,
                verification_deadline: { lt: now },
                // No active dispute
                dispute: null,
            },
            include: {
                listing: { select: { listing_id: true, title: true } },
                seller: {
                    select: {
                        user_id: true,
                        bank_accounts: {
                            where: { is_default: true },
                            take: 1,
                        },
                    },
                },
                buyer: { select: { user_id: true } },
            },
            take: 100, // Process in batches
        });

        console.log(`[Auto-Release] Found ${expiredTransactions.length} expired transactions`);
        results.processed = expiredTransactions.length;

        for (const transaction of expiredTransactions) {
            try {
                // Double-check no dispute was created
                const dispute = await db.dispute.findUnique({
                    where: { transaction_id: transaction.transaction_id },
                });

                if (dispute) {
                    console.log(`[Auto-Release] Skipping ${transaction.transaction_id} - dispute exists`);
                    results.skipped++;
                    continue;
                }

                const bankAccount = transaction.seller.bank_accounts[0];

                await db.$transaction(async (tx) => {
                    // Complete the transaction
                    await tx.transaction.update({
                        where: { transaction_id: transaction.transaction_id },
                        data: {
                            status: TransactionStatus.COMPLETED,
                            completed_at: now,
                        },
                    });

                    // Update listing to SOLD (should already be, but ensure)
                    await tx.listing.update({
                        where: { listing_id: transaction.listing.listing_id },
                        data: { status: ListingStatus.SOLD },
                    });

                    // Create payout record if seller has bank account
                    if (bankAccount) {
                        await tx.payout.create({
                            data: {
                                transaction_id: transaction.transaction_id,
                                seller_id: transaction.seller_id,
                                payout_amount: transaction.seller_payout_amount,
                                bank_code: bankAccount.bank_code,
                                bank_name: bankAccount.bank_name,
                                account_number: bankAccount.account_number,
                                account_holder_name: bankAccount.account_holder_name,
                                status: PayoutStatus.PENDING,
                            },
                        });
                    }

                    // Notify seller
                    await tx.notification.create({
                        data: {
                            user_id: transaction.seller_id,
                            notification_type: "PAYOUT_COMPLETED",
                            title: "Dana Dirilis Otomatis 💰",
                            body: `Periode verifikasi untuk "${transaction.listing.title}" telah berakhir. Dana Rp ${transaction.seller_payout_amount.toLocaleString("id-ID")} akan segera dikirim.`,
                            data_payload: {
                                transaction_id: transaction.transaction_id,
                                payout_amount: transaction.seller_payout_amount,
                            },
                        },
                    });

                    // Notify buyer
                    await tx.notification.create({
                        data: {
                            user_id: transaction.buyer_id,
                            notification_type: "ITEM_CONFIRMED",
                            title: "Transaksi Selesai",
                            body: `Periode verifikasi untuk "${transaction.listing.title}" telah berakhir. Transaksi selesai secara otomatis.`,
                            data_payload: {
                                transaction_id: transaction.transaction_id,
                            },
                        },
                    });

                    // Audit log
                    await tx.auditLog.create({
                        data: {
                            entity_type: "Transaction",
                            entity_id: transaction.transaction_id,
                            action_type: "AUTO_RELEASE",
                            action_description: "Funds auto-released after verification period expired",
                            new_value: {
                                status: "COMPLETED",
                                completed_at: now.toISOString(),
                                seller_payout: transaction.seller_payout_amount,
                            },
                        },
                    });
                });

                console.log(`[Auto-Release] Released funds for ${transaction.transaction_id}`);
                results.released++;

            } catch (error) {
                console.error(`[Auto-Release] Error processing ${transaction.transaction_id}:`, error);
                results.errors.push(`${transaction.transaction_id}: ${String(error)}`);
            }
        }

        // Stale PAID transactions (seller never transferred in 48 hours) - refund
        const staleDeadline = new Date(now.getTime() - 48 * 60 * 60 * 1000);

        const stalePaidTransactions = await db.transaction.findMany({
            where: {
                status: TransactionStatus.PAID,
                updated_at: { lt: staleDeadline },
                item_transferred_at: null, // Seller never transferred
            },
            include: {
                listing: { select: { listing_id: true } },
                buyer: { select: { user_id: true } },
                seller: { select: { user_id: true } },
            },
            take: 50,
        });

        for (const transaction of stalePaidTransactions) {
            try {
                await db.$transaction(async (tx) => {
                    await tx.transaction.update({
                        where: { transaction_id: transaction.transaction_id },
                        data: { status: TransactionStatus.REFUNDED },
                    });

                    await tx.listing.update({
                        where: { listing_id: transaction.listing.listing_id },
                        data: { status: ListingStatus.ACTIVE },
                    });

                    // Notify buyer about refund
                    await tx.notification.create({
                        data: {
                            user_id: transaction.buyer_id,
                            notification_type: "DISPUTE_RESOLVED",
                            title: "Refund Otomatis",
                            body: "Penjual tidak mengirim item dalam 48 jam. Pembayaran Anda akan di-refund.",
                            data_payload: {
                                transaction_id: transaction.transaction_id,
                            },
                        },
                    });

                    await tx.auditLog.create({
                        data: {
                            entity_type: "Transaction",
                            entity_id: transaction.transaction_id,
                            action_type: "AUTO_REFUND",
                            action_description: "Auto-refund due to seller inaction (48hr)",
                        },
                    });
                });
            } catch (error) {
                console.error(`[Auto-Release] Error refunding ${transaction.transaction_id}:`, error);
            }
        }

        return NextResponse.json({
            success: true,
            timestamp: now.toISOString(),
            results: {
                ...results,
                stale_refunded: stalePaidTransactions.length,
            },
        });

    } catch (error) {
        console.error("[Auto-Release] Fatal error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Internal server error",
                results,
            },
            { status: 500 }
        );
    }
}

/**
 * GET handler for health check and manual status
 */
export async function GET() {
    const now = new Date();

    // Count pending auto-releases
    const pendingCount = await db.transaction.count({
        where: {
            status: TransactionStatus.ITEM_TRANSFERRED,
            verification_deadline: { lt: now },
            dispute: null,
        },
    });

    return NextResponse.json({
        status: "ok",
        endpoint: "auto-release",
        timestamp: now.toISOString(),
        pending_releases: pendingCount,
    });
}
