/**
 * Xendit Integration Utilities
 * Centralized Xendit SDK functions for payments and payouts
 * 
 * @module lib/xendit
 */

import Xendit from "xendit-node";

// Validate environment variable
const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY;
if (!XENDIT_SECRET_KEY && process.env.NODE_ENV === "production") {
    throw new Error("XENDIT_SECRET_KEY is required in production");
}

// Initialize Xendit client
const xenditClient = XENDIT_SECRET_KEY
    ? new Xendit({ secretKey: XENDIT_SECRET_KEY })
    : null;

/**
 * Invoice creation parameters
 */
interface CreateInvoiceParams {
    externalId: string;
    amount: number;
    payerEmail: string;
    description: string;
    itemName: string;
    successRedirectUrl?: string;
    failureRedirectUrl?: string;
}

/**
 * Invoice response from Xendit
 */
interface InvoiceResponse {
    id: string;
    externalId: string;
    invoiceUrl: string;
    amount: number;
    status: string;
    expiryDate: Date;
}

/**
 * Create a Xendit invoice for payment
 * 
 * @param params Invoice parameters
 * @returns Invoice response with payment URL
 */
export async function createXenditInvoice(
    params: CreateInvoiceParams
): Promise<InvoiceResponse> {
    // In development without Xendit key, return mock
    if (!xenditClient) {
        console.warn("Xendit client not initialized, returning mock invoice");
        const mockId = `mock_inv_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        return {
            id: mockId,
            externalId: params.externalId,
            invoiceUrl: `https://checkout-staging.xendit.co/web/${mockId}`,
            amount: params.amount,
            status: "PENDING",
            expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        };
    }

    try {
        const invoice = await xenditClient.Invoice.createInvoice({
            data: {
                externalId: params.externalId,
                amount: params.amount,
                description: params.description,
                invoiceDuration: "86400", // 24 hours in seconds (string per SDK)
                customer: {
                    email: params.payerEmail,
                },
                items: [
                    {
                        name: params.itemName,
                        quantity: 1,
                        price: params.amount,
                    },
                ],
                successRedirectUrl: params.successRedirectUrl,
                failureRedirectUrl: params.failureRedirectUrl,
                // Enable multiple payment methods
                paymentMethods: ["BCA", "BNI", "MANDIRI", "OVO", "DANA", "QRIS"],
            },
        });

        return {
            id: invoice.id ?? "",
            externalId: invoice.externalId,
            invoiceUrl: invoice.invoiceUrl,
            amount: invoice.amount,
            status: invoice.status,
            expiryDate: invoice.expiryDate ? new Date(invoice.expiryDate) : new Date(Date.now() + 24 * 60 * 60 * 1000),
        };
    } catch (error) {
        console.error("Xendit invoice creation failed:", error);
        throw new Error("Payment gateway error. Please try again later.");
    }
}

/**
 * Platform fee percentage
 */
export const PLATFORM_FEE_PERCENTAGE = 0.05; // 5%

/**
 * Calculate platform fee and seller payout
 */
export function calculateFees(transactionAmount: number): {
    platformFee: number;
    sellerPayout: number;
} {
    const platformFee = Math.floor(transactionAmount * PLATFORM_FEE_PERCENTAGE);
    const sellerPayout = transactionAmount - platformFee;

    return { platformFee, sellerPayout };
}

/**
 * Verification period duration in milliseconds (24 hours)
 */
export const VERIFICATION_PERIOD_MS = 24 * 60 * 60 * 1000;

/**
 * Calculate verification deadline from transfer time
 */
export function calculateVerificationDeadline(transferTime: Date = new Date()): Date {
    return new Date(transferTime.getTime() + VERIFICATION_PERIOD_MS);
}

/**
 * Check if verification period has expired
 */
export function isVerificationExpired(deadline: Date | null): boolean {
    if (!deadline) return false;
    return new Date() > deadline;
}
