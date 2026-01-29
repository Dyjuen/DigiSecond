"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import Counter from "@/components/ui/Counter";
import { ShoppingBag, CheckCircle, Clock, CreditCard, DollarSign } from "lucide-react";

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const user = session?.user;

    // Redirect to login if not authenticated
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login"); // Fixed: Redirect to login
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

    const quickActions = [
        {
            title: "Marketplace",
            description: "Jelajahi & Beli",
            href: "/listings",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
            ),
            color: "from-blue-500 to-cyan-500",
        },
        {
            title: "Lelang Aktif",
            description: "Ikuti Bidding",
            href: "/lelang",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: "from-amber-500 to-orange-500",
        },
        {
            title: "Pengaturan",
            description: "Kelola Profil",
            href: "/settings",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            color: "from-zinc-500 to-zinc-600",
        },
    ];

    if (user.role === "SELLER" || user.role === "ADMIN") {
        quickActions.splice(1, 0, {
            title: "Jual Produk",
            description: "Tambah Listing",
            href: "/sell",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
            ),
            color: "from-emerald-500 to-teal-500",
        });
    }

    const stats = [
        { label: "Total Pembelian", value: 0, prefix: "Rp", icon: "shopping-bag", color: "blue" },
        { label: "Transaksi Sukses", value: 0, icon: "check-circle", color: "emerald" },
        { label: "Dalam Proses", value: 1, icon: "clock", color: "amber" },
    ];

    if (user.role === "SELLER") {
        stats.push({ label: "Total Penjualan", value: 0, prefix: "Rp", icon: "cash", color: "purple" });
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black pt-24 pb-16">
            <div className="max-w-6xl mx-auto px-6">

                {/* Modern Header with Glassmorphism */}
                <div className="mb-10 relative overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 shadow-xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
                                Dashboard {user.role === "SELLER" ? "Seller" : "Buyer"}
                            </h1>
                            <p className="text-zinc-500 dark:text-zinc-400">
                                Selamat datang kembali, <span className="font-semibold text-brand-primary">{user.name}</span>! 👋
                            </p>
                        </div>
                        <div className="flex items-center gap-3 bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-xl">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                System Normal
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className={`text-${stat.color}-500 bg-${stat.color}-500/10 p-3 rounded-xl`}>
                                    {stat.icon === "shopping-bag" && <ShoppingBag className="w-6 h-6" />}
                                    {stat.icon === "check-circle" && <CheckCircle className="w-6 h-6" />}
                                    {stat.icon === "clock" && <Clock className="w-6 h-6" />}
                                    {stat.icon === "credit-card" && <CreditCard className="w-6 h-6" />}
                                    {stat.icon === "cash" && <DollarSign className="w-6 h-6" />}
                                </span>
                                <span className="text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg">
                                    +0%
                                </span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                {stat.prefix && <span className="text-sm font-medium text-zinc-500">{stat.prefix}</span>}
                                <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                                    {stat.value}
                                </span>
                            </div>
                            <p className="text-sm text-zinc-500 mt-1">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Quick Actions */}
                        <div>
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Akses Cepat
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {quickActions.map((action, idx) => (
                                    <Link
                                        key={idx}
                                        href={action.href}
                                        className="group relative overflow-hidden bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 hover:border-brand-primary/50 transition-all"
                                    >
                                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${action.color} opacity-10 rounded-bl-full group-hover:scale-110 transition-transform`} />

                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white mb-4 shadow-lg shadow-brand-primary/20`}>
                                            {action.icon}
                                        </div>
                                        <h3 className="font-bold text-zinc-900 dark:text-white mb-1">{action.title}</h3>
                                        <p className="text-sm text-zinc-500">{action.description}</p>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Aktivitas Terbaru</h2>
                            <div className="space-y-6 relative before:absolute before:left-4 before:top-8 before:bottom-0 before:w-px before:bg-zinc-200 dark:before:bg-zinc-800">
                                {/* Timeline Item */}
                                <div className="relative pl-10">
                                    <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-brand-primary border-4 border-white dark:border-zinc-900" />
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                        <p className="font-medium text-zinc-900 dark:text-white">Login Berhasil</p>
                                        <span className="text-xs text-zinc-500">Baru saja</span>
                                    </div>
                                    <p className="text-sm text-zinc-500 mt-1">Anda berhasil masuk ke dashboard.</p>
                                </div>
                                <div className="relative pl-10">
                                    <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-zinc-300 dark:bg-zinc-700 border-4 border-white dark:border-zinc-900" />
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                        <p className="font-medium text-zinc-900 dark:text-white">Akun Dibuat</p>
                                        <span className="text-xs text-zinc-500">2026-01-20</span>
                                    </div>
                                    <p className="text-sm text-zinc-500 mt-1">Selamat bergabung di DigiSecond!</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Widgets */}
                    <div className="space-y-6">
                        {/* Profile Card Widget */}
                        <div className="bg-gradient-to-br from-brand-primary to-purple-700 rounded-3xl p-6 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-bold mb-4 border-2 border-white/30">
                                    {user.name?.charAt(0)}
                                </div>
                                <h3 className="font-bold text-lg mb-1">{user.name}</h3>
                                <p className="text-white/80 text-sm mb-6">{user.role}</p>

                                <Link href="/profile" className="w-full py-2.5 bg-white text-brand-primary font-semibold rounded-xl hover:bg-zinc-50 transition-colors">
                                    Lihat Profil
                                </Link>
                            </div>
                        </div>

                        {/* Membership & Fees Widget */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-zinc-900 dark:text-white">Keanggotaan</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs px-2 py-0.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-500 font-medium">
                                        {user.role === "SELLER" ? "Seller" : user.role === "ADMIN" ? "Admin" : user.tier === "PRO" ? "Pro Plan" : user.tier === "ENTERPRISE" ? "Enterprise" : "Free Tier"}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* Quota */}
                                <div>
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span className="text-zinc-500">Kuota Listing</span>
                                        <span className="font-medium text-zinc-900 dark:text-white">
                                            {user.tier === "FREE" ? "3/5" : "Unlimited"}
                                        </span>
                                    </div>
                                    <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-brand-primary rounded-full transition-all duration-500"
                                            style={{ width: user.tier === "FREE" ? "60%" : "100%" }}
                                        />
                                    </div>
                                    <p className="text-xs text-zinc-400 mt-1">Reset tanggal 1 Feb 2026</p>
                                </div>

                                <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

                                {/* Fees */}
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs font-semibold text-zinc-900 dark:text-white mb-2">Biaya Layanan</p>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-zinc-500">Admin Fee</span>
                                            <span className="font-medium text-zinc-900 dark:text-white">
                                                {user.tier === "ENTERPRISE" ? "1%" : user.tier === "PRO" ? "3%" : "5%"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-500">Escrow</span>
                                            <span className="font-medium text-emerald-500">Termasuk</span>
                                        </div>
                                    </div>
                                </div>

                                <Link href="/dashboard/pricing" className="block">
                                    <button className="w-full py-2.5 text-sm font-medium text-white bg-zinc-900 dark:bg-zinc-700 rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-600 transition-colors">
                                        Upgrade Plan
                                    </button>
                                </Link>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                            <h3 className="font-bold text-zinc-900 dark:text-white mb-4">Rekomendasi</h3>
                            <div className="space-y-4">
                                <Link href="/lelang" className="block p-3 rounded-xl bg-gradient-to-r from-brand-primary/10 to-indigo-500/10 border border-brand-primary/20 hover:border-brand-primary/40 transition-colors">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse"></span>
                                        <span className="text-xs font-semibold text-brand-primary">LELANG AKTIF</span>
                                    </div>
                                    <p className="text-sm font-medium text-zinc-900 dark:text-white line-clamp-1">
                                        Akun Sultan MLBB Full Skin
                                    </p>
                                    <div className="flex items-center justify-between mt-2 text-xs text-zinc-500">
                                        <span>Current Bid:</span>
                                        <span className="font-bold text-brand-primary">Rp 2.5jt</span>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
