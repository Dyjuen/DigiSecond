"use client";

import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Search, ArrowRight, Loader2 } from "lucide-react";
import { Aurora } from "@/components/effects/Aurora";
import { logoMap } from "@/assets/images/logo-map";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function WishlistPage() {
    const { status } = useSession();
    const [page, setPage] = useState(1);

    const { data, isLoading, refetch } = api.wishlist.getUserWishlist.useQuery(
        { limit: 12, cursor: undefined }, // Pagination not fully implemented yet in UI for simplicity
        { enabled: status === "authenticated" }
    );

    const utils = api.useUtils();

    const toggleWishlist = api.wishlist.toggle.useMutation({
        onSuccess: () => {
            utils.wishlist.getUserWishlist.invalidate();
        }
    });

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-black pt-24 pb-12 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
            </div>
        );
    }

    if (status === "unauthenticated") {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-black pt-32 pb-12 flex flex-col items-center justify-center text-center px-4">
                <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                    <Heart className="w-10 h-10 text-zinc-400" />
                </div>
                <h1 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">Login Diperlukan</h1>
                <p className="text-zinc-500 mb-8 max-w-md">Silakan login terlebih dahulu untuk melihat dan menyimpan item listing favorit Anda.</p>
                <Link href="/auth/signin">
                    <Button size="lg" className="rounded-xl font-bold">
                        Login Sekarang
                    </Button>
                </Link>
            </div>
        );
    }

    const wishlists = data?.items || [];

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black pt-24 pb-12 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20 translate-y-[-20%]">
                <Aurora colorStops={["#ec4899", "#d946ef", "#8b5cf6"]} amplitude={0.8} />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6">
                <div className="mb-10">
                    <h1 className="text-4xl font-black text-zinc-900 dark:text-white mb-4 tracking-tight">
                        Wishlist Saya
                    </h1>
                    <p className="text-zinc-500 text-lg">
                        Koleksi item favorit yang Anda simpan.
                    </p>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-80 bg-zinc-100 dark:bg-zinc-900 rounded-[2rem] animate-pulse" />
                        ))}
                    </div>
                ) : wishlists.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence>
                            {wishlists.map((item) => (
                                <motion.div
                                    key={item.wishlist_id} // Use wishlist_id as key
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    layout
                                >
                                    <WishlistCard item={item} onRemove={() => toggleWishlist.mutate({ listingId: item.listing_id })} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="py-20 text-center bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-dashed border-zinc-200 dark:border-zinc-800 rounded-[2rem]">
                        <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Heart className="w-8 h-8 text-zinc-400" />
                        </div>
                        <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight">Wishlist Kosong</h2>
                        <p className="text-zinc-500 mb-8">Anda belum menyimpan item apapun ke dalam wishlist.</p>
                        <Link href="/listings">
                            <Button size="lg" className="rounded-xl font-bold bg-brand-primary hover:bg-brand-primary-dark">
                                Jelajahi Marketplace
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

function WishlistCard({ item, onRemove }: { item: any, onRemove: () => void }) {
    const logo = logoMap[item.game];

    return (
        <div className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] overflow-hidden flex flex-col h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="relative h-48 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
                {logo ? (
                    <div className="relative w-24 h-24 transform group-hover:scale-110 transition-transform duration-500">
                        <Image src={logo} alt={item.game} fill className="object-contain" />
                    </div>
                ) : (
                    <div className="text-4xl font-black text-zinc-300">
                        {item.game?.charAt(0)}
                    </div>
                )}

                <button
                    onClick={(e) => {
                        e.preventDefault();
                        onRemove();
                    }}
                    className="absolute top-4 right-4 p-2 bg-white dark:bg-black rounded-full shadow-lg text-red-500 hover:scale-110 transition-transform z-10"
                >
                    <Heart className="w-5 h-5 fill-current" />
                </button>

                <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                        {item.listing_type}
                    </span>
                </div>
            </div>

            <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-zinc-900 dark:text-white mb-2 line-clamp-2 leading-tight">
                    {item.title}
                </h3>
                <p className="text-brand-primary font-black text-lg mb-4">
                    Rp {(item.current_bid || item.price).toLocaleString("id-ID")}
                </p>

                <Link href={`/listings/${item.listing_id}`} className="mt-auto">
                    <Button variant="outline" className="w-full rounded-xl font-bold group-hover:bg-zinc-50 dark:group-hover:bg-zinc-800">
                        Lihat Detail <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </Link>
            </div>
        </div>
    )
}
