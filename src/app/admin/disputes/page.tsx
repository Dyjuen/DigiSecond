"use client";

"use client";

import { api } from "@/trpc/react";
import { useState } from "react";

export default function DisputesPage() {
    const { data: disputes, isLoading, refetch } = api.admin.getDisputes.useQuery();
    const resolveDispute = api.admin.resolveDispute.useMutation({
        onSuccess: () => {
            refetch();
        }
    });

    const handleResolve = (disputeId: string) => {
        if (confirm("Are you sure you want to resolve this dispute (Full Refund)?")) {
            resolveDispute.mutate({
                dispute_id: disputeId,
                resolution: "FULL_REFUND",
                status: "RESOLVED"
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center flex-col gap-4">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-zinc-500 text-sm animate-pulse">Memuat data dispute...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Disputes</h1>
            <p className="text-zinc-600 dark:text-zinc-400">Manage buyer-seller disputes.</p>

            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                    Dispute ID
                                </th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                    Initiator
                                </th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                    Transaction
                                </th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {disputes?.map((dispute) => (
                                <tr key={dispute.dispute_id} className="hover:bg-zinc-50 dark:hover:bg-zinc-950">
                                    <td className="px-6 py-4 text-sm font-medium text-zinc-900 dark:text-white">
                                        #{dispute.dispute_id.slice(0, 8)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
                                                {dispute.initiator.avatar_url ? (
                                                    <img src={dispute.initiator.avatar_url} alt={dispute.initiator.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-xs text-zinc-500 font-medium">
                                                        {dispute.initiator.name.charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-sm text-zinc-600 dark:text-zinc-400">
                                                {dispute.initiator.name}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                                        <div>{dispute.transaction.listing.title}</div>
                                        <div className="text-xs text-zinc-500">IDR {dispute.transaction.transaction_amount.toLocaleString()}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${dispute.status === "OPEN" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
                                            dispute.status === "RESOLVED" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                                                "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                                            }`}>
                                            {dispute.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {dispute.status === "OPEN" && (
                                            <button
                                                onClick={() => handleResolve(dispute.dispute_id)}
                                                disabled={resolveDispute.isPending}
                                                className="text-sm font-medium text-brand-primary hover:text-brand-primary-dark disabled:opacity-50"
                                            >
                                                {resolveDispute.isPending ? "Resolving..." : "Resolve"}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {disputes?.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                        No active disputes found.
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
