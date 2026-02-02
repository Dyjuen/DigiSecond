"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, ArrowRight } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { api } from "@/trpc/react";
import { logoMap } from "@/assets/images/logo-map";
import { Aurora } from "@/components/effects/Aurora";
import { motion, AnimatePresence } from "motion/react";
import { SortDropdown, type SortOption } from "@/components/ui/SortDropdown";
import { Pagination } from "@/components/ui/Pagination";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

const sortOptions: SortOption[] = [
    { id: "newest", label: "Terbaru" },
    { id: "price_asc", label: "Harga: Terendah" },
    { id: "price_desc", label: "Harga: Tertinggi" },
];

const categories = [
    { name: "Mobile Legends", slug: "mobile-legends" },
    { name: "Free Fire", slug: "free-fire" },
    { name: "PUBG Mobile", slug: "pubg-mobile" },
    { name: "Genshin Impact", slug: "genshin-impact" },
    { name: "Valorant", slug: "valorant" },
    { name: "Roblox", slug: "roblox" },
    { name: "Steam", slug: "steam" },
    { name: "PlayStation", slug: "playstation" },
    { name: "Nintendo", slug: "nintendo" },
];

function ListingsContent() {
    const { resolvedTheme } = useTheme();
    const searchParams = useSearchParams();
    const router = useRouter();

    const categoryFilter = searchParams.get("category") || "";
    const typeFilter = searchParams.get("type") || "all";
    const sortFilter = searchParams.get("sort") || "newest";
    const searchFilter = searchParams.get("search") || "";
    const pageFilter = Number(searchParams.get("page")) || 1;

    const [searchInput, setSearchInput] = useState(searchFilter);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput !== searchFilter) {
                const params = new URLSearchParams(searchParams);
                params.set("search", searchInput);
                params.set("page", "1");
                router.push(`/listings?${params.toString()}`);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput, searchFilter, router, searchParams]);

    const { data, isLoading } = api.listing.getAll.useQuery({
        category: categoryFilter || undefined,
        type: typeFilter === "all" ? undefined : (typeFilter === "fixed" ? "FIXED" : "AUCTION"),
        sortBy: sortFilter as any,
        search: searchFilter || undefined,
        limit: 10,
        page: pageFilter,
    });

    const listings = data?.listings || [];
    const totalPages = data?.totalPages || 1;

    const handleSortChange = (newSort: string) => {
        const params = new URLSearchParams(searchParams);
        params.set("sort", newSort);
        router.push(`/listings?${params.toString()}`);
    };

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", newPage.toString());
        router.push(`/listings?${params.toString()}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleTypeChange = (type: string) => {
        const params = new URLSearchParams(searchParams);
        if (type === "all") params.delete("type");
        else params.set("type", type);
        params.set("page", "1");
        router.push(`/listings?${params.toString()}`);
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black pt-24 pb-12 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20 translate-y-[-20%]">
                <Aurora colorStops={["#6366f1", "#a855f7", "#6366f1"]} amplitude={0.8} />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6">
                <div className="mb-12">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-black text-zinc-900 dark:text-white mb-4 tracking-tighter leading-[0.9]"
                    >
                        Marketplace <br /><span className="text-brand-primary">Layanan Game</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-zinc-500 dark:text-zinc-400 max-w-2xl text-lg font-medium"
                    >
                        Temukan layanan joki, pemandu, dan akun game terbaik dengan keamanan Escrow.
                    </motion.p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-8 sticky top-20 z-10 py-4 -mx-4 px-4 md:mx-0 md:px-0 bg-transparent">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-brand-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Cari layanan, game, atau seller..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full h-12 pl-12 pr-4 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-zinc-900 dark:text-white placeholder:text-zinc-500"
                        />
                    </div>

                    <div className="flex p-1.5 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
                        {[
                            { id: "all", label: "Semua" },
                            { id: "fixed", label: "Direct Buy" },
                            { id: "auction", label: "Lelang" },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTypeChange(tab.id)}
                                className={cn(
                                    "relative px-6 py-2 text-sm font-bold rounded-xl transition-colors duration-300 z-10",
                                    typeFilter === tab.id ? "text-white" : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                                )}
                            >
                                {typeFilter === tab.id && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-brand-primary rounded-xl shadow-lg shadow-brand-primary/25 -z-10"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <SortDropdown
                        options={sortOptions}
                        value={sortFilter}
                        onChange={handleSortChange}
                    />
                </div>

                {/* Categories Scrollable with Icons */}
                {!categoryFilter && (
                    <div className="mb-10 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
                        <div className="flex gap-3">
                            {categories.map((cat, i) => {
                                const logo = logoMap[cat.name];
                                return (
                                    <motion.button
                                        key={cat.slug}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={() => {
                                            const params = new URLSearchParams(searchParams);
                                            params.set("category", cat.slug);
                                            params.set("page", "1");
                                            router.push(`/listings?${params.toString()}`);
                                        }}
                                        className="flex items-center gap-3 px-5 py-2.5 whitespace-nowrap bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold hover:border-brand-primary hover:text-brand-primary transition-all shadow-sm group"
                                    >
                                        {logo && (
                                            <div className="relative w-5 h-5 shrink-0 group-hover:scale-110 transition-transform">
                                                <Image src={logo} alt={cat.name} fill className="object-contain" />
                                            </div>
                                        )}
                                        {cat.name}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {categoryFilter && (
                    <div className="mb-6 flex items-center gap-2">
                        <span className="text-sm text-zinc-500 font-medium tracking-wide">FILTER:</span>
                        <motion.button
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            onClick={() => {
                                const params = new URLSearchParams(searchParams);
                                params.delete("category");
                                params.set("page", "1");
                                router.push(`/listings?${params.toString()}`);
                            }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-primary/10 border border-brand-primary/20 rounded-full text-brand-primary text-sm font-bold hover:bg-brand-primary/20 transition-all group"
                        >
                            {categories.find(c => c.slug === categoryFilter)?.name || categoryFilter}
                            <span className="w-4 h-4 rounded-full bg-brand-primary/20 flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-colors">×</span>
                        </motion.button>
                    </div>
                )}

                {isLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-zinc-500 font-medium">Memuat listing...</p>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        {listings.length > 0 ? (
                            <motion.div
                                key={`${typeFilter}-${categoryFilter}-${pageFilter}-${sortFilter}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-12"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                    {listings.map((listing, i) => (
                                        <motion.div
                                            key={listing.listing_id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                        >
                                            <ListingCard listing={listing} />
                                        </motion.div>
                                    ))}
                                </div>

                                <Pagination
                                    currentPage={pageFilter}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-24 text-center bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl"
                            >
                                <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-8 h-8 text-zinc-400" />
                                </div>
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Layanan tidak ditemukan</h2>
                                <p className="text-zinc-500">Coba ubah filter atau kata kunci pencarian Anda.</p>
                                <button
                                    onClick={() => router.push("/listings")}
                                    className="mt-6 px-6 py-2 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primary-dark transition-all shadow-lg shadow-brand-primary/20"
                                >
                                    Reset Semua Filter
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}

