"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";

export default function SettingsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const user = session?.user;

    const [activeTab, setActiveTab] = useState("account");

    // Redirect to login if not authenticated
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login"); // Fixed: Redirect to login
        }
    }, [status, router]);

    if (!user) return null;

    const handleLogout = async () => {
        await signOut({ callbackUrl: "/" }); // Fixed: Use next-auth signOut
    };

    const tabs = [
        { id: "account", label: "Akun Public", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
        { id: "security", label: "Keamanan", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
        { id: "billing", label: "Billing", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
        { id: "notifications", label: "Notifikasi", icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" },
    ];

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black pt-24 pb-16">
            <div className="max-w-6xl mx-auto px-6">

                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">
                    Pengaturan
                </h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Tabs */}
                    <div className="lg:w-72 shrink-0">
                        <nav className="space-y-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all ${activeTab === tab.id
                                        ? "bg-white dark:bg-zinc-900 border border-brand-primary/20 text-brand-primary shadow-lg shadow-brand-primary/5 font-medium"
                                        : "text-zinc-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-white"
                                        }`}
                                >
                                    <svg className={`w-5 h-5 ${activeTab === tab.id ? "text-brand-primary" : "text-zinc-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                                    </svg>
                                    {tab.label}
                                </button>
                            ))}

                            <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-4" />

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors font-medium"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Sign Out
                            </button>
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-h-[500px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm"
                            >
                                {activeTab === "account" && (
                                    <div className="space-y-8">
                                        <div>
                                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">Informasi Publik</h2>
                                            <p className="text-sm text-zinc-500">Info ini akan terlihat oleh pengguna lain di platform.</p>
                                        </div>

                                        <div className="space-y-6 max-w-2xl">
                                            <div>
                                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Display Name</label>
                                                <input
                                                    type="text"
                                                    defaultValue={user.name ?? ""}
                                                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Username</label>
                                                <div className="flex">
                                                    <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                                                        digisecond.id/
                                                    </span>
                                                    <input
                                                        type="text"
                                                        defaultValue={user.id}
                                                        className="flex-1 px-4 py-3 rounded-r-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Bio / Deskripsi</label>
                                                <textarea
                                                    rows={4}
                                                    placeholder="Tulis sedikit tentang diri Anda..."
                                                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:ring-2 focus:ring-brand-primary outline-none transition-all resize-none"
                                                />
                                            </div>

                                            <div className="pt-4">
                                                <Button size="lg">Simpan Perubahan</Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "security" && (
                                    <div className="space-y-8">
                                        <div>
                                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">Keamanan Akun</h2>
                                            <p className="text-sm text-zinc-500">Kelola password dan sesi login Anda.</p>
                                        </div>
                                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/20 rounded-xl text-amber-800 dark:text-amber-400 text-sm">
                                            Fitur keamanan sedang dalam pemeliharaan sistem.
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
