"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import Link from "next/link";
import { Check, X, Eye } from "lucide-react";

export default function PendingListings() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const { data: listings, isLoading, refetch } = api.admin.getPendingListings.useQuery();
    const approveMutation = api.admin.approveListing.useMutation();
    const rejectMutation = api.admin.rejectListing.useMutation();

    useEffect(() => {
        if (status === "loading") return;
        if (!session || session.user.role !== "ADMIN") {
            router.push("/");
        }
    }, [session, status, router]);

    const handleApprove = async (id: string) => {
        const toastId = toast.loading("Menyetujui listing...");
        try {
            await approveMutation.mutateAsync({ listing_id: id });
            toast.dismiss(toastId);
            toast.success("Listing berhasil disetujui!");
            refetch();
        } catch (error) {
            toast.dismiss(toastId);
            toast.error("Gagal menyetujui listing.");
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm("Yakin ingin menolak listing ini? Status akan kembali ke DRAFT.")) return;

        const toastId = toast.loading("Menolak listing...");
        try {
            await rejectMutation.mutateAsync({ listing_id: id });
            toast.dismiss(toastId);
            toast.success("Listing ditolak.");
            refetch();
        } catch (error) {
            toast.dismiss(toastId);
            toast.error("Gagal menolak listing.");
        }
    };

    if (status === "loading" || isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center flex-col gap-4">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-zinc-500 text-sm animate-pulse">Memuat antrian moderasi...</p>
            </div>
        );
    }

    if (!session || session.user.role !== "ADMIN") return null;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Moderasi Listing</h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                    Setujui atau tolak listing baru dari seller.
                </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-medium border-b border-zinc-200 dark:border-zinc-800">
                            <tr>
                                <th className="px-6 py-4">Listing</th>
                                <th className="px-6 py-4">Seller</th>
                                <th className="px-6 py-4">Harga</th>
                                <th className="px-6 py-4">Tanggal</th>
                                <th className="px-6 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {listings?.map((listing) => (
                                <tr key={listing.listing_id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-zinc-900 dark:text-white">{listing.title}</span>
                                            <span className="text-xs text-zinc-500">{listing.category.name} • {listing.listing_type}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={listing.seller.avatar_url ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${listing.seller.name}`}
                                                alt=""
                                                className="w-6 h-6 rounded-full"
                                            />
                                            <span className="text-zinc-700 dark:text-zinc-300">{listing.seller.name}</span>
                                        </div>
                                        <div className="text-xs text-zinc-500 mt-1">Rating: {listing.seller.rating.toFixed(1)}</div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-emerald-600">
                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(listing.price)}
                                    </td>
                                    <td className="px-6 py-4 text-zinc-500">
                                        {new Date(listing.created_at).toLocaleDateString("id-ID", {
                                            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                                        })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <Link
                                                href={`/listings/${listing.listing_id}`}
                                                target="_blank"
                                                className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                                title="Lihat Detail"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleReject(listing.listing_id)}
                                                disabled={rejectMutation.isPending}
                                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Tolak"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleApprove(listing.listing_id)}
                                                disabled={approveMutation.isPending}
                                                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                title="Setujui"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {(!listings || listings.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 mb-2">
                                                <Check className="w-6 h-6" />
                                            </div>
                                            <p className="font-medium text-zinc-900 dark:text-white">Semua beres!</p>
                                            <p className="text-sm text-zinc-500">Tidak ada listing yang menunggu moderasi.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
