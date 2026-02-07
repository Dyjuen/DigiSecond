"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { TransactionChat } from "@/components/chat/TransactionChat";

// Status badge colors
const statusColors: Record<string, string> = {
    PENDING: "bg-amber-500",
    PAID: "bg-blue-500",
    TRANSFERRED: "bg-purple-500",
    COMPLETED: "bg-emerald-500",
    CANCELLED: "bg-zinc-500",
    DISPUTED: "bg-red-500",
    REFUNDED: "bg-orange-500",
};

const statusLabels: Record<string, string> = {
    PENDING: "Menunggu Pembayaran",
    PAID: "Dibayar - Escrow",
    TRANSFERRED: "Item Dikirim",
    COMPLETED: "Selesai",
    CANCELLED: "Dibatalkan",
    DISPUTED: "Dispute",
    REFUNDED: "Dikembalikan",
};

export default function TransactionsPage() {
    const router = useRouter();
    const { data: session, status: sessionStatus } = useSession();
    const [activeTab, setActiveTab] = useState<"buyer" | "seller">("buyer");
    const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
    const [showChat, setShowChat] = useState(false);

    // Redirect if not authenticated
    if (sessionStatus === "unauthenticated") {
        router.push("/login?callbackUrl=/transactions");
        return null;
    }

    // Fetch transactions as buyer
    const { data: buyerTransactions, isLoading: loadingBuyer } = api.transaction.getActive.useQuery(
        { role: "buyer", limit: 50 },
        {
            enabled: sessionStatus === "authenticated",
            refetchInterval: 3000
        }
    );

    // Fetch transactions as seller
    const { data: sellerTransactions, isLoading: loadingSeller } = api.transaction.getActive.useQuery(
        { role: "seller", limit: 50 },
        {
            enabled: sessionStatus === "authenticated",
            refetchInterval: 3000
        }
    );

    const transactions = activeTab === "buyer"
        ? buyerTransactions?.transactions || []
        : sellerTransactions?.transactions || [];

    const isLoading = activeTab === "buyer" ? loadingBuyer : loadingSeller;

    const handleOpenChat = (tx: any) => {
        setSelectedTransaction(tx);
        setShowChat(true);
    };

    if (sessionStatus === "loading") {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-black pt-24 pb-16 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
                        Transaksi Saya
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400">
                        Kelola semua transaksi pembelian dan penjualan Anda
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl mb-6 w-fit">
                    <button
                        onClick={() => setActiveTab("buyer")}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === "buyer"
                            ? "bg-white dark:bg-zinc-800 text-brand-primary shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700"
                            : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                            }`}
                    >
                        Pembelian
                        {buyerTransactions?.transactions.length ? (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-brand-primary/10 text-brand-primary rounded-full">
                                {buyerTransactions.transactions.length}
                            </span>
                        ) : null}
                    </button>
                    <button
                        onClick={() => setActiveTab("seller")}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === "seller"
                            ? "bg-white dark:bg-zinc-800 text-brand-primary shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700"
                            : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                            }`}
                    >
                        Penjualan
                        {sellerTransactions?.transactions.length ? (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-brand-primary/10 text-brand-primary rounded-full">
                                {sellerTransactions.transactions.length}
                            </span>
                        ) : null}
                    </button>
                </div>

                {/* Transaction List */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                        <span className="text-4xl block mb-4">📦</span>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                            Belum ada transaksi
                        </h3>
                        <p className="text-zinc-500 mb-6">
                            {activeTab === "buyer"
                                ? "Anda belum melakukan pembelian apapun"
                                : "Anda belum memiliki penjualan"}
                        </p>
                        <Link
                            href="/listings"
                            className="inline-block px-6 py-2 bg-brand-primary text-white rounded-xl font-medium hover:bg-brand-primary-dark transition-colors"
                        >
                            {activeTab === "buyer" ? "Mulai Belanja" : "Jual Sekarang"}
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {transactions.map((tx: any) => (
                            <div
                                key={tx.transaction_id}
                                className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 hover:border-brand-primary/50 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    {/* Left: Listing Info */}
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="w-16 h-16 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                                            <span className="text-2xl">🎮</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-zinc-900 dark:text-white line-clamp-1">
                                                {tx.listing?.title || "Listing Dihapus"}
                                            </h3>
                                            <p className="text-sm text-zinc-500 mt-1">
                                                {activeTab === "buyer"
                                                    ? `Penjual: ${tx.seller?.name || "Unknown"}`
                                                    : `Pembeli: ${tx.buyer?.name || "Unknown"}`
                                                }
                                            </p>
                                            <p className="text-lg font-bold text-brand-primary mt-2">
                                                Rp {tx.transaction_amount?.toLocaleString("id-ID")}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right: Status & Actions */}
                                    <div className="flex flex-col items-end gap-3">
                                        <Badge className={`${statusColors[tx.status] || "bg-zinc-500"} text-white`}>
                                            {statusLabels[tx.status] || tx.status}
                                        </Badge>
                                        <p className="text-xs text-zinc-400">
                                            {new Date(tx.created_at).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </p>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleOpenChat(tx)}
                                            className="text-xs"
                                        >
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                            Buka Chat
                                        </Button>
                                    </div>
                                </div>

                                {/* Progress indicator for active transactions */}
                                {["PENDING", "PAID", "TRANSFERRED"].includes(tx.status) && (
                                    <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                        <div className="flex items-center gap-2">
                                            {["PENDING", "PAID", "TRANSFERRED", "COMPLETED"].map((step, idx) => (
                                                <div key={step} className="flex items-center flex-1">
                                                    <div
                                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${["PENDING", "PAID", "TRANSFERRED", "COMPLETED"].indexOf(tx.status) >= idx
                                                            ? "bg-brand-primary text-white"
                                                            : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500"
                                                            }`}
                                                    >
                                                        {idx + 1}
                                                    </div>
                                                    {idx < 3 && (
                                                        <div
                                                            className={`flex-1 h-1 mx-1 rounded-full ${["PENDING", "PAID", "TRANSFERRED", "COMPLETED"].indexOf(tx.status) > idx
                                                                ? "bg-brand-primary"
                                                                : "bg-zinc-200 dark:bg-zinc-700"
                                                                }`}
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between text-xs text-zinc-500 mt-2">
                                            <span>Bayar</span>
                                            <span>Escrow</span>
                                            <span>Kirim</span>
                                            <span>Selesai</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Transaction Chat Modal */}
            {selectedTransaction && (
                <TransactionChat
                    isOpen={showChat}
                    onClose={() => {
                        setShowChat(false);
                        setSelectedTransaction(null);
                    }}
                    listing={{
                        id: selectedTransaction.listing?.listing_id || "",
                        title: selectedTransaction.listing?.title || "Unknown",
                        price: selectedTransaction.transaction_amount || 0,
                        image: "🎮",
                    }}
                    seller={{
                        id: selectedTransaction.seller?.user_id || "",
                        name: selectedTransaction.seller?.name || "Unknown",
                        avatar: selectedTransaction.seller?.avatar_url || "",
                    }}
                    existingTransactionId={selectedTransaction.transaction_id}
                />
            )}
        </div>
    );
}
