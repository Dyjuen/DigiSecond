"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";

// Transaction status types
export type TransactionStatus =
    | "INQUIRY"           // Chat awal sebelum beli
    | "PENDING_PAYMENT"   // Menunggu buyer bayar
    | "PAID"              // Escrow menahan dana
    | "ITEM_SENT"         // Seller sudah kirim akun
    | "VERIFIED"          // Buyer konfirmasi terima
    | "COMPLETED"         // Dana dilepas ke seller
    | "DISPUTED"          // Ada masalah, eskalasi admin
    | "REFUNDED";         // Dana dikembalikan ke buyer

export interface Message {
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    timestamp: Date;
    type: "text" | "system" | "action";
}

export interface TransactionChatProps {
    isOpen: boolean;
    onClose: () => void;
    listing: {
        id: string;
        title: string;
        price: number;
        image: string;
    };
    seller: {
        id: string;
        name: string;
        avatar: string;
    };
    action?: "buy_now" | null;
    onActionHandled?: () => void;
}

// Dummy messages for demo
const generateDummyMessages = (listingTitle: string, sellerName: string): Message[] => [
    {
        id: "sys-1",
        senderId: "system",
        senderName: "System",
        content: `Chat dimulai untuk: ${listingTitle}`,
        timestamp: new Date(Date.now() - 300000),
        type: "system",
    },
];

