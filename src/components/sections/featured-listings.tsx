"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { api } from "@/trpc/react";
import { motion } from "motion/react";
import { ArrowRight, ChevronRight } from "lucide-react";
import { ListingCarousel } from "@/components/ui/ListingCarousel";
import { logoMap } from "@/assets/images/logo-map";
import { cn } from "@/lib/utils";

interface FeaturedListingsProps {
    categorySlug?: string;
    title: string;
    subtitle?: string;
    limit?: number;
}

export function FeaturedListings({ categorySlug, title, subtitle, limit = 8 }: FeaturedListingsProps) {
    const { data, isLoading } = api.listing.getAll.useQuery({
        category: categorySlug || undefined,
        limit: limit,
    });

    const listings = data?.listings || [];

    if (isLoading) return (
        <section className="py-20">
            <div className="container mx-auto px-6">
                <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse mb-4" />
                <div className="h-4 w-64 bg-zinc-100 dark:bg-zinc-900 rounded-md animate-pulse mb-10" />
                <div className="flex gap-6 overflow-hidden">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="w-[300px] h-[400px] bg-zinc-100 dark:bg-zinc-800/50 rounded-3xl animate-pulse shrink-0" />
                    ))}
                </div>
            </div>
        </section>
    );

    if (listings.length === 0) return null;

    return (
        <div className="container mx-auto px-6">
            <ListingCarousel
                title={title}
                subtitle={subtitle}
                items={listings}
                renderItem={(listing) => (
                    <FeaturedCard listing={listing} />
                )}
            />
        </div>
    );
}

function FeaturedCard({ listing }: { listing: any }) {
    const isAuction = listing.listing_type === "AUCTION";
    const logo = logoMap[listing.game];

    return (
        <Link
            href={`/listings/${listing.listing_id}`}
            className={cn(
                "group relative bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] overflow-hidden flex flex-col h-[420px] transition-all duration-500 hover:shadow-2xl hover:border-brand-primary/30",
                isAuction && "ring-1 ring-brand-primary/10"
            )}
        >
            <div className={cn(
                "relative h-48 flex items-center justify-center overflow-hidden shrink-0",
                isAuction ? "bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20" : "bg-zinc-100/30 dark:bg-zinc-800/30"
            )}>
                {logo ? (
                    <div className="relative w-24 h-24 transform group-hover:scale-125 transition-transform duration-700 ease-out z-10 text-zinc-900 dark:text-white">
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

                {isAuction && (
                    <div className="absolute top-4 right-4 z-20">
                        <div className="bg-brand-primary text-white text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg shadow-brand-primary/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                            LELANG
                        </div>
                    </div>
                )}
            </div>

            <div className="p-6 flex-1 flex flex-col relative z-20">
                <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className="text-[10px] font-bold px-2.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover:bg-brand-primary group-hover:text-white transition-colors duration-300">
                        {listing.game}
                    </Badge>
                </div>

                <h3 className="font-bold text-zinc-900 dark:text-white text-lg mb-3 line-clamp-2 leading-tight group-hover:text-brand-primary transition-colors">
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
                        <span className="text-xs text-zinc-500 font-bold truncate max-w-[120px]">
                            {listing.seller.name}
                        </span>
                        {listing.seller.is_verified && (
                            <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                                <svg viewBox="0 0 24 24" className="w-2 h-2 text-white fill-current"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>
                            </div>
                        )}
                    </div>

                    <div className="pt-5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                                {isAuction ? "Highest Bid" : "Price"}
                            </p>
                            <p className="text-xl font-black text-brand-primary tracking-tight">
                                Rp {(isAuction && listing.current_bid ? listing.current_bid : listing.price).toLocaleString("id-ID")}
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-all duration-300">
                            <ChevronRight className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
