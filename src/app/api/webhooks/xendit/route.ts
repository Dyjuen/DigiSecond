/**
 * Xendit Webhook Handler
 * Receives payment notifications from Xendit
 * 
 * Endpoint: POST /api/webhooks/xendit
 * 
 * Security:
 * - Validates x-callback-token header
 * - Idempotency check for duplicate webhooks
 * - All operations wrapped in transactions
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { PaymentStatus, TransactionStatus, ListingStatus, PaymentMethod } from "@prisma/client";

// Type for Xendit webhook payload
interface XenditWebhookPayload {
    id: string;
    external_id: string;
    status: "PENDING" | "PAID" | "SETTLED" | "EXPIRED";
    paid_amount?: number;
    payment_method?: string;
    payment_channel?: string;
    paid_at?: string;
}

// Map Xendit payment methods to our enum
function mapPaymentMethod(xenditMethod?: string): PaymentMethod {
    if (!xenditMethod) return "VA";

    const upper = xenditMethod.toUpperCase();
    if (upper.includes("EWALLET") || upper.includes("OVO") || upper.includes("DANA") || upper.includes("GOPAY")) {
        return "EWALLET";
    }
    if (upper.includes("QRIS")) return "QRIS";
    if (upper.includes("CARD") || upper.includes("CREDIT")) return "CARD";
    if (upper.includes("RETAIL") || upper.includes("ALFAMART") || upper.includes("INDOMARET")) return "RETAIL";
    return "VA"; // Default to VA for bank transfers
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        const callbackToken = req.headers.get("x-callback-token");

        // =========================================================================
        // SIGNATURE VERIFICATION
        // =========================================================================
        const expectedToken = process.env.XENDIT_WEBHOOK_TOKEN;
        if (!expectedToken) {
            console.error("[Xendit Webhook] XENDIT_WEBHOOK_TOKEN not configured");
            return NextResponse.json(
                { error: "Server configuration error" },
                { status: 500 }
            );
        }

        if (callbackToken !== expectedToken) {
            console.error("[Xendit Webhook] Invalid callback token");

            // Audit log for security
            await db.auditLog.create({
                data: {
                    entity_type: "Webhook",
                    entity_id: "xendit",
                    action_type: "INVALID_SIGNATURE",
                    action_description: "Xendit webhook received with invalid signature",
                    new_value: { ip: req.headers.get("x-forwarded-for") },
                },
            });

            return NextResponse.json(
                { error: "Invalid signature" },
                { status: 401 }
            );
        }

        // =========================================================================
        // PARSE PAYLOAD
        // =========================================================================
        let payload: XenditWebhookPayload;
        try {
            payload = JSON.parse(body);
        } catch {
            console.error("[Xendit Webhook] Invalid JSON payload");
            return NextResponse.json(
                { error: "Invalid JSON" },
                { status: 400 }
            );
        }

        console.log("[Xendit Webhook] Received:", {
            id: payload.id,
            external_id: payload.external_id,
            status: payload.status,
        });

        const { id: xenditId, external_id: transactionId, status } = payload;

        // =========================================================================
        // FIND PAYMENT RECORD
        // =========================================================================
        const payment = await db.payment.findFirst({
            where: {
                OR: [
                    { xendit_payment_id: xenditId },
                    { transaction_id: transactionId },
                ],
            },
            include: {
                transaction: {
                    include: {
                        listing: { select: { listing_id: true, title: true } },
                        seller: { select: { user_id: true } },
                        buyer: { select: { user_id: true } },
                    },
                },
            },
        });

        if (!payment) {
            console.log(`[Xendit Webhook] Payment not found for xendit_id: ${xenditId}`);
            // Return 200 to prevent Xendit from retrying
            return NextResponse.json(
                { message: "Payment not found, skipping" },
                { status: 200 }
            );
        }

        // =========================================================================
        // IDEMPOTENCY CHECK
        // =========================================================================
        if (status === "PAID" || status === "SETTLED") {
            if (payment.status === PaymentStatus.PAID) {
                console.log(`[Xendit Webhook] Payment ${xenditId} already processed`);
                return NextResponse.json(
                    { message: "Already processed" },
                    { status: 200 }
                );
            }
        }

        // =========================================================================
        // PROCESS PAYMENT STATUS
        // =========================================================================
        if (status === "PAID" || status === "SETTLED") {
            const paidAt = payload.paid_at ? new Date(payload.paid_at) : new Date();
            const paymentMethod = mapPaymentMethod(payload.payment_method || payload.payment_channel);

            await db.$transaction(async (tx) => {
                // Update payment record
                await tx.payment.update({
                    where: { payment_id: payment.payment_id },
                    data: {
                        status: PaymentStatus.PAID,
                        paid_at: paidAt,
                        payment_method: paymentMethod,
                        xendit_payment_id: xenditId, // Ensure we have the correct ID
                    },
                });

                // Update transaction status to PAID
                await tx.transaction.update({
                    where: { transaction_id: payment.transaction_id },
                    data: { status: TransactionStatus.PAID },
                });

                // Update listing status to SOLD (reserved)
                await tx.listing.update({
                    where: { listing_id: payment.transaction.listing.listing_id },
                    data: { status: ListingStatus.SOLD },
                });

                // Create notification for seller
                await tx.notification.create({
                    data: {
                        user_id: payment.transaction.seller.user_id,
                        notification_type: "PAYMENT_RECEIVED",
                        title: "Pembayaran Diterima! 🎉",
                        body: `Pembayaran Rp ${payment.payment_amount.toLocaleString("id-ID")} untuk "${payment.transaction.listing.title}" telah diterima. Silakan transfer item ke pembeli.`,
                        data_payload: {
                            transaction_id: payment.transaction_id,
                            amount: payload.paid_amount ?? payment.payment_amount,
                            payment_method: paymentMethod,
                        },
                    },
                });

                // Create notification for buyer
                await tx.notification.create({
                    data: {
                        user_id: payment.transaction.buyer.user_id,
                        notification_type: "PAYMENT_RECEIVED",
                        title: "Pembayaran Berhasil! ✅",
                        body: `Pembayaran Anda untuk "${payment.transaction.listing.title}" telah dikonfirmasi. Menunggu penjual mengirim item.`,
                        data_payload: {
                            transaction_id: payment.transaction_id,
                        },
                    },
                });

                // Audit log
                await tx.auditLog.create({
                    data: {
                        entity_type: "Payment",
                        entity_id: payment.payment_id,
                        action_type: "PAYMENT_CONFIRMED",
                        action_description: "Payment confirmed via Xendit webhook",
                        old_value: { status: payment.status },
                        new_value: {
                            status: "PAID",
                            paid_at: paidAt.toISOString(),
                            payment_method: paymentMethod,
                            xendit_id: xenditId,
                        },
                    },
                });
            });

            console.log(`[Xendit Webhook] Payment ${xenditId} marked as PAID, transaction ${payment.transaction_id} updated`);

        } else if (status === "EXPIRED") {
            await db.$transaction(async (tx) => {
                // Mark payment as expired
                await tx.payment.update({
                    where: { payment_id: payment.payment_id },
                    data: { status: PaymentStatus.EXPIRED },
                });

                // Check if there are other pending payments
                const otherPendingPayments = await tx.payment.count({
                    where: {
                        transaction_id: payment.transaction_id,
                        status: PaymentStatus.PENDING,
                        payment_id: { not: payment.payment_id },
                    },
                });

                // If no other pending payments, cancel the transaction
                if (otherPendingPayments === 0) {
                    await tx.transaction.update({
                        where: { transaction_id: payment.transaction_id },
                        data: { status: TransactionStatus.CANCELLED },
                    });

                    // Restore listing to active
                    await tx.listing.update({
                        where: { listing_id: payment.transaction.listing.listing_id },
                        data: { status: ListingStatus.ACTIVE },
                    });

                    // Notify both parties
                    await tx.notification.create({
                        data: {
                            user_id: payment.transaction.buyer.user_id,
                            notification_type: "PAYMENT_RECEIVED", // Reusing type
                            title: "Pembayaran Expired",
                            body: `Pembayaran untuk "${payment.transaction.listing.title}" telah kedaluwarsa. Transaksi dibatalkan.`,
                            data_payload: { transaction_id: payment.transaction_id },
                        },
                    });
                }

                // Audit log
                await tx.auditLog.create({
                    data: {
                        entity_type: "Payment",
                        entity_id: payment.payment_id,
                        action_type: "PAYMENT_EXPIRED",
                        action_description: "Payment expired via Xendit webhook",
                        old_value: { status: payment.status },
                        new_value: { status: "EXPIRED" },
                    },
                });
            });

            console.log(`[Xendit Webhook] Payment ${xenditId} expired`);
        }

        return NextResponse.json(
            { message: "Webhook processed successfully" },
            { status: 200 }
        );

    } catch (error) {
        console.error("[Xendit Webhook] Error:", error);

        // Log error but return 200 to prevent excessive retries
        await db.auditLog.create({
            data: {
                entity_type: "Webhook",
                entity_id: "xendit",
                action_type: "WEBHOOK_ERROR",
                action_description: "Xendit webhook processing error",
                new_value: { error: String(error) },
            },
        }).catch(() => { }); // Ignore audit log errors

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * GET handler for health check
 */
export async function GET() {
    return NextResponse.json({
        status: "ok",
        endpoint: "xendit-webhook",
        timestamp: new Date().toISOString(),
    });
}