export function TransactionChat(props: TransactionChatProps) {
    const { isOpen, onClose, listing, seller } = props;
    const { data: session } = useSession();
    const user = session?.user;
    const [messages, setMessages] = useState<Message[]>(() => generateDummyMessages(listing.title, seller.name));
    const [inputValue, setInputValue] = useState("");
    const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>("INQUIRY");
    const [isProcessing, setIsProcessing] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Handle external actions (e.g. Buy Now from listing page)
    useEffect(() => {
        if (isOpen && props.action === "buy_now" && transactionStatus === "INQUIRY" && !isProcessing) {
            handleBuyNow();
            props.onActionHandled?.();
        }
    }, [isOpen, props.action, transactionStatus, isProcessing]);

    const addMessage = (content: string, type: "text" | "system" | "action" = "text", senderOverride?: { id: string; name: string }) => {
        const sender = senderOverride || { id: user?.id || "buyer", name: user?.name || "Anda" };
        const newMessage: Message = {
            id: `msg-${Date.now()}`,
            senderId: sender.id,
            senderName: sender.name,
            content,
            timestamp: new Date(),
            type,
        };
        setMessages((prev) => [...prev, newMessage]);
    };

    const addSystemMessage = (content: string) => {
        addMessage(content, "system", { id: "system", name: "System" });
    };

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;
        addMessage(inputValue);
        setInputValue("");

        // Simulate seller reply after 1.5s
        setTimeout(() => {
            const replies = [
                "Oke kak, ada yang mau ditanyakan lagi?",
                "Siap kak, silahkan cek detail-nya ya",
                "Terima kasih kak, ditunggu ordernya 🙏",
            ];
            addMessage(replies[Math.floor(Math.random() * replies.length)], "text", { id: seller.id, name: seller.name });
        }, 1500);
    };

    const handleBuyNow = async () => {
        if (!user) return;
        setIsProcessing(true);

        addSystemMessage("Buyer memulai proses pembelian...");
        await new Promise((r) => setTimeout(r, 1000));

        setTransactionStatus("PENDING_PAYMENT");
        addSystemMessage(`Invoice dibuat: Rp ${listing.price.toLocaleString("id-ID")}. Menunggu pembayaran...`);

        // Simulate payment after 2s
        await new Promise((r) => setTimeout(r, 2000));

        setTransactionStatus("PAID");
        addSystemMessage("✅ Pembayaran berhasil! Dana ditahan oleh Escrow.");
        addSystemMessage(`${seller.name}, silahkan kirim akun ke buyer.`);

        setIsProcessing(false);
    };

    const handleSellerSendItem = async () => {
        setIsProcessing(true);

        addMessage("Kak, ini detail akunnya sudah saya kirim ya:", "text", { id: seller.id, name: seller.name });
        await new Promise((r) => setTimeout(r, 500));
        addMessage("Email: akun***@gmail.com\nPassword: ******\nKode Backup: ****", "text", { id: seller.id, name: seller.name });

        setTransactionStatus("ITEM_SENT");
        addSystemMessage("📦 Seller menandai akun sudah dikirim. Buyer punya waktu 24 jam untuk verifikasi.");

        setIsProcessing(false);
    };

    const handleBuyerConfirm = async () => {
        setIsProcessing(true);

        addSystemMessage("Buyer mengkonfirmasi penerimaan akun...");
        await new Promise((r) => setTimeout(r, 1000));

        setTransactionStatus("COMPLETED");
        addSystemMessage("🎉 Transaksi selesai! Dana telah dilepas ke seller.");
        addMessage("Terima kasih kak! Semoga puas dengan akunnya 🙏", "text", { id: seller.id, name: seller.name });

        setIsProcessing(false);
    };

    const handleOpenDispute = async () => {
        setIsProcessing(true);

        addSystemMessage("⚠️ Buyer membuka dispute. Admin akan meninjau kasus ini.");
        await new Promise((r) => setTimeout(r, 500));

        setTransactionStatus("DISPUTED");
        addSystemMessage("Dispute telah diajukan. Tim admin akan merespons dalam 1x24 jam.");

        setIsProcessing(false);
    };

    const getStatusColor = (status: TransactionStatus) => {
        switch (status) {
            case "INQUIRY": return "bg-zinc-500";
            case "PENDING_PAYMENT": return "bg-amber-500";
            case "PAID": return "bg-blue-500";
            case "ITEM_SENT": return "bg-purple-500";
            case "VERIFIED": return "bg-teal-500";
            case "COMPLETED": return "bg-emerald-500";
            case "DISPUTED": return "bg-red-500";
            case "REFUNDED": return "bg-orange-500";
            default: return "bg-zinc-500";
        }
    };

    const getStatusLabel = (status: TransactionStatus) => {
        switch (status) {
            case "INQUIRY": return "Chat";
            case "PENDING_PAYMENT": return "Menunggu Pembayaran";
            case "PAID": return "Dibayar - Escrow";
            case "ITEM_SENT": return "Akun Dikirim";
            case "VERIFIED": return "Diverifikasi";
            case "COMPLETED": return "Selesai";
            case "DISPUTED": return "Dispute";
            case "REFUNDED": return "Dikembalikan";
            default: return status;
        }
    };

    const isBuyer = user?.role === "BUYER" || user?.role === "ADMIN";
    const isSeller = user?.role === "SELLER" || user?.role === "ADMIN";

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                        onClick={onClose}
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-zinc-900 shadow-2xl z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-purple-600 flex items-center justify-center text-white font-bold overflow-hidden relative">
                                        {(seller.avatar.startsWith("http") || seller.avatar.startsWith("/")) ? (
                                            <Image
                                                src={seller.avatar}
                                                alt={seller.name}
                                                className="object-cover"
                                                fill
                                                unoptimized
                                            />
                                        ) : (
                                            seller.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-zinc-900 dark:text-white">{seller.name}</p>
                                        <p className="text-xs text-emerald-500">Online</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Transaction Status Banner */}
                            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl flex items-center justify-center w-8 h-8 overflow-hidden rounded-md relative">
                                        {(listing.image.startsWith("http") || listing.image.startsWith("/")) ? (
                                            <Image
                                                src={listing.image}
                                                alt={listing.title}
                                                className="object-cover"
                                                fill
                                                unoptimized
                                            />
                                        ) : (
                                            listing.image
                                        )}
                                    </span>
                                    <div>
                                        <p className="text-sm font-medium text-zinc-900 dark:text-white line-clamp-1">{listing.title}</p>
                                        <p className="text-xs text-brand-primary font-semibold">Rp {listing.price.toLocaleString("id-ID")}</p>
                                    </div>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full text-white font-medium ${getStatusColor(transactionStatus)}`}>
                                    {getStatusLabel(transactionStatus)}
                                </span>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 dark:bg-zinc-950">
                            {messages.map((msg) => {
                                if (msg.type === "system") {
                                    return (
                                        <div key={msg.id} className="text-center">
                                            <span className="text-xs text-zinc-500 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-full inline-block">
                                                {msg.content}
                                            </span>
                                        </div>
                                    );
                                }

                                const isOwn = msg.senderId === user?.id || (msg.senderId === "buyer" && isBuyer);
                                return (
                                    <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                                        <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${isOwn
                                            ? "bg-brand-primary text-white rounded-br-md"
                                            : "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-bl-md shadow-sm"
                                            }`}>
                                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                            <p className={`text-xs mt-1 ${isOwn ? "text-white/70" : "text-zinc-400"}`}>
                                                {msg.timestamp.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Action Buttons based on status */}
                        {transactionStatus !== "COMPLETED" && transactionStatus !== "REFUNDED" && (
                            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                                {/* Transaction Actions */}
                                {transactionStatus === "INQUIRY" && isBuyer && (
                                    <Button
                                        className="w-full"
                                        onClick={handleBuyNow}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? "Memproses..." : "Beli Sekarang"}
                                    </Button>
                                )}

                                {transactionStatus === "PAID" && isSeller && (
                                    <Button
                                        className="w-full bg-purple-600 hover:bg-purple-700"
                                        onClick={handleSellerSendItem}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? "Mengirim..." : "📦 Kirim Akun ke Buyer"}
                                    </Button>
                                )}

                                {transactionStatus === "ITEM_SENT" && isBuyer && (
                                    <div className="space-y-2">
                                        <Button
                                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                                            onClick={handleBuyerConfirm}
                                            disabled={isProcessing}
                                        >
                                            {isProcessing ? "Mengkonfirmasi..." : "✅ Konfirmasi Terima"}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                                            onClick={handleOpenDispute}
                                            disabled={isProcessing}
                                        >
                                            ⚠️ Buka Dispute
                                        </Button>
                                    </div>
                                )}

                                {transactionStatus === "DISPUTED" && (
                                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                                        <p className="text-sm text-red-600 dark:text-red-400 text-center">
                                            Dispute sedang ditinjau oleh Admin
                                        </p>
                                    </div>
                                )}

                                {/* Chat Input */}
                                {transactionStatus !== "DISPUTED" && (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                                            placeholder="Ketik pesan..."
                                            className="flex-1 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm"
                                        />
                                        <Button size="icon" onClick={handleSendMessage} className="shrink-0">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Completed State */}
                        {transactionStatus === "COMPLETED" && (
                            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-center">
                                    <span className="text-3xl mb-2 block">🎉</span>
                                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                                        Transaksi Selesai!
                                    </p>
                                    <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">
                                        Dana telah dilepas ke seller
                                    </p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
