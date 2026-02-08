"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import {
    Star,
    ShoppingCart,
    Receipt,
    Package,
    Check,
    AlertTriangle,
    Info,
    CreditCard,
    Send,
    X,
    ShieldAlert,
    CheckCircle,
    Zap,
    MessageSquare
} from "lucide-react";

export type TransactionStatus =
    | "INQUIRY"
    | "PENDING_PAYMENT"
    | "PAID"
    | "ITEM_SENT"
    | "VERIFIED"
    | "COMPLETED"
    | "DISPUTED"
    | "REFUNDED"
    | "CANCELLED";

export interface Message {
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    timestamp: Date;
    type: "text" | "system" | "action";
    attachmentUrl?: string;
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
    existingTransactionId?: string;
}

function mapBackendStatus(status: string): TransactionStatus {
    switch (status) {
        case "PENDING_PAYMENT": return "PENDING_PAYMENT";
        case "PAID": return "PAID";
        case "ITEM_TRANSFERRED": return "ITEM_SENT";
        case "COMPLETED": return "COMPLETED";
        case "CANCELLED": return "CANCELLED";
        case "DISPUTED": return "DISPUTED";
        case "REFUNDED": return "REFUNDED";
        case "VERIFIED": return "VERIFIED";
        default: return "INQUIRY";
    }
}

function ReviewSection({ transactionId, sellerName }: { transactionId: string; sellerName: string }) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [hoveredRating, setHoveredRating] = useState<number | null>(null);
    const [hasReviewed, setHasReviewed] = useState(false);

    const utils = api.useUtils();

    const { data: existingReview } = api.review.getByTransaction.useQuery(
        { transaction_id: transactionId },
        { enabled: !!transactionId }
    );

    const createReview = api.review.create.useMutation({
        onSuccess: () => {
            toast.success("Review berhasil dikirim!");
            setHasReviewed(true);
            utils.review.getByTransaction.invalidate();
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    if (hasReviewed || existingReview?.hasReviewed) {
        return (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-center">
                <Star className="w-8 h-8 text-amber-500 mx-auto mb-2" fill="currentColor" />
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                    Terima kasih atas review Anda!
                </p>
            </div>
        );
    }

    const displayRating = hoveredRating ?? rating;

    const handleSubmit = () => {
        if (comment.length > 0 && comment.length < 10) {
            toast.error("Komentar minimal 10 karakter");
            return;
        }
        createReview.mutate({
            transaction_id: transactionId,
            rating,
            comment: comment.length >= 10 ? comment : undefined,
        });
    };

    return (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 space-y-3">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400 text-center">
                Bagaimana pengalaman Anda dengan {sellerName}?
            </p>
            <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(null)}
                        className="p-0.5 transition-transform hover:scale-110"
                    >
                        <Star
                            className={`w-7 h-7 ${star <= displayRating ? "text-amber-400 fill-amber-400" : "text-zinc-300 dark:text-zinc-600"}`}
                        />
                    </button>
                ))}
            </div>
            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tulis komentar (opsional, min 10 karakter)..."
                className="w-full px-3 py-2 rounded-lg border border-amber-300 dark:border-amber-500/30 bg-white dark:bg-zinc-900 text-sm resize-none text-zinc-900 dark:text-white"
                rows={2}
                maxLength={500}
            />
            <Button
                size="sm"
                className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                onClick={handleSubmit}
                disabled={createReview.isPending}
            >
                {createReview.isPending ? "Mengirim..." : "Kirim Review"}
            </Button>
        </div>
    );
}

import { uiEvents } from "@/lib/ui-events";