function ListingCard({ listing }: { listing: any }) {
    const isAuction = listing.listing_type === "AUCTION";
    const logo = logoMap[listing.game];

    return (
        <Link
            href={`/listings/${listing.listing_id}`}
            className={cn(
                "group relative bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:border-brand-primary/30",
                isAuction && "ring-1 ring-brand-primary/10"
            )}
        >
            <div className={cn(
                "relative h-44 flex items-center justify-center overflow-hidden",
                isAuction ? "bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20" : "bg-zinc-100/30 dark:bg-zinc-800/30"
            )}>
                {logo ? (
                    <div className="relative w-24 h-24 transform group-hover:scale-125 transition-transform duration-700 ease-out z-10">
                        <Image
                            src={logo}
                            alt={listing.game}
                            fill
                            className="object-contain drop-shadow-2xl"
                        />
                    </div>
                ) : (
                    <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-3xl font-bold text-brand-primary z-10">
                        {listing.game.charAt(0)}
                    </div>
                )}

                <div className="absolute inset-0 opacity-10 pointer-events-none transition-transform duration-1000 group-hover:scale-150">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-brand-primary/30 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {isAuction && (
                    <div className="absolute top-3 right-3 z-20">
                        <div className="bg-brand-primary text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg shadow-brand-primary/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                            LELANG
                        </div>
                    </div>
                )}
            </div>

            <div className="p-5 flex-1 flex flex-col relative z-20">
                <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className="text-[10px] font-bold px-2 py-0 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover:bg-brand-primary group-hover:text-white transition-colors duration-300">
                        {listing.game}
                    </Badge>
                </div>

                <h3 className="font-bold text-zinc-900 dark:text-white text-base mb-3 line-clamp-2 leading-tight group-hover:text-brand-primary transition-colors min-h-[2.5rem]">
                    {listing.title}
                </h3>

                <div className="mt-auto">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden relative border border-zinc-200/50 dark:border-zinc-700/50">
                            {listing.seller.avatar_url ? (
                                <Image src={listing.seller.avatar_url} alt={listing.seller.name} fill className="object-cover" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                                    {listing.seller.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <span className="text-xs text-zinc-500 font-medium truncate max-w-[100px]">
                            {listing.seller.name}
                        </span>
                        {listing.seller.is_verified && (
                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-blue-500 fill-current"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>
                        )}
                    </div>

                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between group-hover:border-brand-primary/20 transition-colors">
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">
                                {isAuction ? "Highest Bid" : "Price"}
                            </p>
                            <p className="text-lg font-black text-brand-primary">
                                Rp {(isAuction && listing.current_bid ? listing.current_bid : listing.price).toLocaleString("id-ID")}
                            </p>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-all duration-300">
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function ListingsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-zinc-50 dark:bg-black pt-24 pb-12 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <ListingsContent />
        </Suspense>
    );
}
