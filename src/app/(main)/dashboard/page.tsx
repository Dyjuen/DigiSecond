"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useTheme } from "next-themes";
import Counter from "@/components/ui/Counter";
import { Aurora } from "@/components/effects/Aurora";
import { GlowCard } from "@/components/ui/spotlight-card";
import {
    ShoppingBag,
    CheckCircle,
    Clock,
    CreditCard,
    DollarSign,
    TrendingUp,
    Settings,
    PlusCircle,
    Gavel,
    Shield
} from "lucide-react";

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { theme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const user = session?.user;

    useEffect(() => {
        setMounted(true);
    }, []);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-black pt-24 pb-16 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!user) return null;

    const quickActions: {
        title: string;
        description: string;
        href: string;
        icon: JSX.Element;
        color: string;
        glow: "blue" | "purple" | "green" | "red" | "orange";
    }[] = [
            {
                title: "Marketplace",
                description: "Jelajahi & Beli",
                href: "/listings",
                icon: <ShoppingBag className="w-6 h-6" />,
                color: "blue",
                glow: "blue"
            },
            {
                title: "Lelang Aktif",
                description: "Ikuti Bidding",
                href: "/lelang",
                icon: <Gavel className="w-6 h-6" />,
                color: "orange",
                glow: "orange"
            },
            {
                title: "Pengaturan",
                description: "Kelola Profil",
                href: "/settings",
                icon: <Settings className="w-6 h-6" />,
                color: "green",
                glow: "green"
            },
        ];

    if (user.role === "SELLER" || user.role === "ADMIN") {
        quickActions.splice(1, 0, {
            title: "Jual Produk",
            description: "Tambah Listing",
            href: "/sell",
            icon: <PlusCircle className="w-6 h-6" />,
            color: "purple",
            glow: "purple"
        });
    }

    const stats: {
        label: string;
        value: number;
        prefix?: string;
        color: "blue" | "green" | "orange" | "purple";
    }[] = [
            { label: "Total Pembelian", value: 0, prefix: "Rp", color: "blue" },
            { label: "Transaksi Sukses", value: 0, color: "green" },
            { label: "Dalam Proses", value: 1, color: "orange" },
        ];

    if (user.role === "SELLER") {
        stats.push({ label: "Total Penjualan", value: 0, prefix: "Rp", color: "blue" });
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black pt-24 pb-16 relative overflow-hidden">
            {/* GLOBAL AURORA BACKGROUND */}
            {mounted && (
                <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                    {resolvedTheme === "light" ? (
                        <div className="w-full h-full opacity-60">
                            <Aurora
                                key="light-aurora"
                                colorStops={["#6366f1", "#a5b4fc", "#c7d2fe"]}
                                blend={0.5}
                                amplitude={1.0}
                                speed={0.3}
                                className="w-full h-full scale-110"
                            />
                        </div>
                    ) : (
                        <div className="w-full h-full opacity-40">
                            <Aurora
                                key="dark-aurora"
                                colorStops={["#6366f1", "#a5b4fc", "#6366f1"]}
                                blend={0.6}
                                amplitude={1.2}
                                speed={0.5}
                                className="w-full h-full scale-110"
                            />
                        </div>
                    )}
                </div>
            )}

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Hero Section */}
                <div className="mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4"
                    >
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white mb-2 tracking-tight">
                                Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-purple-500">{user.name}</span>!
                            </h1>
                            <p className="text-zinc-500 dark:text-zinc-400 text-lg">
                                Welcome back to your command center.
                            </p>
                        </div>
                    </motion.div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {stats.map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1, duration: 0.4 }}
                                >
                                    <GlowCard
                                        className="!p-6 bg-white/40 dark:bg-zinc-900/40 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 h-full flex flex-col justify-center items-center text-center"
                                        glowColor="purple"
                                        customSize
                                    >
                                        <div className="relative z-10 space-y-2">
                                            <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{stat.label}</p>
                                            <div className="flex items-center justify-center gap-1">
                                                {stat.prefix && <span className="text-lg font-bold text-zinc-500 dark:text-zinc-500 opacity-80">{stat.prefix}</span>}
                                                <span className="text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                                                    {stat.value.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                        {/* Decorative background element */}
                                        <div className={`absolute -right-6 -bottom-6 w-24 h-24 bg-${stat.color}-500/5 rounded-full blur-3xl group-hover:bg-${stat.color}-500/10 transition-colors`} />
                                    </GlowCard>
                                </motion.div>
                            ))}
                        </div>

                        {/* Quick Actions */}
                        <div>
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-brand-primary" />
                                Quick Access
                            </h2>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {quickActions.map((action, idx) => (
                                    <Link key={idx} href={action.href} className="block group h-full">
                                        <GlowCard
                                            className="h-full !p-4 bg-white/60 dark:bg-zinc-900/60 hover:bg-white/80 dark:hover:bg-zinc-900/80 transition-all cursor-pointer border border-zinc-200/50 dark:border-zinc-800/50"
                                            glowColor="purple"
                                            customSize
                                        >
                                            <div className="flex flex-col items-center text-center gap-3">
                                                <div className={`p-3 rounded-2xl bg-${action.color}-500/10 text-${action.color}-500 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 ring-1 ring-${action.color}-500/20`}>
                                                    {action.icon}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-sm text-zinc-900 dark:text-white mb-0.5">{action.title}</h3>
                                                    <p className="text-xs text-zinc-500 leading-snug">{action.description}</p>
                                                </div>
                                            </div>
                                        </GlowCard>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-8">Recent Activity</h2>
                            <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800">
                                {/* Timeline Item 1 */}
                                <div className="relative pl-12 group">
                                    <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 border-4 border-white dark:border-black flex items-center justify-center z-10 group-hover:scale-110 transition-transform">
                                        <div className="w-2.5 h-2.5 rounded-full bg-brand-primary" />
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                        <p className="font-semibold text-zinc-900 dark:text-white">Login Successful</p>
                                        <span className="text-xs font-medium text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full">Just now</span>
                                    </div>
                                    <p className="text-sm text-zinc-500 mt-1">Successfully accessed the dashboard.</p>
                                </div>
                                {/* Timeline Item 2 */}
                                <div className="relative pl-12 group">
                                    <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 border-4 border-white dark:border-black flex items-center justify-center z-10 group-hover:scale-110 transition-transform">
                                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-400" />
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                        <p className="font-semibold text-zinc-900 dark:text-white">Account Created</p>
                                        <span className="text-xs font-medium text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full">2026-01-20</span>
                                    </div>
                                    <p className="text-sm text-zinc-500 mt-1">Welcome to the DigiSecond family!</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Profile Summary */}
                        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 dark:from-zinc-800 dark:to-zinc-900 rounded-3xl p-1 text-zinc-100 relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/20 rounded-full blur-3xl" />
                            <div className="bg-black/20 backdrop-blur-xl rounded-[22px] p-6 h-full border border-white/5">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-primary to-purple-600 p-0.5">
                                        <div className="w-full h-full bg-zinc-900 rounded-[14px] flex items-center justify-center text-2xl font-bold">
                                            {user.name?.charAt(0)}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{user.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-primary/20 text-brand-primary border border-brand-primary/20">
                                                {user.role}
                                            </span>
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-zinc-400 border border-white/5">
                                                {user.tier}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm text-zinc-400">
                                        <span>Listing Quota</span>
                                        <span className="text-white">{user.tier === "FREE" ? "3/5" : "Unlimited"}</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-brand-primary rounded-full"
                                            style={{ width: user.tier === "FREE" ? "60%" : "100%" }}
                                        />
                                    </div>
                                    <Link href="/profile" className="block mt-6">
                                        <button className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors">
                                            View Profile
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Membership & Benefits Widget */}
                        <div className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-zinc-900 dark:text-white">Current Plan</h3>
                                <span className={`text-xs px-2.5 py-1 rounded-lg border font-semibold ${user.tier === 'PRO' || user.tier === 'ENTERPRISE'
                                    ? 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary'
                                    : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500'
                                    }`}>
                                    {user.tier}
                                </span>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-zinc-500">Service Fee</span>
                                    <span className="font-medium text-zinc-900 dark:text-white">
                                        {user.tier === "ENTERPRISE" ? "1%" : user.tier === "PRO" ? "3%" : "5%"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-zinc-500">Listing Quota</span>
                                    <span className="font-medium text-zinc-900 dark:text-white">
                                        {user.tier === "FREE" ? "3/5" : "Unlimited"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-zinc-500">Escrow Service</span>
                                    <span className="font-medium text-emerald-500 flex items-center gap-1">
                                        <CheckCircle className="w-3.5 h-3.5" /> Included
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-zinc-500">Analytics</span>
                                    <span className="font-medium text-zinc-900 dark:text-white">
                                        {user.tier === "FREE" ? "Basic" : "Advanced"}
                                    </span>
                                </div>
                            </div>

                            <Link href="/dashboard/pricing" className="block">
                                <button className="w-full py-2.5 text-sm font-semibold text-white bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 rounded-xl transition-colors border border-transparent hover:border-zinc-700 dark:hover:border-zinc-600">
                                    Change Plan
                                </button>
                            </Link>
                        </div>
                        {/* Upgrade Banner */}
                        {user.tier === 'FREE' && (
                            <GlowCard className="!p-6 bg-gradient-to-br from-purple-500/10 to-indigo-500/5 dark:bg-zinc-900/40" glowColor="purple" customSize>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                                        <TrendingUp className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs font-bold bg-orange-500 text-white px-2 py-1 rounded">PRO</span>
                                </div>
                                <h3 className="font-bold text-zinc-900 dark:text-white mb-1">Upgrade to Pro</h3>
                                <p className="text-sm text-zinc-500 mb-4">Get unlimited listings and lower fees.</p>
                                <button className="w-full py-2.5 text-sm font-bold text-orange-600 bg-orange-500/10 rounded-xl hover:bg-orange-500 hover:text-white transition-all">
                                    Upgrade Now
                                </button>
                            </GlowCard>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
