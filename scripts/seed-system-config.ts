
import { PrismaClient } from "@prisma/client";
import { SystemConfigKey, DEFAULT_PLATFORM_FEE_PERCENTAGE, DEFAULT_PAYMENT_TIMEOUT_HOURS, DEFAULT_VERIFICATION_PERIOD_HOURS } from "../src/server/config";

const db = new PrismaClient();

async function main() {
    console.log("Seeding system configuration...");

    const configs = [
        {
            key: SystemConfigKey.PLATFORM_FEE_PERCENTAGE,
            value: String(DEFAULT_PLATFORM_FEE_PERCENTAGE),
            description: "Persentase biaya platform per transaksi (desimal, 0.05 = 5%)",
        },
        {
            key: SystemConfigKey.PAYMENT_TIMEOUT_HOURS,
            value: String(DEFAULT_PAYMENT_TIMEOUT_HOURS),
            description: "Batas waktu pembayaran dalam jam sebelum transaksi kadaluarsa",
        },
        {
            key: SystemConfigKey.VERIFICATION_PERIOD_HOURS,
            value: String(DEFAULT_VERIFICATION_PERIOD_HOURS),
            description: "Batas waktu konfirmasi otomatis setelah barang dikirim dalam jam",
        },
    ];

    for (const config of configs) {
        await db.systemConfig.upsert({
            where: { key: config.key },
            update: {}, // Don't overwrite if exists
            create: config,
        });
        console.log(`Ensured config: ${config.key}`);
    }

    console.log("Seeding complete.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await db.$disconnect();
    });
