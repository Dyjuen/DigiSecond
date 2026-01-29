"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { TransactionChat } from "@/components/chat/TransactionChat";
import { Countdown } from "@/components/ui/countdown";

// Game Logos
import mobileLegendsLogo from "@/assets/images/Mobile-legends-logo.svg.png";
import genshinLogo from "@/assets/images/Genshin_Impact_logo.svg.png";
import valorantLogo from "@/assets/images/Valorant_logo_-_pink_color_version.svg.png";
import pubgLogo from "@/assets/images/PUBG_Corporation_Logo.svg.png";

import { api } from "@/trpc/react";



// Logo map for games
const gameLogoMap: Record<string, any> = {
    "Mobile Legends": mobileLegendsLogo,
    "Genshin Impact": genshinLogo,
    "Valorant": valorantLogo,
    "PUBG Mobile": pubgLogo,
};

export default function ListingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [showChatModal, setShowChatModal] = useState(false);
    const [chatAction, setChatAction] = useState<"buy_now" | null>(null);
    const [bidAmount, setBidAmount] = useState("");
    const [isBidding, setIsBidding] = useState(false);

    const listingId = params.id as string;

    const { data: listing, isLoading } = api.listing.getById.useQuery({ id: listingId });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-black pt-24 pb-16 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-zinc-500">Memuat listing...</p>
                </div>
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-black pt-24 pb-16 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Listing Tidak Ditemukan</h1>
                    <p className="text-zinc-500 mb-6">Listing yang Anda cari mungkin sudah dihapus atau tidak tersedia.</p>
                    <Link href="/listings" className="px-6 py-3 bg-brand-primary text-white rounded-xl font-medium hover:bg-brand-primary-dark transition-colors">
                        Kembali ke Marketplace
                    </Link>
                </div>
            </div>
        );
    }

    const handleChat = () => {
        if (!session?.user) {
            router.push("/login");
            return;
        }
        setShowChatModal(true);
    };

    const handleBuy = () => {
        if (!session?.user) {
            router.push("/login");
            return;
        }
        setChatAction("buy_now");
        setShowChatModal(true);
    };

    const handlePlaceBid = () => {
        if (!session?.user) {
            router.push("/login");
            return;
        }
        setIsBidding(true);
        // Simulate API call
        setTimeout(() => {
            setIsBidding(false);
            setBidAmount("");
            alert("Penawaran Anda berhasil dikirim!");
            // In real app, this would update the bid list via mutation
        }, 1000);
    };

    const isAuction = listing.listing_type === "AUCTION";
    const gameLogo = gameLogoMap[listing.game];
    const isOwner = session?.user?.id === listing.seller.user_id;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black pt-24 pb-16">
            <div className="max-w-6xl mx-auto px-6">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-zinc-500 mb-6">
                    <Link href="/listings" className="hover:text-brand-primary transition-colors">
                        Marketplace
                    </Link>
                    <span>/</span>
                    <Link href={`/listings?category=${listing.category.slug}`} className="hover:text-brand-primary transition-colors">
                        {listing.game}
                    </Link>
                    <span>/</span>
                    <span className="text-zinc-700 dark:text-zinc-300 line-clamp-1">{listing.title}</span>
                </nav>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Image Gallery */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden relative">
                            {/* Auction Badge */}
                            {isAuction && (
                                <div className="absolute top-4 right-4 z-10">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-violet-600 blur-lg opacity-40"></div>
                                        <div className="relative bg-black/40 backdrop-blur-xl border border-violet-500/30 text-white px-4 py-1.5 rounded-full font-bold shadow-2xl flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
                                            LIVE AUCTION
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Main Image - Game Logo */}
                            <div className="h-64 md:h-80 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                {gameLogo ? (
                                    <div className="relative w-40 h-40">
                                        <Image
                                            src={gameLogo}
                                            alt={listing.game}
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-32 h-32 rounded-3xl bg-brand-primary/10 flex items-center justify-center text-brand-primary text-5xl font-bold">
                                        {listing.game.charAt(0)}
                                    </div>
                                )}
                            </div>
                            {/* Game Category Thumbnails */}
                            <div className="p-4 flex gap-2 overflow-x-auto">
                                <div className="w-16 h-16 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0 border-2 border-brand-primary">
                                    {gameLogo ? (
                                        <div className="relative w-10 h-10">
                                            <Image
                                                src={gameLogo}
                                                alt={listing.game}
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                    ) : (
                                        <span className="text-brand-primary font-bold">{listing.game.charAt(0)}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Auction Status (If Auction) */}
                        {isAuction && listing.auction_ends_at && (
                            <div className="relative overflow-hidden rounded-2xl p-px bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600">
                                <div className="relative bg-zinc-900/90 backdrop-blur-3xl rounded-2xl p-6">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-white mb-1 flex items-center gap-2">
                                                <span className="text-xl">⏳</span> Sisa Waktu Lelang
                                            </h3>
                                            <p className="text-sm text-zinc-400">Segera berikan penawaran terbaikmu sebelum waktu habis!</p>
                                        </div>
                                        <div className="bg-black/40 border border-white/10 backdrop-blur-md rounded-xl p-4 min-w-[200px] text-center">
                                            <Countdown targetDate={new Date(listing.auction_ends_at)} className="text-2xl font-mono font-bold text-white tracking-wider" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Deskripsi</h2>
                            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
                                {listing.description || "Tidak ada deskripsi."}
                            </p>
                        </div>

                        {/* Bid History (If Auction) */}
                        {isAuction && (
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                                <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Riwayat Penawaran</h2>
                                <div className="space-y-4">
                                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl text-center text-zinc-500">
                                        Belum ada penawaran. Jadilah yang pertama!
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Actions */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sticky top-24">
                            <div className="mb-4">
                                <Badge className={`mb-3 ${isAuction ? "bg-violet-500/10 text-violet-500 hover:bg-violet-500/20 border-violet-500/20" : ""}`}>
                                    {isAuction ? "LELANG AKTIF" : listing.game}
                                </Badge>
                                <h1 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                                    {listing.title}
                                </h1>
                                <div className="flex items-center gap-2 text-sm text-zinc-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    <span>{listing.view_count.toLocaleString()} views</span>
                                </div>
                            </div>

                            <div className="py-4 border-y border-zinc-200 dark:border-zinc-800 mb-4">
                                <p className="text-sm text-zinc-500 mb-1">
                                    {isAuction ? "Penawaran Tertinggi Saat Ini" : "Harga"}
                                </p>
                                <p className="text-3xl font-bold text-brand-primary">
                                    Rp {(isAuction ? listing.current_bid : listing.price)?.toLocaleString("id-ID")}
                                </p>
                                {isAuction && (
                                    <p className="text-xs text-zinc-500 mt-1">
                                        {listing.bidCount} orang telah menawar
                                    </p>
                                )}
                            </div>

                            <div className="space-y-3">
                                {isAuction ? (
                                    <>
                                        <div>
                                            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                                                Masukkan Penawaran Anda
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">Rp</span>
                                                <input
                                                    type="number"
                                                    placeholder={`Min. ${((listing.current_bid || listing.starting_bid || 0) + (listing.bid_increment || 10000)).toLocaleString("id-ID")}`}
                                                    value={bidAmount}
                                                    onChange={(e) => setBidAmount(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            className="w-full h-12 text-base bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/20 border-0"
                                            onClick={handlePlaceBid}
                                            disabled={isBidding || !bidAmount}
                                        >
                                            {isBidding ? "Mengirim..." : "Kirim Penawaran"}
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        className="w-full h-12 text-base"
                                        onClick={handleBuy}
                                        disabled={isOwner}
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                        {isOwner ? "Listing Anda Sendiri" : "Beli Sekarang"}
                                    </Button>
                                )}

                                <Button
                                    variant="outline"
                                    className="w-full h-12 text-base border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={handleChat}
                                    disabled={isOwner}
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    {isOwner ? "Listing Anda" : "Chat Seller"}
                                </Button>
                            </div>

                            {/* Seller & Protection Info */}
                            <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                <div className="flex items-start gap-2">
                                    <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <p className="text-xs text-amber-700 dark:text-amber-400">
                                        Transaksi dilindungi oleh sistem Escrow. Dana Anda aman sampai barang diterima.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chat */}
                <TransactionChat
                    isOpen={showChatModal}
                    onClose={() => {
                        setShowChatModal(false);
                        setChatAction(null);
                    }}
                    listing={{
                        id: listing.listing_id,
                        title: listing.title,
                        price: listing.price,
                        image: gameLogo ? listing.game : listing.game.charAt(0),
                    }}
                    seller={{
                        id: listing.seller.user_id,
                        name: listing.seller.name,
                        avatar: listing.seller.avatar_url || "",
                    }}
                    action={chatAction}
                    onActionHandled={() => setChatAction(null)}
                />
            </div>
        </div>
    );
}
