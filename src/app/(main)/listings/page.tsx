"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { Countdown } from "@/components/ui/countdown";

import { api } from "@/trpc/react";
import { Aurora } from "@/components/effects/Aurora";

// Game Logos
import mobileLegendsLogo from "@/assets/images/Mobile-legends-logo.svg.png";
import freeFireLogo from "@/assets/images/FREE_FIRE_LOGO.PNG_WHITE.png";
import pubgLogo from "@/assets/images/PUBG_Corporation_Logo.svg.png";
import genshinLogo from "@/assets/images/Genshin_Impact_logo.svg.png";
import valorantLogo from "@/assets/images/Valorant_logo_-_pink_color_version.svg.png";
import robloxLogo from "@/assets/images/Roblox_logo_2017.svg.png";
import steamLogo from "@/assets/images/Steam_icon_logo.svg.png";
import playstationLogo from "@/assets/images/Playstation_logo_colour.svg.png";
import nintendoLogo from "@/assets/images/Nintendo_red_logo.svg.png";

// Logo map for rendering
const logoMap: Record<string, any> = {
    "Mobile Legends": mobileLegendsLogo,
    "Free Fire": freeFireLogo,
    "PUBG Mobile": pubgLogo,
    "Genshin Impact": genshinLogo,
    "Valorant": valorantLogo,
    "Roblox": robloxLogo,
    "Steam": steamLogo,
    "PlayStation": playstationLogo,
    "Nintendo": nintendoLogo,
};

// Categories for UI filtering (Static for now, matches DB seed)
const categories = [
    { name: "Mobile Legends", count: 1234, slug: "mobile-legends", logo: mobileLegendsLogo },
    { name: "Free Fire", count: 892, slug: "free-fire", logo: freeFireLogo },
    { name: "PUBG Mobile", count: 756, slug: "pubg-mobile", logo: pubgLogo },
    { name: "Genshin Impact", count: 543, slug: "genshin-impact", logo: genshinLogo },
    { name: "Valorant", count: 421, slug: "valorant", logo: valorantLogo },
    { name: "Roblox", count: 389, slug: "roblox", logo: robloxLogo },
    { name: "Steam", count: 234, slug: "steam", logo: steamLogo },
    { name: "PlayStation", count: 189, slug: "playstation", logo: playstationLogo },
    { name: "Nintendo", count: 145, slug: "nintendo", logo: nintendoLogo },
    { name: "Lainnya", count: 312, slug: "other", logo: null },
];

import { useTheme } from "next-themes";

