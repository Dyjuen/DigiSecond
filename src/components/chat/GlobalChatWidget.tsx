"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "motion/react";
import { TransactionChat, TransactionStatus } from "./TransactionChat";

// Mock Data for Global Chat List
interface ChatPreview {
    id: string;
    partnerName: string;
    partnerAvatar: string;
    lastMessage: string;
    timestamp: string;
    unread: number;
    listingTitle: string;
    listingImage: string;
    status: TransactionStatus;
}

const mockChats: ChatPreview[] = [
    {
        id: "chat-1",
        partnerName: "Fatih Ghaisan",
        partnerAvatar: "F",
        lastMessage: "Apakah akun ini masih tersedia?",
        timestamp: "10:30",
        unread: 2,
        listingTitle: "Akun Mobile Legends Sultan",
        listingImage: "M",
        status: "INQUIRY"
    },
    {
        id: "chat-2",
        partnerName: "Store Official",
        partnerAvatar: "S",
        lastMessage: "Pembayaran telah dikonfirmasi.",
        timestamp: "Kemarin",
        unread: 0,
        listingTitle: "Voucher Steam $100",
        listingImage: "S",
        status: "PAID"
    }
];

export function GlobalChatWidget() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);

    // If not logged in, don't show widget
    if (!session?.user) return null;

    const activeChat = mockChats.find(c => c.id === activeChatId);

    return (
        <>
            {/* Floating Action Button */}
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative w-14 h-14 bg-brand-primary text-white rounded-full shadow-xl hover:bg-brand-primary/90 hover:scale-105 transition-all flex items-center justify-center group"
                >
                    {isOpen ? (
                        <svg className="w-6 h-6 rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    )}

                    {/* Unread Badge (Mock) */}
                    {!isOpen && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900">
                            2
                        </span>
                    )}
                </button>
            </div>

            {/* Chat Popup Container */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-24 right-6 w-96 max-h-[600px] h-[70vh] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 z-50 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                            <h3 className="font-bold text-zinc-900 dark:text-white">Pesan Masuk</h3>
                            <button className="text-xs text-brand-primary font-medium hover:underline">
                                Tandai Dibaca
                            </button>
                        </div>

                        {/* Chat List */}
                        <div className="flex-1 overflow-y-auto">
                            {mockChats.map((chat) => (
                                <div
                                    key={chat.id}
                                    onClick={() => setActiveChatId(chat.id)}
                                    className="p-4 border-b border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors relative"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="relative">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                                                {(chat.partnerAvatar.startsWith("http") || chat.partnerAvatar.startsWith("/")) ? (
                                                    <img src={chat.partnerAvatar} alt={chat.partnerName} className="w-full h-full object-cover" />
                                                ) : (
                                                    chat.partnerName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
                                                )}
                                            </div>
                                            {/* Online Indicator */}
                                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-zinc-900" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                                                    {chat.partnerName}
                                                </p>
                                                <span className="text-[10px] text-zinc-400">{chat.timestamp}</span>
                                            </div>
                                            <p className="text-xs text-zinc-500 font-medium mb-1 truncate">
                                                {chat.listingTitle}
                                            </p>
                                            <p className={`text-sm truncate ${chat.unread > 0 ? "text-zinc-900 dark:text-white font-medium" : "text-zinc-500"}`}>
                                                {chat.lastMessage}
                                            </p>
                                        </div>
                                        {chat.unread > 0 && (
                                            <div className="bg-brand-primary w-2 h-2 rounded-full mt-2" />
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Empty State Mock */}
                            {mockChats.length === 0 && (
                                <div className="p-8 text-center text-zinc-500">
                                    <p>Belum ada pesan</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 bg-zinc-50 dark:bg-zinc-800 text-center text-xs text-zinc-500">
                            DigiSecond Secure Chat
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Individual Transaction Chat Modal (Re-using existing component) */}
            {activeChat && (
                <TransactionChat
                    isOpen={!!activeChatId}
                    onClose={() => setActiveChatId(null)}
                    listing={{
                        id: activeChat.id, // Using chat ID as listing ID for demo
                        title: activeChat.listingTitle,
                        price: 1500000,
                        image: activeChat.listingImage
                    }}
                    seller={{
                        id: "partner-id",
                        name: activeChat.partnerName,
                        avatar: activeChat.partnerAvatar
                    }}
                />
            )}
        </>
    );
}
