"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "@/trpc/react";
import Link from "next/link";
import { Eye, Trash2 } from "lucide-react";

export default function AllListings() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const { data: listings, isLoading } = api.admin.getAllListings.useQuery();

    useEffect(() => {
        if (status === "loading") return;
        if (!session || session.user.role !== "ADMIN") {
            router.push("/");
        }
    }, [session, status, router]);

    if (status === "loading" || isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center flex-col gap-4">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-zinc-500 text-sm animate-pulse">Memuat semua listing...</p>
            </div>
        );
    }

    if (!session || session.user.role !== "ADMIN") return null;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Semua Listing</h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                    Kelola seluruh listing yang ada di marketplace.
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
                                <th className="px-6 py-4">Status</th>
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
                                        <div className="flex flex-col">
                                            <span className="text-zinc-900 dark:text-white">{listing.seller.name}</span>
                                            <span className="text-xs text-zinc-500">{listing.seller.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">
                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(listing.price)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${listing.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                listing.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                    listing.status === 'SOLD' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                                        'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400'
                                            }`}>
                                            {listing.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-500">
                                        {new Date(listing.created_at).toLocaleDateString("id-ID", {
                                            day: "numeric", month: "short", year: "numeric"
                                        })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <Link
                                                href={`/listings/${listing.listing_id}`}
                                                target="_blank"
                                                className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                            {/* Delete button could go here in future */}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {(!listings || listings.length === 0) && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                                        Belum ada listing.
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