function ListingsContent() {
    const { resolvedTheme } = useTheme();
    const searchParams = useSearchParams();
    const router = useRouter();
    const typeFilter = searchParams.get("type") || "all";
    const categoryFilter = searchParams.get("category");
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch listings using tRPC
    const { data, isLoading } = api.listing.getAll.useQuery({
        type: typeFilter === "all" ? undefined : (typeFilter === "fixed" ? "FIXED" : "AUCTION"),
        category: categoryFilter || undefined,
        search: searchQuery || undefined,
    });

    const listings = data?.listings || [];

    const handleTypeChange = (type: string) => {
        const params = new URLSearchParams(searchParams);
        if (type === "all") params.delete("type");
        else params.set("type", type);
        router.push(`/listings?${params.toString()}`);
    };

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
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
                        Marketplace
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400 text-lg">
                        Temukan akun game, item, dan aset digital dengan harga terbaik
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8 sticky top-20 z-10 py-4 -mx-4 px-4 md:mx-0 md:px-0 pointer-events-none">
                    <div className="flex-1 pointer-events-auto">
                        <div className="relative">
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="search"
                                placeholder="Cari akun, item, atau game..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-12 pl-12 pr-4 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:border-brand-primary transition-colors"
                            />
                        </div>
                    </div>

                    {/* Type Tabs */}
                    <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl relative z-0 pointer-events-auto">
                        <button
                            onClick={() => handleTypeChange("all")}
                            className={`relative z-10 px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${typeFilter === "all" ? "bg-white dark:bg-zinc-800 text-brand-primary shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"}`}
                        >
                            Semua
                        </button>
                        <button
                            onClick={() => handleTypeChange("fixed")}
                            className={`relative z-10 px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${typeFilter === "fixed" ? "bg-white dark:bg-zinc-800 text-brand-primary shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"}`}
                        >
                            Beli Langsung
                        </button>
                        <button
                            onClick={() => handleTypeChange("auction")}
                            className={`relative z-10 px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${typeFilter === "auction" ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/25" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"}`}
                        >
                            Lelang
                        </button>
                    </div>

                    <select
                        onChange={(e) => {
                            const params = new URLSearchParams(searchParams);
                            params.set("sort", e.target.value);
                            router.push(`/listings?${params.toString()}`);
                        }}
                        className="pointer-events-auto h-12 px-4 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:border-brand-primary appearance-none cursor-pointer"
                        defaultValue={searchParams.get("sort") || "latest"}
                    >
                        <option value="latest">Urutkan: Terbaru</option>
                        <option value="price_asc">Harga: Terendah</option>
                        <option value="price_desc">Harga: Tertinggi</option>
                    </select>
                </div>

                {/* Categories - Only show if no category filter active */}
                {!categoryFilter && (
                    <div className="mb-12">
                        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">Kategori</h2>
                        <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-3">
                            {categories.map(cat => (
                                <Link
                                    key={cat.name}
                                    href={`/listings?category=${cat.slug}`}
                                    className="group p-4 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-brand-primary hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all flex flex-col items-center text-center"
                                >
                                    <div className="w-12 h-12 mb-2 relative flex items-center justify-center">
                                        {cat.logo ? (
                                            <Image
                                                src={cat.logo}
                                                alt={cat.name}
                                                fill
                                                className="object-contain group-hover:scale-110 transition-transform"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary text-lg font-bold group-hover:scale-110 transition-transform">
                                                {cat.name === "Lainnya" ? (
                                                    <div className="flex gap-0.5">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                                                    </div>
                                                ) : (
                                                    cat.name.charAt(0)
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <p className="font-medium text-zinc-900 dark:text-white text-xs">{cat.name}</p>
                                    <p className="text-[10px] text-zinc-500">{cat.count.toLocaleString()}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Auction Banner */}
                {typeFilter === "auction" && (
                    <div className="mb-10 relative overflow-hidden rounded-3xl bg-white dark:bg-[#0f0f15] border border-zinc-200 dark:border-zinc-800 group shadow-lg">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 md:p-10 gap-8">
                            <div className="text-center md:text-left max-w-2xl">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 rounded-full text-brand-primary text-xs font-bold mb-4">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
                                    </span>
                                    LIVE AUCTION
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-3">
                                    Lelang Digital Eksklusif
                                </h2>
                                <p className="text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed">
                                    Tawar dan menangkan akun game langka & aset premium dengan harga terbaik.
                                    Sistem transparan, aman, dan real-time.
                                </p>
                            </div>

                            <div className="flex flex-col items-center gap-4">
                                <div className="bg-zinc-100 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 backdrop-blur-sm">
                                    <div className="text-zinc-500 text-xs font-medium uppercase tracking-wider text-center mb-1">Status</div>
                                    <div className="flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
                                        <span className="text-brand-primary">Active</span>
                                        <span className="text-zinc-300 dark:text-zinc-700">|</span>
                                        <span>24 Items</span>
                                    </div>
                                </div>
                                <Link href="/lelang" className="px-8 py-3 bg-brand-primary hover:bg-brand-primary-dark text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-primary/25 hover:-translate-y-1">
                                    Mulai Menawar
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Listing Results */}
                <div>
                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            {typeFilter === "auction" && <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse"></span>}
                            {typeFilter === "auction" ? "Sedang Dilelang" : typeFilter === "fixed" ? "Beli Langsung" : "Semua Listing"}
                        </span>
                        <span className="text-sm font-normal text-zinc-500">
                            {isLoading ? "Loading..." : `${listings.length} hasil`}
                        </span>
                    </h2>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : listings.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {listings.map(listing => {
                                const isAuction = listing.listing_type === "AUCTION";
                                return (
                                    <Link
                                        key={listing.listing_id}
                                        href={`/listings/${listing.listing_id}`}
                                        className={`group relative rounded-2xl overflow-hidden flex flex-col transition-all duration-300 ${isAuction
                                            ? "bg-white dark:bg-zinc-900 border-2 border-brand-primary/30 hover:border-brand-primary hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]"
                                            : "bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-brand-primary hover:shadow-lg hover:shadow-brand-primary/10"
                                            }`}
                                    >
                                        {isAuction && (
                                            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-indigo-500/5 pointer-events-none"></div>
                                        )}

                                        <div className={`h-48 flex items-center justify-center relative ${isAuction ? "bg-gradient-to-br from-brand-primary/5 to-indigo-500/10" : "bg-zinc-100 dark:bg-zinc-800"
                                            }`}>
                                            {logoMap[listing.game] ? (
                                                <div className="relative w-24 h-24">
                                                    <Image
                                                        src={logoMap[listing.game]}
                                                        alt={listing.game}
                                                        fill
                                                        className="object-contain"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold bg-brand-primary/10 text-brand-primary">
                                                    {listing.game.charAt(0)}
                                                </div>
                                            )}
                                            {isAuction && (
                                                <div className="absolute top-3 right-3">
                                                    <div className="bg-brand-primary text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                                                        LIVE
                                                    </div>
                                                </div>
                                            )}
                                            {isAuction && listing.auction_ends_at && (
                                                <div className="absolute bottom-3 left-3 right-3">
                                                    <div className="bg-black/60 backdrop-blur-md rounded-lg px-3 py-2 flex items-center justify-between">
                                                        <span className="text-white/60 text-xs">Berakhir dalam</span>
                                                        <Countdown targetDate={new Date(listing.auction_ends_at)} className="text-sm font-mono font-bold text-white" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-5 flex-1 flex flex-col relative z-10">
                                            <div className="flex items-start justify-between mb-2">
                                                <Badge variant="secondary" className={`text-xs ${isAuction
                                                    ? "bg-brand-primary/10 text-brand-primary border border-brand-primary/20"
                                                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 group-hover:bg-brand-primary/20 group-hover:text-brand-primary"
                                                    }`}>
                                                    {listing.game}
                                                </Badge>
                                                {isAuction && (
                                                    <span className="text-xs font-medium text-brand-primary bg-brand-primary/10 px-2 py-1 rounded-md">
                                                        {listing.bidCount} bid
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="font-semibold text-zinc-900 dark:text-white text-lg mb-1 transition-colors line-clamp-1 group-hover:text-brand-primary">
                                                {listing.title}
                                            </h3>

                                            <div className={`mt-auto pt-4 border-t flex items-center justify-between ${isAuction ? "border-brand-primary/20" : "border-zinc-200 dark:border-zinc-800"
                                                }`}>
                                                <div>
                                                    <p className="text-xs text-zinc-500 mb-0.5">
                                                        {isAuction ? "Penawaran Tertinggi" : "Harga"}
                                                    </p>
                                                    <p className="text-lg font-bold text-brand-primary">
                                                        Rp {(isAuction && listing.current_bid ? listing.current_bid : listing.price).toLocaleString("id-ID")}
                                                    </p>
                                                </div>
                                                {isAuction && (
                                                    <button className="px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-brand-primary-dark transition-all shadow-lg shadow-brand-primary/25">
                                                        Tawar
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-zinc-100 dark:bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800">
                            <span className="text-4xl block mb-4">🔍</span>
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Tidak ada listing ditemukan</h3>
                            <p className="text-zinc-500">Coba ubah filter atau kata kunci pencarian Anda.</p>
                            <button
                                onClick={() => {
                                    handleTypeChange("all");
                                    setSearchQuery("");
                                }}
                                className="mt-6 px-6 py-2 bg-brand-primary text-white rounded-xl font-medium hover:bg-brand-primary-dark transition-colors"
                            >
                                Reset Filter
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ListingsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-zinc-50 dark:bg-black pt-24 pb-12 text-center text-zinc-900 dark:text-white">Loading...</div>}>
            <ListingsContent />
        </Suspense>
    );
}
