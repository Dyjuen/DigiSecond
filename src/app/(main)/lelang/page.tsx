"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Flame, BarChart3, Trophy, Users, Search, ArrowRight } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { Countdown } from "@/components/ui/countdown";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Aurora } from "@/components/effects/Aurora";
import { motion, AnimatePresence } from "motion/react";
import { SortDropdown, type SortOption } from "@/components/ui/SortDropdown";
import { Pagination } from "@/components/ui/Pagination";
import { logoMap } from "@/assets/images/logo-map";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

const sortOptions: SortOption[] = [
    { id: "newest", label: "Terbaru" },
    { id: "price_asc", label: "Bid: Terendah" },
    { id: "price_desc", label: "Bid: Tertinggi" },
];

function LelangContent() {
    const { resolvedTheme } = useTheme();
    const searchParams = useSearchParams();
    const router = useRouter();

    const categoryFilter = searchParams.get("category") || "";
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
                router.push(`/lelang?${params.toString()}`);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput, searchFilter, router, searchParams]);

    const { data, isLoading } = api.listing.getAll.useQuery({
        type: "AUCTION",
        category: categoryFilter || undefined,
        sortBy: sortFilter as any,
        search: searchFilter || undefined,
        limit: 10,
        page: pageFilter,
    });

    const listings = data?.listings || [];
    const totalPages = data?.totalPages || 1;
    const totalCount = data?.totalCount || 0;

    const handleSortChange = (newSort: string) => {
        const params = new URLSearchParams(searchParams);
        params.set("sort", newSort);
        router.push(`/lelang?${params.toString()}`);
    };

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", newPage.toString());
        router.push(`/lelang?${params.toString()}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black pt-24 pb-12 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20 translate-y-[-20%]">
                <Aurora colorStops={["#6366f1", "#a855f7", "#6366f1"]} amplitude={0.8} />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6">
                {/* Hero Banner with modern look */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-[2.5rem] mb-12 shadow-2xl shadow-brand-primary/10 border border-white/10"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-primary via-brand-primary-dark to-violet-900"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>

                    <div className="relative px-8 py-16 md:px-12 md:py-20 flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="max-w-2xl text-center md:text-left">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white/90 text-sm font-bold mb-6 border border-white/20"
                            >
                                <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse"></span>
                                LELANG AKTIF RATA-RATA: {totalCount} ITEMS
                            </motion.div>
                            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
                                Menangi Aset <br /> Game <span className="text-white/70 italic underline decoration-brand-primary/50">Impianmu</span>
                            </h1>
                            <p className="text-white/80 text-lg mb-8 max-w-md">
                                Platform lelang terpercaya untuk akun game premium dan item langka. Tawar sekarang, dapatkan harga terbaik!
                            </p>
                            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                <Link href="#auctions" className="px-8 py-4 bg-white text-brand-primary font-black rounded-2xl hover:bg-zinc-100 transition-all shadow-xl hover:-translate-y-1 active:scale-95">
                                    Mulai Menawar
                                </Link>
                                <Link href="/listings" className="px-8 py-4 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-all border border-white/20 backdrop-blur-sm shadow-xl">
                                    Lihat Marketplace
                                </Link>
                            </div>
                        </div>

                        {/* Animated stats or element on hero right */}
                        <div className="hidden lg:flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <HeroStatCard label="Online Users" value="2,482" icon={Users} />
                                <HeroStatCard label="Total Bids" value="14.8K" icon={BarChart3} />
                                <HeroStatCard label="Live Items" value={totalCount.toString()} icon={Flame} />
                                <HeroStatCard label="Prizes" value="Rp 2.5M+" icon={Trophy} />
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div id="auctions" className="flex flex-col md:flex-row gap-4 mb-10 sticky top-20 z-10 py-4 -mx-4 px-4 md:mx-0 md:px-0 bg-transparent">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-brand-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Cari item lelang (e.g. skin rare, akun divine)..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full h-12 pl-12 pr-4 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-zinc-900 dark:text-white placeholder:text-zinc-500"
                        />
                    </div>

                    <div className="flex p-1.5 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
                        {[
                            { id: "all", label: "Semua" },
                            { id: "ending-soon", label: "Segera Berakhir" },
                            { id: "popular", label: "Populer" },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                className={cn(
                                    "relative px-6 py-2 text-sm font-bold rounded-xl transition-colors duration-300 z-10",
                                    tab.id === "all" ? "text-white" : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                                )}
                            >
                                {tab.id === "all" && (
                                    <motion.div
                                        layoutId="activeTabLelang"
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

                {/* Auction Section Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
                            <Flame className="w-5 h-5 text-brand-primary animate-bounce" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Lelang Berlangsung</h2>
                            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{totalCount} ITEM TERSEDIA</p>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-zinc-500 font-medium tracking-tight">Sinkronisasi data lelang real-time...</p>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        {listings.length > 0 ? (
                            <motion.div
                                key={`${categoryFilter}-${pageFilter}-${sortFilter}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-12"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
                                    {listings.map((auction, i) => (
                                        <motion.div
                                            key={auction.listing_id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                        >
                                            <AuctionCard auction={auction} />
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
                                className="py-24 text-center bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-dashed border-zinc-200 dark:border-zinc-800 rounded-[2rem]"
                            >
                                <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-8 h-8 text-zinc-400" />
                                </div>
                                <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight">Belum ada lelang yang aktif</h2>
                                <p className="text-zinc-500">Item lelang mungkin sedang dalam moderasi atau sudah berakhir.</p>
                                <button
                                    onClick={() => router.push("/lelang")}
                                    className="mt-6 px-8 py-3 bg-brand-primary text-white rounded-2xl font-black hover:bg-brand-primary-dark transition-all shadow-xl shadow-brand-primary/20"
                                >
                                    Reset Semua Pencarian
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}

function HeroStatCard({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
    return (
        <div className="bg-white/10 backdrop-blur-xl p-6 rounded-[2rem] border border-white/20 flex flex-col items-center justify-center text-center min-w-[140px]">
            <Icon className="w-6 h-6 text-white/50 mb-3" />
            <div className="text-2xl font-black text-white mb-1 leading-none">{value}</div>
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{label}</div>
        </div>
    );
}

function AuctionCard({ auction }: { auction: any }) {
    const logo = logoMap[auction.game];
    const timeLeft = auction.auction_ends_at ? new Date(auction.auction_ends_at).getTime() - Date.now() : 0;
    const isEndingSoon = timeLeft < 1000 * 60 * 60 && timeLeft > 0;

    return (
        <Link
            href={`/listings/${auction.listing_id}`}
            className={cn(
                "group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] overflow-hidden flex flex-col h-full transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_25px_50px_-12px_rgba(99,102,241,0.25)] hover:border-brand-primary shadow-xl",
                isEndingSoon && "border-orange-500 dark:border-orange-500 shadow-orange-500/10"
            )}
        >
            <div className={cn(
                "relative h-56 flex items-center justify-center overflow-hidden",
                isEndingSoon ? "bg-gradient-to-br from-orange-500/10 to-transparent" : "bg-gradient-to-br from-brand-primary/5 to-transparent"
            )}>
                {logo ? (
                    <div className="relative w-28 h-28 transform group-hover:scale-125 transition-transform duration-700 ease-out z-10">
                        <Image src={logo} alt={auction.game} fill className="object-contain drop-shadow-2xl" />
                    </div>
                ) : (
                    <div className="w-20 h-20 rounded-[2rem] bg-brand-primary/10 flex items-center justify-center text-4xl font-black text-brand-primary z-10">
                        {auction.game.charAt(0)}
                    </div>
                )}

                {/* Visual badges */}
                <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 scale-90 md:scale-100 origin-top-right">
                    <div className="bg-brand-primary text-white text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg shadow-brand-primary/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                        LIVE
                    </div>
                    {isEndingSoon && (
                        <div className="bg-orange-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg shadow-orange-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                            ENDING SOON
                        </div>
                    )}
                </div>

                {/* Real-time Counter Badge */}
                <div className="absolute bottom-4 left-4 right-4 z-20">
                    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-2 flex items-center justify-between">
                        <span className="text-white/60 text-[10px] font-bold uppercase tracking-wider">Ends In</span>
                        {auction.auction_ends_at && (
                            <Countdown targetDate={new Date(auction.auction_ends_at)} className="text-sm font-mono font-black text-white tracking-tighter" />
                        )}
                    </div>
                </div>
            </div>

            <div className="p-6 flex-1 flex flex-col relative z-20 bg-white dark:bg-zinc-900">
                <div className="flex items-center gap-2 mb-4">
                    <Badge variant="secondary" className="text-[10px] font-black px-2.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover:bg-brand-primary group-hover:text-white transition-all">
                        {auction.game}
                    </Badge>
                    <span className="text-[10px] font-black text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full">
                        {auction.bidCount} BIDS
                    </span>
                </div>

                <h3 className="font-bold text-zinc-900 dark:text-white text-lg mb-4 line-clamp-2 leading-tight group-hover:text-brand-primary transition-colors min-h-[3rem]">
                    {auction.title}
                </h3>

                <div className="mt-auto space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden relative border border-zinc-200/50 dark:border-zinc-700/50">
                            {auction.seller.avatar_url ? (
                                <Image src={auction.seller.avatar_url} alt={auction.seller.name} fill className="object-cover" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-zinc-400">
                                    {auction.seller.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <span className="text-xs text-zinc-500 font-bold truncate max-w-[120px]">
                            {auction.seller.name}
                        </span>
                        {auction.seller.is_verified && (
                            <div className="w-3.5 h-3.5 bg-brand-primary rounded-full flex items-center justify-center">
                                <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 text-white fill-current"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>
                            </div>
                        )}
                    </div>

                    <div className="pt-5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">
                                High Bid
                            </p>
                            <p className="text-2xl font-black text-brand-primary tracking-tight">
                                Rp {(auction.current_bid || auction.price).toLocaleString("id-ID")}
                            </p>
                        </div>
                        <button className="w-12 h-12 rounded-[1.25rem] bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-all duration-500 shadow-sm border border-zinc-100 dark:border-zinc-700">
                            <ArrowRight className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function LelangPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-zinc-50 dark:bg-black pt-24 pb-12 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <LelangContent />
        </Suspense>
    );
}
