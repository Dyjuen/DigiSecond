"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "motion/react";
import { uiEvents } from "@/lib/ui-events";
import { TransactionChat, TransactionStatus } from "./TransactionChat";
import { usePathname } from "next/navigation";
import { api } from "@/trpc/react";

function formatRelativeTime(date: Date | string) {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        // Today: Show time HH:mm
        return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
        return "Kemarin";
    } else if (diffDays < 7) {
        // < 1 week: Show day name (Senin, Selasa...)
        return d.toLocaleDateString('id-ID', { weekday: 'long' });
    } else {
        // > 1 week: Show date
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    }
}

export function GlobalChatWidget() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [shouldHideFab, setShouldHideFab] = useState(false);

    // Fetch real chats
    const { data: chats, isLoading } = api.transaction.getChatList.useQuery(undefined, {
        enabled: !!session?.user,
        refetchInterval: 5000 // Poll every 5s for new messages
    });

    // Calculate total unread
    const totalUnread = chats?.reduce((acc, chat) => acc + chat.unread, 0) || 0;

    // Sync state with UI Events
    useEffect(() => {
        // When our own list or a specific chat is open, notify others
        const isChatActive = isOpen || !!activeChatId;
        uiEvents.setChatOpen(isChatActive);
    }, [isOpen, activeChatId]);

    // Handle initial subscription to avoid conflict if something else opened chat (rare here but good practice)
    useEffect(() => {
        const unsubscribe = uiEvents.subscribe((chatOpen) => {
            setShouldHideFab(chatOpen);
        });
        return () => { unsubscribe(); };
    }, []);


    // If not logged in, don't show widget
    if (!session?.user) return null;

    // Hide chat for admins or on admin pages
    if (session.user.role === "ADMIN" || pathname?.startsWith("/admin")) {
        return null;
    }

    const activeChat = chats?.find(c => c.id === activeChatId);

    return (
        <>
            {/* Floating Action Button */}
            <div
                className="fixed bottom-6 right-6 z-50 transition-transform duration-300 ease-in-out"
                style={{ transform: (shouldHideFab && !isOpen) ? "translateX(200%)" : "none" }}
            >
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

                    {/* Unread Badge */}
                    {!isOpen && totalUnread > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900">
                            {totalUnread > 9 ? "9+" : totalUnread}
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
                            {/* Maybe mark all read button in future */}
                        </div>

                        {/* Chat List */}
                        <div className="flex-1 overflow-y-auto">
                            {isLoading ? (
                                <div className="p-8 text-center text-zinc-500">
                                    <p>Memuat pesan...</p>
                                </div>
                            ) : chats?.length === 0 ? (
                                <div className="p-8 text-center text-zinc-500">
                                    <p>Belum ada pesan</p>
                                </div>
                            ) : (
                                chats?.map((chat) => (
                                    <div
                                        key={chat.id}
                                        onClick={() => setActiveChatId(chat.id)}
                                        className="p-4 border-b border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors relative"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="relative">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                                                    {(chat.partnerAvatar?.startsWith("http") || chat.partnerAvatar?.startsWith("/")) ? (
                                                        <img src={chat.partnerAvatar} alt={chat.partnerName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        chat.partnerName?.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() || "?"
                                                    )}
                                                </div>
                                                {/* Online Indicator - We don't have real online status yet */}
                                                {/* <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-zinc-900" /> */}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                                                        {chat.partnerName}
                                                    </p>
                                                    <span className="text-[10px] text-zinc-400">
                                                        {formatRelativeTime(chat.timestamp)}
                                                    </span>
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
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 bg-zinc-50 dark:bg-zinc-800 text-center text-xs text-zinc-500">
                            DigiSecond Secure Chat
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Individual Transaction Chat Modal */}
            {activeChat && (
                <TransactionChat
                    isOpen={!!activeChatId}
                    onClose={() => setActiveChatId(null)}
                    existingTransactionId={activeChat.id}
                    listing={{
                        id: activeChat.listingId,
                        title: activeChat.listingTitle,
                        price: 0, // Price isn't strictly needed for display here as TransactionChat fetches details
                        image: activeChat.listingImage
                    }}
                    seller={{
                        id: "partner-id", // TransactionChat will fetch real seller
                        name: activeChat.partnerName,
                        avatar: activeChat.partnerAvatar || ""
                    }}
                />
            )}
        </>
    );
}
