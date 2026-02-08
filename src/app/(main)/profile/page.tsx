"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { api } from "@/trpc/react";
import { Star, FileText, Shield, ShieldAlert, CheckCircle, Smartphone } from "lucide-react";

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const user = session?.user;

    const { data: ratingSummary } = api.review.getRatingSummary.useQuery(
        { user_id: user?.id || "" },
        { enabled: !!user?.id }
    );

    const { data: reviewsData } = api.review.getByUser.useQuery(
        { user_id: user?.id || "", limit: 5 },
        { enabled: !!user?.id }
    );

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

    const userInitial = user.name?.charAt(0) || "U";

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black pt-24 pb-16">
            <div className="max-w-5xl mx-auto px-6">
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="md:col-span-1">
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col items-center text-center sticky top-24">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-brand-primary to-purple-600 p-1 mb-4 shadow-xl shadow-brand-primary/20">
                                <div className="w-full h-full rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center text-4xl font-bold text-brand-primary">
                                    {userInitial}
                                </div>
                            </div>

                            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">{user.name}</h1>
                            <p className="text-zinc-500 mb-4">{user.email}</p>

                            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold mb-6 ${user.verified
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                                : "bg-amber-100 text-amber-700"}`}>
                                {user.verified ? "Verified User" : "Unverified"}
                            </span>

                            <div className="w-full grid grid-cols-2 gap-4 border-t border-zinc-200 dark:border-zinc-800 pt-6">
                                <div>
                                    <p className="text-2xl font-bold text-zinc-900 dark:text-white">{ratingSummary?.count || 0}</p>
                                    <p className="text-xs text-zinc-500 uppercase tracking-wider mt-1">Review</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-zinc-900 dark:text-white">{ratingSummary?.average?.toFixed(1) || "5.0"}</p>
                                    <p className="text-xs text-zinc-500 uppercase tracking-wider mt-1">Rating</p>
                                </div>
                            </div>

                            <Link href="/profile/edit" className="w-full mt-6">
                                <Button className="w-full" variant="outline">Edit Profil</Button>
                            </Link>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Account Details */}
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Informasi Akun</h2>

                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">User ID</label>
                                    <div className="font-mono text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-3 py-2 rounded-lg truncate" title={user.id}>{user.id}</div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">Membership Plan</label>
                                    <div className="flex items-center gap-2 px-3 py-2">
                                        <div className={`font-bold ${user.tier === 'PRO' ? 'text-brand-primary' : user.tier === 'ENTERPRISE' ? 'text-purple-500' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                            {user.tier}
                                        </div>
                                        {user.tier === 'FREE' && (
                                            <Link href="/dashboard/pricing">
                                                <Button size="sm" variant="outline" className="h-6 text-xs ml-2">Upgrade</Button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">Bergabung Sejak</label>
                                    <div className="font-medium text-zinc-900 dark:text-white px-3 py-2">2026-01-20</div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">Status</label>
                                    <div className="flex items-center gap-2 px-3 py-2">
                                        <div className={`w-2 h-2 rounded-full ${!user.suspended ? "bg-emerald-500" : "bg-red-500"}`} />
                                        <span className="font-medium text-zinc-900 dark:text-white">{!user.suspended ? "Active" : "Suspended"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Reviews */}
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Review Terbaru</h2>

                            {reviewsData?.reviews && reviewsData.reviews.length > 0 ? (
                                <div className="space-y-4">
                                    {reviewsData.reviews.map((review) => (
                                        <div key={review.review_id} className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-primary to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                                                        {review.reviewer?.name?.charAt(0) || "?"}
                                                    </div>
                                                    <span className="font-medium text-zinc-900 dark:text-white">{review.reviewer?.name || "Anonymous"}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-4 h-4 ${i < review.rating ? "text-amber-400 fill-amber-400" : "text-zinc-300"}`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            {review.comment && <p className="text-sm text-zinc-600 dark:text-zinc-400">{review.comment}</p>}
                                            <p className="text-xs text-zinc-400 mt-2">
                                                {new Date(review.created_at).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700">
                                    <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FileText className="w-8 h-8 text-zinc-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-1">Belum ada review</h3>
                                    <p className="text-zinc-500 max-w-xs mx-auto">Lakukan transaksi untuk mendapatkan review dari pengguna lain.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
