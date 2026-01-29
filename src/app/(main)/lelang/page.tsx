"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, Suspense } from "react";
import { Countdown } from "@/components/ui/countdown";
import { useSearchParams, useRouter } from "next/navigation";

import { api } from "@/trpc/react";
import { Aurora } from "@/components/effects/Aurora";

// Game Logos
import mobileLegendsLogo from "@/assets/images/Mobile-legends-logo.svg.png";
import freeFireLogo from "@/assets/images/FREE_FIRE_LOGO.PNG_WHITE.png";
import pubgLogo from "@/assets/images/PUBG_Corporation_Logo.svg.png";
import genshinLogo from "@/assets/images/Genshin_Impact_logo.svg.png";
import valorantLogo from "@/assets/images/Valorant_logo_-_pink_color_version.svg.png";
import robloxLogo from "@/assets/images/Roblox_logo_2017.svg.png";

// Logo map for rendering
const logoMap: Record<string, any> = {
    "Mobile Legends": mobileLegendsLogo,
    "Free Fire": freeFireLogo,
    "PUBG Mobile": pubgLogo,
    "Genshin Impact": genshinLogo,
    "Valorant": valorantLogo,
    "Roblox": robloxLogo,
};

import { useTheme } from "next-themes";

function LelangContent() {
    const { resolvedTheme } = useTheme();
    const searchParams = useSearchParams();
    const router = useRouter();
    const categoryFilter = searchParams.get("category");
    const [searchQuery, setSearchQuery] = useState("");

    const [sortBy, setSortBy] = useState("ending-soon");

    // Fetch auctions using tRPC
    const { data, isLoading } = api.listing.getAll.useQuery({
        type: "AUCTION",
        category: categoryFilter || undefined,
        search: searchQuery || undefined,
        limit: 100, // Fetch more for sorting on client
    });

    const listings = data?.listings || [];

    // Client-side sorting for now
    const sortedListings = [...listings].sort((a, b) => {
        if (sortBy === "ending-soon") {
            const timeA = a.auction_ends_at ? new Date(a.auction_ends_at).getTime() : 0;
            const timeB = b.auction_ends_at ? new Date(b.auction_ends_at).getTime() : 0;
            return timeA - timeB; // Ascending (sooner is better)
        } else if (sortBy === "highest-bid") {
            const bidA = a.current_bid || a.price || 0;
            const bidB = b.current_bid || b.price || 0;
            return bidB - bidA;
        } else if (sortBy === "most-bids") {
            return b.bidCount - a.bidCount;
        }
        return 0;
    });

    // Featured auction: Pick the one with highest current bid or first one
    const featuredAuction = sortedListings.length > 0
        ? [...sortedListings].sort((a, b) => (b.current_bid || 0) - (a.current_bid || 0))[0]
        : null;

    // Ending soon (less than 1 hour)
    const endingSoon = sortedListings.filter(a => {
        if (!a.auction_ends_at) return false;
        return new Date(a.auction_ends_at).getTime() - Date.now() < 1000 * 60 * 60;
    });

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black pt-24 pb-12 relative overflow-hidden">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
                <Aurora
                    colorStops={resolvedTheme === "light" ? ["#6366f1", "#a5b4fc", "#c7d2fe"] : ["#6366f1", "#a5b4fc", "#6366f1"]}
                    blend={0.5}
                    amplitude={0.8}
                    speed={0.4}
                />
            </div>
            <div className="relative z-10 max-w-7xl mx-auto px-6">

                {/* Hero Banner */}
                <div className="relative overflow-hidden rounded-3xl mb-10">
                    {/* Background gradient using brand colors */}
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-primary via-brand-primary-dark to-indigo-900"></div>

                    {/* Animated background pattern */}
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse-slow"></div>
                        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse-slow"></div>
                    </div>

                    {/* Grid pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

                    <div className="relative px-8 py-12 md:py-16">
                        <div className="flex flex-col lg:flex-row items-center gap-8">
                            {/* Left - Text */}
                            <div className="flex-1 text-center lg:text-left">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm mb-4 border border-white/20">
                                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                    {listings.length} Lelang Aktif
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                                    Lelang Digital
                                </h1>
                                <p className="text-white/70 text-lg max-w-xl mb-6">
                                    Tawar dan menangkan akun game, item langka, dan aset digital premium dengan harga terbaik!
                                </p>
                                <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                                    <Link href="#auctions" className="px-6 py-3 bg-white text-brand-primary font-semibold rounded-xl hover:bg-zinc-100 transition-colors shadow-lg">
                                        Mulai Menawar
                                    </Link>
                                    <Link href="/listings" className="px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/20">
                                        Beli Langsung
                                    </Link>
                                </div>
                            </div>

                            {/* Right - Featured Auction Card */}
                            {featuredAuction && (
                                <div className="w-full lg:w-auto">
                                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 min-w-[320px]">
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="px-2 py-1 bg-accent-gold/20 text-accent-gold text-xs font-bold rounded-lg">FEATURED</span>
                                            <span className="px-2 py-1 bg-white/10 text-white/80 text-xs rounded-lg flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                                LIVE
                                            </span>
                                        </div>
                                        <h3 className="text-white font-bold text-lg mb-2 line-clamp-1">{featuredAuction.title}</h3>
                                        <div className="flex items-center gap-2 mb-4">
                                            {logoMap[featuredAuction.game] && (
                                                <div className="relative w-6 h-6">
                                                    <Image src={logoMap[featuredAuction.game]} alt={featuredAuction.game} fill className="object-contain" />
                                                </div>
                                            )}
                                            <span className="text-white/60 text-sm">{featuredAuction.game}</span>
                                        </div>
                                        <div className="bg-black/20 rounded-xl p-4 mb-4">
                                            <p className="text-white/60 text-xs mb-1">Penawaran Tertinggi</p>
                                            <p className="text-2xl font-bold text-white">Rp {(featuredAuction.current_bid || featuredAuction.price).toLocaleString("id-ID")}</p>
                                            <p className="text-white/50 text-xs mt-1">{featuredAuction.bidCount} penawaran</p>
                                        </div>
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-white/60 text-sm">Berakhir dalam</span>
                                            {featuredAuction.auction_ends_at && (
                                                <Countdown targetDate={new Date(featuredAuction.auction_ends_at)} className="text-white font-mono font-bold" />
                                            )}
                                        </div>
                                        <Link href={`/listings/${featuredAuction.listing_id}`} className="block w-full py-3 bg-white text-brand-primary font-semibold rounded-xl text-center hover:bg-zinc-100 transition-colors">
                                            Tawar Sekarang
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Ending Soon Alert */}
                {endingSoon.length > 0 && (
                    <div className="mb-8 p-4 bg-error/10 border border-error/20 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-error/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-semibold text-error">Segera Berakhir!</p>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">{endingSoon.length} lelang akan berakhir dalam 1 jam</p>
                            </div>
                        </div>
                        <Link href="#ending-soon" className="px-4 py-2 bg-error text-white font-medium rounded-lg hover:bg-error/90 transition-colors">
                            Lihat Semua
                        </Link>
                    </div>
                )}

                {/* Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    {[
                        { label: "Lelang Aktif", value: listings.length, icon: "🔥" },
                        { label: "Total Bid Hari Ini", value: listings.reduce((acc, curr) => acc + curr.bidCount, 0), icon: "📊" },
                        { label: "Nilai Tertinggi", value: `Rp ${Math.max(...listings.map(l => l.current_bid || 0)).toLocaleString("id-ID")}`, icon: "💰" },
                        { label: "Pengguna Online", value: 234, icon: "👥" }, // Dummy for now
                    ].map((stat) => (
                        <div key={stat.label} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 text-center">
                            <span className="text-2xl mb-2 block">{stat.icon}</span>
                            <p className="text-2xl font-bold text-zinc-900 dark:text-white">{stat.value}</p>
                            <p className="text-xs text-zinc-500">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Filters & Sort */}
                <div id="auctions" className="flex flex-col md:flex-row gap-4 mb-8 sticky top-20 z-10 bg-zinc-50/80 dark:bg-black/80 backdrop-blur-md py-4 -mx-4 px-4 md:mx-0 md:px-0">
                    <div className="flex-1">
                        <div className="relative">
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="search"
                                placeholder="Cari lelang..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-12 pl-12 pr-4 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:border-brand-primary transition-colors"
                            />
                        </div>
                    </div>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="h-12 px-4 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:border-brand-primary appearance-none cursor-pointer"
                    >
                        <option value="ending-soon">Segera Berakhir</option>
                        <option value="highest-bid">Bid Tertinggi</option>
                        <option value="most-bids">Paling Banyak Bid</option>
                    </select>
                </div>

                {/* Auction Grid */}
                <div>
                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse"></span>
                        Lelang Berlangsung
                        <span className="text-sm font-normal text-zinc-500 ml-auto">
                            {isLoading ? "Loading..." : `${sortedListings.length} hasil`}
                        </span>
                    </h2>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : sortedListings.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sortedListings.map((auction) => {
                                const timeLeft = auction.auction_ends_at ? new Date(auction.auction_ends_at).getTime() - Date.now() : 0;
                                const isEndingSoon = timeLeft < 1000 * 60 * 60 && timeLeft > 0;

                                return (
                                    <Link
                                        key={auction.listing_id}
                                        href={`/listings/${auction.listing_id}`}
                                        className={`group relative rounded-2xl overflow-hidden flex flex-col transition-all duration-300 
                                            ${isEndingSoon
                                                ? "bg-gradient-to-br from-error/5 to-orange-500/5 border-2 border-error/30 hover:border-error/50"
                                                : "bg-white dark:bg-zinc-900 border-2 border-brand-primary/20 hover:border-brand-primary/50"
                                            } hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]`}
                                    >
                                        {/* Badges */}
                                        <div className="absolute top-3 right-3 z-10 flex gap-2">
                                            {isEndingSoon && (
                                                <span className="px-2 py-1 bg-error text-white text-[10px] font-bold rounded-full animate-pulse">
                                                    ENDING SOON
                                                </span>
                                            )}
                                            <span className="px-2 py-1 bg-brand-primary text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                                                LIVE
                                            </span>
                                        </div>

                                        {/* Image */}
                                        <div className={`h-44 flex items-center justify-center ${isEndingSoon ? "bg-gradient-to-br from-error/10 to-orange-500/10" : "bg-gradient-to-br from-brand-primary/5 to-indigo-500/5"}`}>
                                            {logoMap[auction.game] ? (
                                                <div className="relative w-20 h-20 group-hover:scale-110 transition-transform">
                                                    <Image src={logoMap[auction.game]} alt={auction.game} fill className="object-contain" />
                                                </div>
                                            ) : (
                                                <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary text-2xl font-bold">
                                                    {auction.game.charAt(0)}
                                                </div>
                                            )}
                                        </div>

                                        {/* Countdown bar */}
                                        <div className={`px-4 py-2 ${isEndingSoon ? "bg-error/10" : "bg-brand-primary/5"} flex items-center justify-between`}>
                                            <span className={`text-xs ${isEndingSoon ? "text-error" : "text-brand-primary"}`}>Berakhir dalam</span>
                                            {auction.auction_ends_at && (
                                                <Countdown targetDate={new Date(auction.auction_ends_at)} className={`text-sm font-mono font-bold ${isEndingSoon ? "text-error" : "text-brand-primary"}`} />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-5 flex-1 flex flex-col">
                                            <div className="flex items-start justify-between mb-2">
                                                <Badge variant="secondary" className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                                                    {auction.game}
                                                </Badge>
                                                <span className="text-xs font-medium text-brand-primary bg-brand-primary/10 px-2 py-1 rounded-md">
                                                    {auction.bidCount} bid
                                                </span>
                                            </div>

                                            <h3 className="font-semibold text-zinc-900 dark:text-white text-lg mb-1 group-hover:text-brand-primary transition-colors line-clamp-1">
                                                {auction.title}
                                            </h3>

                                            <div className="flex items-center gap-2 text-sm text-zinc-500 mb-4">
                                                <span>by</span>
                                                <span className="font-medium text-zinc-700 dark:text-zinc-300">{auction.seller.name}</span>
                                                {auction.seller.is_verified && (
                                                    <svg className="w-4 h-4 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </div>

                                            <div className="mt-auto pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-zinc-500 mb-0.5">Penawaran Tertinggi</p>
                                                    <p className="text-lg font-bold text-brand-primary">
                                                        Rp {(auction.current_bid || auction.price).toLocaleString("id-ID")}
                                                    </p>
                                                </div>
                                                <button className="px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-brand-primary-dark transition-all shadow-lg shadow-brand-primary/25">
                                                    Tawar
                                                </button>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-zinc-100 dark:bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800">
                            <span className="text-4xl block mb-4">🔍</span>
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Tidak ada lelang aktif saat ini</h3>
                            <p className="text-zinc-500">Cek kembali nanti untuk lelang menarik lainnya.</p>
                            <button
                                onClick={() => {
                                    setSortBy("ending-soon");
                                    setSearchQuery("");
                                }} // Reset filters
                                className="mt-6 px-6 py-2 bg-brand-primary text-white rounded-xl font-medium hover:bg-brand-primary-dark transition-colors"
                            >
                                Lihat Semua Lelang
                            </button>
                        </div>
                    )}
                </div>
                {/* How It Works */}
                <div className="mt-16 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8">
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white text-center mb-8">Cara Kerja Lelang</h2>
                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            { step: 1, title: "Pilih Lelang", desc: "Telusuri dan pilih item yang ingin Anda tawar" },
                            { step: 2, title: "Masukkan Bid", desc: "Tawar dengan harga lebih tinggi dari bid tertinggi" },
                            { step: 3, title: "Tunggu Hasil", desc: "Pantau lelang sampai waktu berakhir" },
                            { step: 4, title: "Menang & Bayar", desc: "Jika menang, selesaikan pembayaran via escrow" },
                        ].map((item) => (
                            <div key={item.step} className="text-center">
                                <div className="w-12 h-12 rounded-full bg-brand-primary text-white font-bold text-lg flex items-center justify-center mx-auto mb-4">
                                    {item.step}
                                </div>
                                <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">{item.title}</h3>
                                <p className="text-sm text-zinc-500">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div >
        </div >
    );
}

export default function LelangPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-zinc-50 dark:bg-black pt-24 pb-12 text-center text-zinc-900 dark:text-white">Loading...</div>}>
            <LelangContent />
        </Suspense>
    );
}
