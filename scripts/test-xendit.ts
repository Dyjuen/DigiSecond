
import { createXenditInvoice } from "../src/lib/xendit";
import { config } from "dotenv";

config(); // Load .env

async function testXendit() {
    console.log("Testing Xendit Invoice Creation...");

    if (!process.env.XENDIT_SECRET_KEY) {
        console.error("Error: XENDIT_SECRET_KEY not found in env");
        return;
    }

    try {
        const timestamp = Date.now();
        const invoice = await createXenditInvoice({
            externalId: `test_inv_${timestamp}`,
            amount: 50000,
            payerEmail: "test@example.com",
            description: "Test Invoice Description",
            itemName: "Test Item",
            successRedirectUrl: "https://example.com/success",
            failureRedirectUrl: "https://example.com/failure",
        });

        console.log("Invoice Created Successfully!");
        console.log("ID:", invoice.id);
        console.log("URL:", invoice.invoiceUrl);
        console.log("Status:", invoice.status);
    } catch (error) {
        console.error("Failed to create invoice:", error);
    }
}

testXendit();
