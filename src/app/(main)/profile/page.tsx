"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ProfilePage() {
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

    // Dummy icon logic
    const userInitial = user.name?.charAt(0) || "U";

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black pt-24 pb-16">
            <div className="max-w-5xl mx-auto px-6">

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Left Column: Avatar & Basic Info */}
                    <div className="md:col-span-1">
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col items-center text-center sticky top-24">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-brand-primary to-purple-600 p-1 mb-4 shadow-xl shadow-brand-primary/20">
                                <div className="w-full h-full rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center text-4xl font-bold text-brand-primary">
                                    {userInitial}
                                </div>
                            </div>

                            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">
                                {user.name}
                            </h1>
                            <p className="text-zinc-500 mb-4">{user.email}</p>

                            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold mb-6 ${user.verified
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                                : "bg-amber-100 text-amber-700"
                                }`}>
                                {user.verified ? "Verified User" : "Unverified"}
                            </span>

                            <div className="w-full grid grid-cols-2 gap-4 border-t border-zinc-200 dark:border-zinc-800 pt-6">
                                <div>
                                    <p className="text-2xl font-bold text-zinc-900 dark:text-white">0</p>
                                    <p className="text-xs text-zinc-500 uppercase tracking-wider mt-1">Transaksi</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-zinc-900 dark:text-white">5.0</p>
                                    <p className="text-xs text-zinc-500 uppercase tracking-wider mt-1">Rating</p>
                                </div>
                            </div>



                            <Link href="/profile/edit" className="w-full mt-6">
                                <Button className="w-full" variant="outline">
                                    Edit Profil
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Right Column: Details & Stats */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Account Details */}
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Informasi Akun</h2>

                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">User ID</label>
                                    <div className="font-mono text-sm bg-zinc-100 dark:bg-zinc-800 px-3 py-2 rounded-lg">
                                        {user.id}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">Role</label>
                                    <div className="font-medium text-zinc-900 dark:text-white px-3 py-2">
                                        {user.role}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">Bergabung Sejak</label>
                                    <div className="font-medium text-zinc-900 dark:text-white px-3 py-2">
                                        2026-01-20
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">Status</label>
                                    <div className="flex items-center gap-2 px-3 py-2">
                                        <div className={`w-2 h-2 rounded-full ${!user.suspended ? "bg-emerald-500" : "bg-red-500"}`} />
                                        <span className="font-medium text-zinc-900 dark:text-white">
                                            {!user.suspended ? "Active" : "Suspended"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Reviews / Activity Placeholder */}
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Review Terbaru</h2>

                            <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700">
                                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-1">Belum ada review</h3>
                                <p className="text-zinc-500 max-w-xs mx-auto">
                                    Lakukan transaksi untuk mendapatkan review dari pengguna lain.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
