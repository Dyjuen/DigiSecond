
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { getPlatformConfig, SystemConfigKey } from "../../config";
import { UserRole } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export const systemConfigRouter = createTRPCRouter({
    /**
     * Get public configuration (if any are safe to expose publicly)
     * Currently exposing all for transparency/frontend calculations
     */
    getPublicConfig: publicProcedure.query(async ({ ctx }) => {
        return getPlatformConfig(ctx.db);
    }),

    /**
     * Get all configuration with metadata (Admin only)
     */
    getAdminConfig: protectedProcedure.query(async ({ ctx }) => {
        if (ctx.session.user.role !== UserRole.ADMIN) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Hanya admin yang dapat mengakses konfigurasi" });
        }

        const configs = await ctx.db.systemConfig.findMany({
            orderBy: { key: "asc" },
        });

        return configs;
    }),

    /**
     * Update configuration (Admin only)
     */
    updateConfig: protectedProcedure
        .input(
            z.object({
                updates: z.array(
                    z.object({
                        key: z.nativeEnum(SystemConfigKey),
                        value: z.string(),
                    })
                ),
            })
        )
        .mutation(async ({ ctx, input }) => {
            if (ctx.session.user.role !== UserRole.ADMIN) {
                throw new TRPCError({ code: "FORBIDDEN", message: "Hanya admin yang dapat mengubah konfigurasi" });
            }

            const results: Array<{ key: string; value: string; description: string | null; updated_at: Date }> = [];

            for (const update of input.updates) {
                // Validate values based on key
                if (update.key === SystemConfigKey.PLATFORM_FEE_PERCENTAGE) {
                    const val = parseFloat(update.value);
                    if (isNaN(val) || val < 0 || val > 1) {
                        throw new TRPCError({
                            code: "BAD_REQUEST",
                            message: `Nilai fee tidak valid: ${update.value}. Harus antara 0 - 1 (misal 0.05 untuk 5%)`,
                        });
                    }
                }

                if (update.key === SystemConfigKey.PAYMENT_TIMEOUT_HOURS || update.key === SystemConfigKey.VERIFICATION_PERIOD_HOURS) {
                    const val = parseInt(update.value, 10);
                    if (isNaN(val) || val < 1) {
                        throw new TRPCError({
                            code: "BAD_REQUEST",
                            message: `Nilai waktu tidak valid: ${update.value}. Harus angka positif.`,
                        });
                    }
                }

                const result = await ctx.db.systemConfig.upsert({
                    where: { key: update.key },
                    update: { value: update.value },
                    create: {
                        key: update.key,
                        value: update.value,
                        description: getDescription(update.key),
                    },
                });
                results.push(result);
            }

            return results;
        }),
});

function getDescription(key: SystemConfigKey): string {
    switch (key) {
        case SystemConfigKey.PLATFORM_FEE_PERCENTAGE:
            return "Persentase biaya platform per transaksi (desimal, 0.05 = 5%)";
        case SystemConfigKey.PAYMENT_TIMEOUT_HOURS:
            return "Batas waktu pembayaran dalam jam sebelum transaksi kadaluarsa";
        case SystemConfigKey.VERIFICATION_PERIOD_HOURS:
            return "Batas waktu konfirmasi otomatis setelah barang dikirim dalam jam";
        default:
            return "Konfigurasi sistem";
    }
}