export function TransactionChat(props: TransactionChatProps) {
    const { isOpen, onClose, listing, seller, existingTransactionId } = props;
    const { data: session } = useSession();
    const user = session?.user;

    useEffect(() => {
        uiEvents.setChatOpen(isOpen);
        return () => {
            // If unmounting and was open, we should explicitly close? 
            // Better to let the parent control or rely on isOpen changing to false.
            // But if component unmounts (e.g. navigation), we should reset.
            if (isOpen) uiEvents.setChatOpen(false);
        };
    }, [isOpen]);

    console.log("TransactionChat props.listing:", listing);


    const [transactionId, setTransactionId] = useState<string | null>(existingTransactionId || null);
    const [paymentId, setPaymentId] = useState<string | null>(null);
    const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
    const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>("INQUIRY");

    const [localMessages, setLocalMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [disputeReason, setDisputeReason] = useState("");
    const [showDisputeForm, setShowDisputeForm] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const isBuyer = user?.id !== seller.id;

    const { data: transactionData, refetch: refetchTransaction } = api.transaction.getById.useQuery(
        { transaction_id: transactionId! },
        {
            enabled: !!transactionId,
            refetchInterval: transactionStatus !== "COMPLETED" && transactionStatus !== "CANCELLED" ? 5000 : false,
        }
    );

    const { data: messagesData, refetch: refetchMessages } = api.message.getByTransaction.useQuery(
        { transaction_id: transactionId! },
        {
            enabled: !!transactionId,
            refetchInterval: 3000,
        }
    );

    const createTransaction = api.transaction.create.useMutation({
        onSuccess: (data) => {
            setTransactionId(data.transaction_id);
            setTransactionStatus("PENDING_PAYMENT");
            addSystemMessage(`Transaksi dibuat! ID: ${data.transaction_id.slice(0, 8)}...`);
            createPayment.mutate({ transaction_id: data.transaction_id });
        },
        onError: (error) => {
            if (error.message.toLowerCase().includes("reservasi")) {
                toast.error(error.message, { duration: 5000 });
            } else {
                toast.error(error.message);
            }
            setIsProcessing(false);
        },
    });

    const createPayment = api.payment.create.useMutation({
        onSuccess: (data) => {
            setPaymentId(data.payment_id);
            setInvoiceUrl(data.invoice_url);
            addSystemMessage(`Invoice dibuat: Rp ${data.amount.toLocaleString("id-ID")}. Silakan bayar.`);
            setIsProcessing(false);
        },
        onError: (error) => {
            toast.error(error.message);
            setIsProcessing(false);
        },
    });

    const simulatePayment = api.payment.simulateSuccess.useMutation({
        onSuccess: () => {
            toast.success("Pembayaran berhasil (simulasi)");
            setTransactionStatus("PAID");
            addSystemMessage("Pembayaran diterima! Dana masuk ke escrow.");
            refetchTransaction();
        },
        onError: (error) => toast.error(error.message),
    });

    const markTransferred = api.transaction.markTransferred.useMutation({
        onSuccess: () => {
            toast.success("Item ditandai sudah dikirim");
            setTransactionStatus("ITEM_SENT");
            addSystemMessage("Seller telah mengirim item. Buyer harap verifikasi.");
            refetchTransaction();
        },
        onError: (error) => toast.error(error.message),
    });

    const confirmReceived = api.transaction.confirmReceived.useMutation({
        onSuccess: () => {
            toast.success("Transaksi selesai!");
            setTransactionStatus("COMPLETED");
            addSystemMessage("Transaksi selesai! Dana dilepas ke seller.");
            refetchTransaction();
        },
        onError: (error) => toast.error(error.message),
    });

    const createDispute = api.dispute.create.useMutation({
        onSuccess: () => {
            toast.success("Dispute dibuat, admin akan meninjau");
            setTransactionStatus("DISPUTED");
            setShowDisputeForm(false);
            addSystemMessage("Dispute dibuat. Menunggu review admin.");
            refetchTransaction();
        },
        onError: (error) => toast.error(error.message),
    });

    const sendMessage = api.message.send.useMutation({
        onSuccess: () => {
            refetchMessages();
        },
        onError: (error) => toast.error(error.message),
    });

    const addSystemMessage = (content: string) => {
        const msg: Message = {
            id: `sys-${Date.now()}`,
            senderId: "system",
            senderName: "System",
            content,
            timestamp: new Date(),
            type: "system",
        };
        setLocalMessages((prev) => [...prev, msg]);
    };

    useEffect(() => {
        if (transactionData) {
            const backendStatus = mapBackendStatus(transactionData.status);
            if (backendStatus !== transactionStatus) {
                setTransactionStatus(backendStatus);
            }
            if (transactionData.payments?.[0]?.payment_id) {
                setPaymentId(transactionData.payments[0].payment_id);
            }
        }
    }, [transactionData]);

    useEffect(() => {
        if (messagesData?.messages) {
            const backendMessages: Message[] = messagesData.messages.map((msg) => ({
                id: msg.message_id,
                senderId: msg.sender_user_id,
                senderName: msg.sender?.name || "Unknown",
                content: msg.message_content,
                timestamp: new Date(msg.created_at),
                type: "text" as const,
                attachmentUrl: msg.attachment_url || undefined,
            }));
            setLocalMessages((prev) => {
                const systemMessages = prev.filter((m) => m.type === "system");
                return [...systemMessages, ...backendMessages].sort(
                    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
                );
            });
        }
    }, [messagesData]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [localMessages]);

    useEffect(() => {
        if (isOpen && props.action === "buy_now" && transactionStatus === "INQUIRY" && !isProcessing) {
            handleBuyNow();
            props.onActionHandled?.();
        }
    }, [isOpen, props.action, transactionStatus, isProcessing]);

    const handleBuyNow = async () => {
        if (!user) {
            toast.error("Silakan login terlebih dahulu");
            return;
        }
        setIsProcessing(true);
        addSystemMessage("Memproses pembelian...");
        createTransaction.mutate({
            listing_id: listing.id,
            payment_method: "VA",
        });
    };

    const handleSendMessage = () => {
        if (!inputValue.trim() || !transactionId) return;
        sendMessage.mutate({
            transaction_id: transactionId,
            content: inputValue.trim(),
        });
        setInputValue("");
    };

    const handleSimulatePayment = () => {
        if (!paymentId) return;
        simulatePayment.mutate({ payment_id: paymentId });
    };

    const handleSellerSendItem = () => {
        if (!transactionId) return;
        // TODO: In production, this should be a real uploaded screenshot URL
        // For now, using a placeholder that indicates seller confirmed transfer
        markTransferred.mutate({
            transaction_id: transactionId,
            transfer_proof_url: `https://placeholder.digisecond.com/transfer-proof/${transactionId}`,
        });
    };

    const handleBuyerConfirm = () => {
        if (!transactionId) return;
        confirmReceived.mutate({ transaction_id: transactionId });
    };

    const handleSubmitDispute = () => {
        if (!transactionId || disputeReason.length < 20) {
            toast.error("Alasan dispute minimal 20 karakter");
            return;
        }
        createDispute.mutate({
            transaction_id: transactionId,
            category: "OTHER",
            description: disputeReason,
        });
    };

    const getStatusColor = (status: TransactionStatus) => {
        switch (status) {
            case "INQUIRY": return "bg-zinc-500";
            case "PENDING_PAYMENT": return "bg-amber-500";
            case "PAID": return "bg-blue-500";
            case "ITEM_SENT": return "bg-purple-500";
            case "VERIFIED":
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
            case "PAID": return "Dana di Escrow";
            case "ITEM_SENT": return "Item Dikirim";
            case "VERIFIED": return "Diverifikasi";
            case "COMPLETED": return "Selesai";
            case "DISPUTED": return "Dispute";
            case "REFUNDED": return "Refunded";
            default: return status;
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 100 }}
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
                                        <h3 className="font-semibold text-zinc-900 dark:text-white">{seller.name}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full text-white ${getStatusColor(transactionStatus)}`}>
                                            {getStatusLabel(transactionStatus)}
                                        </span>
                                    </div>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                                    <X className="w-5 h-5 text-zinc-500" />
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
                                        <p className="text-xs text-brand-primary font-semibold">
                                            Rp {(transactionData?.transaction_amount ?? listing.price).toLocaleString("id-ID")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {localMessages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    className={`flex ${msg.type === "system" ? "justify-center" : msg.senderId === user?.id ? "justify-end" : "justify-start"}`}
                                >
                                    {msg.type === "system" ? (
                                        <div className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs text-zinc-500">
                                            {msg.content}
                                        </div>
                                    ) : (
                                        <div className={`max-w-[80%] px-4 py-2 rounded-2xl ${msg.senderId === user?.id ? "bg-brand-primary text-white rounded-br-md" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-bl-md"}`}>
                                            <p className="text-sm">{msg.content}</p>
                                            <p className={`text-[10px] mt-1 ${msg.senderId === user?.id ? "text-white/70" : "text-zinc-400"}`}>
                                                {msg.timestamp.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Actions */}
                        {
                            transactionStatus === "INQUIRY" && isBuyer && (
                                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                                    <Button className="w-full" onClick={handleBuyNow} disabled={isProcessing || createTransaction.isPending}>
                                        {isProcessing ? "Memproses..." : `Beli Sekarang - Rp ${listing.price.toLocaleString("id-ID")}`}
                                    </Button>
                                </div>
                            )
                        }

                        {
                            transactionStatus === "PENDING_PAYMENT" && isBuyer && (
                                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                                    <p className="text-sm text-zinc-500 text-center">Menunggu pembayaran...</p>
                                    {paymentId && invoiceUrl ? (
                                        <>
                                            {/* Info box */}
                                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                                                <p className="text-xs text-blue-600 dark:text-blue-400">
                                                    <Info className="w-4 h-4 inline mr-1" /> <strong>Test Mode:</strong> Anda akan diarahkan ke dashboard Xendit. Pilih metode pembayaran (BCA, QRIS, dll) dan klik tombol simulasi pembayaran di sana.
                                                </p>
                                            </div>

                                            {/* Primary: Open Xendit Dashboard */}
                                            <Button
                                                className="w-full bg-brand-primary hover:bg-brand-primary/90"
                                                onClick={() => window.open(invoiceUrl, '_blank')}
                                            >
                                                <CreditCard className="w-4 h-4 mr-2" /> Bayar Sekarang di Xendit
                                            </Button>

                                            {/* Secondary: Quick simulation for dev */}
                                            <Button
                                                className="w-full"
                                                variant="outline"
                                                onClick={handleSimulatePayment}
                                                disabled={simulatePayment.isPending}
                                            >
                                                {simulatePayment.isPending ? "Memproses..." : <><Zap className="w-4 h-4 mr-2" /> Simulasi Cepat (Dev)</>}
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            className="w-full"
                                            variant="outline"
                                            onClick={() => transactionId && createPayment.mutate({ transaction_id: transactionId })}
                                            disabled={createPayment.isPending}
                                        >
                                            {createPayment.isPending ? "Membuat Invoice..." : "Buat Invoice Pembayaran"}
                                        </Button>
                                    )}
                                </div>
                            )
                        }

                        {
                            transactionStatus === "PAID" && !isBuyer && (
                                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                                    <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={handleSellerSendItem} disabled={markTransferred.isPending}>
                                        {markTransferred.isPending ? "Memproses..." : "Tandai Sudah Dikirim"}
                                    </Button>
                                </div>
                            )
                        }

                        {
                            transactionStatus === "PAID" && isBuyer && (
                                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 text-center space-y-2">
                                    <p className="text-sm text-zinc-500">Menunggu penjual mengirim detail item...</p>
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 flex gap-2">
                                        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                        <p className="text-xs text-blue-600 dark:text-blue-400">
                                            <strong>Info Simulasi:</strong> Silakan login sebagai akun <strong>Penjual</strong> di browser/tab lain untuk memproses pesanan ini (Klik &quot;Tandai Sudah Dikirim&quot;).
                                        </p>
                                    </div>
                                </div>
                            )
                        }

                        {
                            transactionStatus === "ITEM_SENT" && isBuyer && (
                                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                                    <div className="flex gap-2">
                                        <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={handleBuyerConfirm} disabled={confirmReceived.isPending}>
                                            {confirmReceived.isPending ? "Memproses..." : "Konfirmasi Terima"}
                                        </Button>
                                        <Button variant="outline" className="border-red-300 text-red-600" onClick={() => setShowDisputeForm(true)}>
                                            Dispute
                                        </Button>
                                    </div>
                                </div>
                            )
                        }

                        {
                            showDisputeForm && (
                                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                                    <div className="space-y-3 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                                        <p className="text-sm font-medium text-red-700 dark:text-red-400">Jelaskan masalah yang Anda alami:</p>
                                        <textarea
                                            value={disputeReason}
                                            onChange={(e) => setDisputeReason(e.target.value)}
                                            placeholder="Minimal 20 karakter..."
                                            className="w-full px-3 py-2 rounded-lg border border-red-300 dark:border-red-500/30 bg-white dark:bg-zinc-900 text-sm resize-none"
                                            rows={3}
                                        />
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" onClick={() => setShowDisputeForm(false)} className="flex-1">Batal</Button>
                                            <Button size="sm" className="flex-1 bg-red-600 hover:bg-red-700" onClick={handleSubmitDispute} disabled={createDispute.isPending}>
                                                Kirim Dispute
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )
                        }

                        {
                            transactionStatus === "DISPUTED" && (
                                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                                        <p className="text-sm text-red-600 dark:text-red-400 text-center">Dispute sedang ditinjau oleh Admin</p>
                                    </div>
                                </div>
                            )
                        }

                        {
                            transactionStatus === "COMPLETED" && (
                                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
                                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-center">
                                        <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                                        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Transaksi Selesai!</p>
                                        <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">Dana telah dilepas ke seller</p>
                                    </div>
                                    {transactionId && isBuyer && (
                                        <ReviewSection transactionId={transactionId} sellerName={seller.name} />
                                    )}
                                </div>
                            )
                        }

                        {/* Chat Input */}
                        {
                            transactionId && !["DISPUTED", "COMPLETED", "CANCELLED"].includes(transactionStatus) && !showDisputeForm && (
                                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                                            placeholder="Ketik pesan..."
                                            className="flex-1 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm"
                                        />
                                        <Button size="icon" onClick={handleSendMessage} className="shrink-0" disabled={sendMessage.isPending}>
                                            <Send className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>
                            )
                        }
                    </motion.div >
                </>
            )
            }
        </AnimatePresence >
    );
}
