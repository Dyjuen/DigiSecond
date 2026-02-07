
import { type PrismaClient } from "@prisma/client";

/**
 * Platform fee percentage (default 0.05 / 5%)
 */
export const DEFAULT_PLATFORM_FEE_PERCENTAGE = 0.05;

/**
 * Payment timeout in hours (default 24h)
 */
export const DEFAULT_PAYMENT_TIMEOUT_HOURS = 24;

/**
 * Verification period in hours (default 24h)
 */
export const DEFAULT_VERIFICATION_PERIOD_HOURS = 24;

export type SystemConfigResult = {
    platformFeePercentage: number;
    paymentTimeoutHours: number;
    verificationPeriodHours: number;
};

/**
 * System config keys
 */
export enum SystemConfigKey {
    PLATFORM_FEE_PERCENTAGE = "PLATFORM_FEE_PERCENTAGE",
    PAYMENT_TIMEOUT_HOURS = "PAYMENT_TIMEOUT_HOURS",
    VERIFICATION_PERIOD_HOURS = "VERIFICATION_PERIOD_HOURS",
}

/**
 * Fetch platform configuration from database with fallbacks
 */
export async function getPlatformConfig(db: PrismaClient): Promise<SystemConfigResult> {
    try {
        const configs = await db.systemConfig.findMany({
            where: {
                key: {
                    in: [
                        SystemConfigKey.PLATFORM_FEE_PERCENTAGE,
                        SystemConfigKey.PAYMENT_TIMEOUT_HOURS,
                        SystemConfigKey.VERIFICATION_PERIOD_HOURS,
                    ],
                },
            },
        });

        const configMap = new Map(configs.map((c) => [c.key, c.value]));

        const platformFeePercentage = parseFloat(
            configMap.get(SystemConfigKey.PLATFORM_FEE_PERCENTAGE) ?? String(DEFAULT_PLATFORM_FEE_PERCENTAGE)
        );

        const paymentTimeoutHours = parseInt(
            configMap.get(SystemConfigKey.PAYMENT_TIMEOUT_HOURS) ?? String(DEFAULT_PAYMENT_TIMEOUT_HOURS),
            10
        );

        const verificationPeriodHours = parseInt(
            configMap.get(SystemConfigKey.VERIFICATION_PERIOD_HOURS) ?? String(DEFAULT_VERIFICATION_PERIOD_HOURS),
            10
        );

        return {
            platformFeePercentage: isNaN(platformFeePercentage) ? DEFAULT_PLATFORM_FEE_PERCENTAGE : platformFeePercentage,
            paymentTimeoutHours: isNaN(paymentTimeoutHours) ? DEFAULT_PAYMENT_TIMEOUT_HOURS : paymentTimeoutHours,
            verificationPeriodHours: isNaN(verificationPeriodHours) ? DEFAULT_VERIFICATION_PERIOD_HOURS : verificationPeriodHours,
        };
    } catch (error) {
        console.error("Failed to fetch system config, using defaults:", error);
        return {
            platformFeePercentage: DEFAULT_PLATFORM_FEE_PERCENTAGE,
            paymentTimeoutHours: DEFAULT_PAYMENT_TIMEOUT_HOURS,
            verificationPeriodHours: DEFAULT_VERIFICATION_PERIOD_HOURS,
        };
    }
}
