"use client";

import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { Check, Shield, Zap, Star } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { ConfirmModal } from "@/components/ui/confirm-modal";

export default function PricingPage() {
    const { data: session, update } = useSession();
    const router = useRouter();
    const utils = api.useUtils();
    const user = session?.user;

    const upgradeMutation = api.user.upgradeTier.useMutation({
        onSuccess: async () => {
            await update(); // Update session to reflect new tier
            await utils.user.invalidate();
            router.refresh();
        }
    });

    const [showConfirm, setShowConfirm] = useState(false);
    const [selectedTier, setSelectedTier] = useState<"FREE" | "PRO" | "ENTERPRISE" | null>(null);

    const handleUpgradeClick = (tier: "FREE" | "PRO" | "ENTERPRISE") => {
        setSelectedTier(tier);
        setShowConfirm(true);
    };

    const confirmUpgrade = () => {
        if (selectedTier) {
            upgradeMutation.mutate({ tier: selectedTier });
            setShowConfirm(false);
        }
    };

    const plans = [
        {
            name: "FREE",
            price: "Rp 0",
            description: "Untuk pemula yang baru memulai.",
            features: [
                "3 Active Listings",
                "Basic Analytics",
                "Community Support",
                "Standard Fees (5%)"
            ],
            color: "zinc",
            icon: Shield
        },
        {
            name: "PRO",
            price: "Rp 99.000",
            period: "/bulan",
            description: "Untuk seller serius yang butuh fitur lebih.",
            features: [
                "Unlimited Listings",
                "Advanced Analytics",
                "Priority Support",
                "Lower Fees (3%)",
                "Verified Badge",
                "Featured Listings"
            ],
            color: "brand-primary",
            highlight: true,
            icon: Zap
        },
        {
            name: "ENTERPRISE",
            price: "Hubungi Kami",
            description: "Solusi kustom untuk toko besar.",
            features: [
                "Custom API Access",
                "Dedicated Account Manager",
                "Custom Contracts",
                "Lowest Fees (1%)",
                "White Label Options"
            ],
            color: "purple",
            icon: Star
        }
    ];

    const currentTier = user?.tier || "FREE";

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">
                        Upgrade Toko Anda
                    </h1>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                        Pilih paket yang sesuai dengan kebutuhan bisnis Anda. Upgrade kapan saja untuk membuka fitur lebih canggih.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {plans.map((plan, idx) => {
                        const isCurrent = currentTier === plan.name;
                        const isPro = plan.name === "PRO";

                        return (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={`relative rounded-3xl p-8 border ${isCurrent
                                    ? "border-brand-primary ring-2 ring-brand-primary/20 bg-white dark:bg-zinc-900"
                                    : isPro
                                        ? "border-brand-primary/50 bg-gradient-to-b from-brand-primary/5 to-transparent dark:from-brand-primary/10"
                                        : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                                    }`}
                            >
                                {isPro && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                        Most Popular
                                    </div>
                                )}

                                <div className="mb-8">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isPro ? "bg-brand-primary text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                                        }`}>
                                        <plan.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1 mb-2">
                                        <span className="text-3xl font-bold text-zinc-900 dark:text-white">{plan.price}</span>
                                        {plan.period && <span className="text-sm text-zinc-500">{plan.period}</span>}
                                    </div>
                                    <p className="text-sm text-zinc-500 min-h-[40px]">{plan.description}</p>
                                </div>

                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                                            <Check className={`w-5 h-5 shrink-0 ${isPro ? "text-brand-primary" : "text-zinc-400"}`} />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handleUpgradeClick(plan.name as any)}
                                    disabled={isCurrent || upgradeMutation.isPending}
                                    className={`w-full py-3 rounded-xl font-medium transition-all ${isCurrent
                                        ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 cursor-default"
                                        : isPro
                                            ? "bg-brand-primary text-white hover:bg-brand-primary-dark shadow-lg shadow-brand-primary/25 hover:shadow-xl hover:shadow-brand-primary/30"
                                            : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-700"
                                        }`}
                                >
                                    {isCurrent
                                        ? "Current Plan"
                                        : upgradeMutation.isPending
                                            ? "Processing..."
                                            : plan.name === "ENTERPRISE" ? "Contact Sales" : "Upgrade Plan"
                                    }
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            <ConfirmModal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={confirmUpgrade}
                title={`Upgrade ke Plan ${selectedTier}`}
                description={`Apakah Anda yakin ingin mengganti plan langganan Anda ke ${selectedTier}? Perubahan ini akan segera berlaku.`}
                confirmText="Ya, Upgrade"
                cancelText="Batal"
                variant="default"
                isLoading={upgradeMutation.isPending}
            />
        </div >
    );
}
