"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

// Enum keys must match the server-side enum
enum SystemConfigKey {
    PLATFORM_FEE_PERCENTAGE = "PLATFORM_FEE_PERCENTAGE",
    PAYMENT_TIMEOUT_HOURS = "PAYMENT_TIMEOUT_HOURS",
    VERIFICATION_PERIOD_HOURS = "VERIFICATION_PERIOD_HOURS",
}

const formSchema = z.object({
    platformFeePercentage: z.string().refine(
        (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 100,
        "Harus berupa angka 0-100"
    ),
    paymentTimeoutHours: z.string().refine(
        (val) => !isNaN(parseInt(val)) && parseInt(val) > 0,
        "Harus berupa angka positif"
    ),
    verificationPeriodHours: z.string().refine(
        (val) => !isNaN(parseInt(val)) && parseInt(val) > 0,
        "Harus berupa angka positif"
    ),
});

type FormValues = z.infer<typeof formSchema>;

export default function PlatformSettingsPage() {
    const utils = api.useUtils();

    // Fetch existing config
    const { data: configs, isLoading } = api.systemConfig.getAdminConfig.useQuery();

    const updateMutation = api.systemConfig.updateConfig.useMutation({
        onSuccess: () => {
            toast.success("Konfigurasi berhasil disimpan");
            utils.systemConfig.getAdminConfig.invalidate();
        },
        onError: (error) => {
            toast.error(`Gagal menyimpan: ${error.message}`);
        },
    });

    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        formState: { errors, isDirty },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            platformFeePercentage: "5",
            paymentTimeoutHours: "24",
            verificationPeriodHours: "24",
        },
    });

    // Update form values when data is loaded
    useEffect(() => {
        if (configs) {
            const feeConfig = configs.find((c) => c.key === SystemConfigKey.PLATFORM_FEE_PERCENTAGE);
            const timeoutConfig = configs.find((c) => c.key === SystemConfigKey.PAYMENT_TIMEOUT_HOURS);
            const verifyConfig = configs.find((c) => c.key === SystemConfigKey.VERIFICATION_PERIOD_HOURS);

            if (feeConfig) {
                // Convert 0.05 back to 5 for display
                const feePercent = (parseFloat(feeConfig.value) * 100).toString();
                setValue("platformFeePercentage", feePercent);
            }
            if (timeoutConfig) {
                setValue("paymentTimeoutHours", timeoutConfig.value);
            }
            if (verifyConfig) {
                setValue("verificationPeriodHours", verifyConfig.value);
            }
        }
    }, [configs, setValue]);

    function onSubmit(values: FormValues) {
        // Convert percentage back to decimal (5 -> 0.05)
        const feeDecimal = (parseFloat(values.platformFeePercentage) / 100).toString();

        updateMutation.mutate({
            updates: [
                { key: SystemConfigKey.PLATFORM_FEE_PERCENTAGE, value: feeDecimal },
                { key: SystemConfigKey.PAYMENT_TIMEOUT_HOURS, value: values.paymentTimeoutHours },
                { key: SystemConfigKey.VERIFICATION_PERIOD_HOURS, value: values.verificationPeriodHours },
            ],
        });
    }

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Platform Configuration</h3>
                <p className="text-sm text-muted-foreground">
                    Atur variabel global sistem aplikasi.
                </p>
            </div>
            <div className="hidden h-px shrink-0 bg-border md:block" />

            <Card>
                <CardHeader>
                    <CardTitle>Global Settings</CardTitle>
                    <CardDescription>
                        Perubahan konfigurasi akan langsung berlaku pada transaksi baru.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Platform Fee (%)
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    {...register("platformFeePercentage")}
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="100"
                                    className="flex h-10 w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                                <span className="text-sm text-muted-foreground">%</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Potongan biaya admin dari setiap transaksi. (Contoh: 5 untuk 5%)
                            </p>
                            {errors.platformFeePercentage && (
                                <p className="text-sm font-medium text-destructive mt-1 text-red-500">
                                    {errors.platformFeePercentage.message}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Batas Waktu Pembayaran (Jam)
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        {...register("paymentTimeoutHours")}
                                        type="number"
                                        min="1"
                                        className="flex h-10 w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                    <span className="text-sm text-muted-foreground">Jam</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Batas waktu user melakukan pembayaran sebelum kadaluarsa.
                                </p>
                                {errors.paymentTimeoutHours && (
                                    <p className="text-sm font-medium text-destructive mt-1 text-red-500">
                                        {errors.paymentTimeoutHours.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Masa Garansi / Verifikasi (Jam)
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        {...register("verificationPeriodHours")}
                                        type="number"
                                        min="1"
                                        className="flex h-10 w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                    <span className="text-sm text-muted-foreground">Jam</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Waktu tunggu konfirmasi otomatis setelah barang dikirim.
                                </p>
                                {errors.verificationPeriodHours && (
                                    <p className="text-sm font-medium text-destructive mt-1 text-red-500">
                                        {errors.verificationPeriodHours.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={updateMutation.isPending}>
                                {updateMutation.isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Simpan Perubahan
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
