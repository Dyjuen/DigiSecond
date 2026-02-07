"use client";

import { api } from "@/trpc/react";
import { Badge } from "@/components/ui/badge";

const statusColors: Record<string, string> = {
    PENDING_PAYMENT: "bg-amber-500",
    PAID: "bg-blue-500",
    ITEM_SENT: "bg-purple-500",
    COMPLETED: "bg-emerald-500",
    CANCELLED: "bg-zinc-500",
    DISPUTED: "bg-red-500",
    REFUNDED: "bg-orange-500",
    VERIFIED: "bg-emerald-600",
};

export default function TransactionsPage() {
    const { data: transactions, isLoading } = api.admin.getTransactions.useQuery();

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Transactions</h1>
            <p className="text-zinc-600 dark:text-zinc-400">Monitor all marketplace transactions.</p>

            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Listing</th>
                                <th className="px-6 py-4">Buyer</th>
                                <th className="px-6 py-4">Seller</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-zinc-500">
                                        Loading transactions...
                                    </td>
                                </tr>
                            ) : transactions?.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-zinc-500">
                                        No transactions found
                                    </td>
                                </tr>
                            ) : (
                                transactions?.map((tx) => (
                                    <tr key={tx.transaction_id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                                        <td className="px-6 py-4 font-mono text-xs text-zinc-500">
                                            {tx.transaction_id.slice(0, 8)}...
                                        </td>
                                        <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">
                                            {tx.listing.title}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-zinc-900 dark:text-white font-medium">{tx.buyer.name}</span>
                                                <span className="text-xs text-zinc-500">{tx.buyer.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-zinc-900 dark:text-white font-medium">{tx.seller.name}</span>
                                                <span className="text-xs text-zinc-500">{tx.seller.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            Rp {tx.transaction_amount.toLocaleString("id-ID")}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge className={`${statusColors[tx.status] || "bg-zinc-500"} text-white border-0`}>
                                                {tx.status.replace("_", " ")}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-500">
                                            {new Date(tx.created_at).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit"
                                            })}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
