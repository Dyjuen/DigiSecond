"use client";

import { api } from "@/trpc/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "motion/react";

export default function DisputesPage() {
    const [selectedDispute, setSelectedDispute] = useState<any>(null);
    const { data: disputes, isLoading, refetch } = api.admin.getDisputes.useQuery();

    const { data: chatMessages, isLoading: loadingChat } = api.admin.getChatMessages.useQuery(
        { transaction_id: selectedDispute?.transaction?.transaction_id },
        { enabled: !!selectedDispute }
    );

    const [confirmation, setConfirmation] = useState<{ action: "FULL_REFUND" | "NO_REFUND", isOpen: boolean } | null>(null);

    const resolveDispute = api.admin.resolveDispute.useMutation({
        onSuccess: () => {
            // alert("Dispute resolved successfully"); // Removed alert
            setSelectedDispute(null);
            setConfirmation(null);
            refetch();
        },
        onError: (err) => {
            // alert(err.message); // Removed alert, can add toast later if needed
        }
    });

    const handleResolve = (resolution: "FULL_REFUND" | "NO_REFUND") => {
        setConfirmation({ action: resolution, isOpen: true });
    };

    const executeResolve = () => {
        if (!selectedDispute || !confirmation) return;
        resolveDispute.mutate({
            dispute_id: selectedDispute.dispute_id,
            resolution: confirmation.action
        });
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
                                                {(dispute.initiator.avatar_url && dispute.initiator.avatar_url.startsWith("http")) ? (
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
                                        <Badge variant={dispute.status === "OPEN" ? "warning" : "outline"}>
                                            {dispute.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setSelectedDispute(dispute)}
                                        >
                                            {dispute.status === "OPEN" ? "Review & Resolve" : "View Details"}
                                        </Button>
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

            {/* Custom Modal using framer-motion */}
            <AnimatePresence>
                {selectedDispute && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setSelectedDispute(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-5xl h-[85vh] bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-zinc-200 dark:border-zinc-800"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-950 shrink-0">
                                <div>
                                    <h2 className="text-xl font-bold flex items-center gap-3">
                                        Resolve Dispute #{selectedDispute.dispute_id.slice(0, 8)}
                                        <Badge variant="outline" className="text-xs">{selectedDispute.status}</Badge>
                                    </h2>
                                    <p className="text-sm text-zinc-500 mt-1">Transaction ID: {selectedDispute.transaction.transaction_id}</p>
                                </div>
                                <button onClick={() => setSelectedDispute(null)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Body - Two Column Layout on Desktop */}
                            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                                {/* Left Panel: Context & Details */}
                                <div className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 overflow-y-auto p-6 space-y-6">

                                    {/* Item Details */}
                                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                        <h3 className="font-semibold text-sm mb-4 text-zinc-900 dark:text-white uppercase tracking-wider text-xs">Transaction Details</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <span className="text-zinc-500 text-xs uppercase tracking-wide block mb-1">Item Name</span>
                                                <span className="font-medium text-zinc-900 dark:text-white block">{selectedDispute.transaction.listing.title}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <span className="text-zinc-500 text-xs uppercase tracking-wide block mb-1">Total Amount</span>
                                                    <span className="font-mono font-medium text-brand-primary dark:text-brand-primary-light">
                                                        Rp {selectedDispute.transaction.transaction_amount.toLocaleString()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-zinc-500 text-xs uppercase tracking-wide block mb-1">Date</span>
                                                    <span className="text-zinc-700 dark:text-zinc-300">
                                                        {new Date(selectedDispute.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Participants */}
                                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                        <h3 className="font-semibold text-sm mb-4 text-zinc-900 dark:text-white uppercase tracking-wider text-xs">Participants</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-sm border border-blue-200 dark:border-blue-800">B</div>
                                                <div>
                                                    <div className="font-medium text-sm text-zinc-900 dark:text-white">{selectedDispute.transaction.buyer.name}</div>
                                                    <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">Buyer (Initiator)</div>
                                                </div>
                                            </div>
                                            <div className="h-px bg-zinc-100 dark:bg-zinc-800 w-full" />
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm border border-emerald-200 dark:border-emerald-800">S</div>
                                                <div>
                                                    <div className="font-medium text-sm text-zinc-900 dark:text-white">{selectedDispute.transaction.seller.name}</div>
                                                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Seller</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Panel: Chat History */}
                                <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-zinc-950 relative">
                                    <div className="px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 backend-blur-sm sticky top-0 z-10 flex justify-between items-center">
                                        <span className="font-medium text-sm text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                                            <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                            Chat History
                                        </span>
                                        <span className="text-xs text-zinc-400">
                                            {chatMessages?.length || 0} messages
                                        </span>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-dots-pattern">
                                        {loadingChat ? (
                                            <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-3">
                                                <div className="w-8 h-8 border-4 border-zinc-300 border-t-brand-primary rounded-full animate-spin"></div>
                                                <span className="text-sm font-medium animate-pulse">Retreiving conversation...</span>
                                            </div>
                                        ) : chatMessages?.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-zinc-400 gap-2">
                                                <svg className="w-12 h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                                <span className="text-sm">No messages found in this transaction.</span>
                                            </div>
                                        ) : (
                                            chatMessages?.map((msg: any) => (
                                                <div key={msg.message_id} className={`flex flex-col ${msg.sender.role === 'buyer' ? 'items-start' : 'items-end'}`}>
                                                    <div className={`px-5 py-3.5 rounded-2xl max-w-[85%] text-sm shadow-sm relative group transition-all hover:shadow-md ${msg.sender.role === 'buyer'
                                                        ? 'bg-blue-50 text-blue-900 dark:bg-blue-500/10 dark:text-blue-100 rounded-tl-none border border-blue-100 dark:border-blue-500/20'
                                                        : 'bg-emerald-50 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-100 rounded-tr-none border border-emerald-100 dark:border-emerald-500/20'
                                                        }`}>
                                                        <p className={`text-[10px] font-bold mb-1.5 uppercase tracking-wider flex items-center justify-between gap-3 border-b pb-1 mb-2 ${msg.sender.role === 'buyer' ? 'border-blue-200 dark:border-blue-800' : 'border-emerald-200 dark:border-emerald-800'}`}>
                                                            <span>{msg.sender.name}</span>
                                                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${msg.sender.role === 'buyer' ? 'bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200' : 'bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'}`}>
                                                                {msg.sender.role}
                                                            </span>
                                                        </p>
                                                        <p className="leading-relaxed whitespace-pre-wrap text-[13px] md:text-sm">{msg.message_content}</p>

                                                        <div className="absolute top-0 bottom-0 -right-12 group-hover:right-full group-hover:translate-x-full transition-all duration-300 opacity-0 group-hover:opacity-100 flex items-center px-2">
                                                            <span className="text-[10px] text-zinc-400 whitespace-nowrap">
                                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] text-zinc-400 mt-1.5 px-2 select-none opacity-60">
                                                        {new Date(msg.created_at).toLocaleString("id-ID", { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            {selectedDispute.status === "OPEN" && (
                                <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex flex-col sm:flex-row gap-4 justify-end items-center shrink-0">
                                    <div className="text-zinc-500 text-sm mr-auto hidden sm:block">
                                        Make a final decision based on the evidence and chat history.
                                    </div>
                                    <Button variant="ghost" onClick={() => setSelectedDispute(null)}>Cancel</Button>
                                    <Button
                                        className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20"
                                        onClick={() => handleResolve("FULL_REFUND")}
                                        disabled={resolveDispute.isPending}
                                    >
                                        Refund Buyer (100%)
                                    </Button>
                                    <Button
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
                                        onClick={() => handleResolve("NO_REFUND")}
                                        disabled={resolveDispute.isPending}
                                    >
                                        Release to Seller
                                    </Button>
                                </div>
                            )}
                            {selectedDispute.status !== "OPEN" && (
                                <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-end shrink-0 bg-zinc-50 dark:bg-zinc-900/50">
                                    <Button variant="outline" onClick={() => setSelectedDispute(null)}>Close Viewer</Button>
                                </div>
                            )}

                            {/* Confirmation Nested Modal */}
                            <AnimatePresence>
                                {confirmation && (
                                    <div className="absolute inset-0 z-[150] flex items-center justify-center p-6">
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                                            onClick={() => setConfirmation(null)}
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                            className="relative w-full max-w-sm bg-white dark:bg-zinc-950 rounded-xl shadow-2xl p-6 border border-zinc-200 dark:border-zinc-800 z-[160]"
                                        >
                                            <h3 className="text-lg font-bold mb-2 text-zinc-900 dark:text-white">Confirm Resolution</h3>
                                            <p className="text-zinc-500 text-sm mb-6">
                                                Are you sure you want to resolve this dispute with
                                                <span className={`font-bold mx-1 ${confirmation.action === "FULL_REFUND" ? "text-red-600" : "text-emerald-600"}`}>
                                                    {confirmation.action === "FULL_REFUND" ? "FULL REFUND" : "RELEASE TO SELLER"}
                                                </span>?
                                                This action cannot be undone.
                                            </p>
                                            <div className="flex justify-end gap-3">
                                                <Button variant="ghost" onClick={() => setConfirmation(null)}>Cancel</Button>
                                                <Button
                                                    className={confirmation.action === "FULL_REFUND" ? "bg-red-600 hover:bg-red-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"}
                                                    onClick={executeResolve}
                                                    disabled={resolveDispute.isPending}
                                                >
                                                    {resolveDispute.isPending ? "Processing..." : "Confirm"}
                                                </Button>
                                            </div>
                                        </motion.div>
                                    </div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
