"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { api } from "@/trpc/react";
import { Countdown } from "@/components/ui/countdown";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

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

interface FeaturedListingsProps {
    categorySlug: string;
    title: string;
    subtitle?: string;
    limit?: number;
}

export function FeaturedListings({ categorySlug, title, subtitle, limit = 4 }: FeaturedListingsProps) {
    const { data, isLoading } = api.listing.getAll.useQuery({
        category: categorySlug,
        limit: limit,
    });

    const listings = data?.listings || [];

    if (isLoading) return (
        <div className="py-20 flex justify-center">
            <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (listings.length === 0) return null;

    return (
        <section className="py-20 relative z-10">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row items-end justify-between mb-10 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
                            {title}
                        </h2>
                        {subtitle && (
                            <p className="text-zinc-600 dark:text-zinc-400">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    <Link
                        href={`/listings?category=${categorySlug}`}
                        className="group flex items-center gap-2 text-brand-primary font-semibold hover:text-brand-primary-dark transition-colors"
                    >
                        Lihat Semua
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {listings.map((listing, i) => {
                        const isAuction = listing.listing_type === "AUCTION";
                        return (
                            <motion.div
                                key={listing.listing_id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <Link
                                    href={`/listings/${listing.listing_id}`}
                                    className={`group relative rounded-2xl overflow-hidden flex flex-col transition-all duration-300 h-full ${isAuction
                                        ? "bg-white dark:bg-zinc-900 border-2 border-brand-primary/30 hover:border-brand-primary hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]"
                                        : "bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-brand-primary hover:shadow-lg hover:shadow-brand-primary/10"
                                        }`}
                                >
                                    {isAuction && (
                                        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-indigo-500/5 pointer-events-none"></div>
                                    )}

                                    <div className={`h-40 flex items-center justify-center relative ${isAuction ? "bg-gradient-to-br from-brand-primary/5 to-indigo-500/10" : "bg-zinc-100 dark:bg-zinc-800"
                                        }`}>
                                        {logoMap[listing.game] ? (
                                            <div className="relative w-20 h-20">
                                                <Image
                                                    src={logoMap[listing.game]}
                                                    alt={listing.game}
                                                    fill
                                                    className="object-contain group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold bg-brand-primary/10 text-brand-primary">
                                                {listing.game.charAt(0)}
                                            </div>
                                        )}

                                        {isAuction && (
                                            <div className="absolute top-3 right-3">
                                                <div className="bg-brand-primary text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                                                    LIVE
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4 flex-1 flex flex-col relative z-10">
                                        <div className="flex items-start justify-between mb-2">
                                            <Badge variant="secondary" className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                                {listing.game}
                                            </Badge>
                                            {isAuction && (
                                                <span className="text-[10px] font-medium text-brand-primary bg-brand-primary/10 px-1.5 py-0.5 rounded">
                                                    {listing.bidCount} bids
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="font-semibold text-zinc-900 dark:text-white text-base mb-1 transition-colors line-clamp-1 group-hover:text-brand-primary">
                                            {listing.title}
                                        </h3>

                                        <div className="mt-auto pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] text-zinc-500">
                                                    {isAuction ? "Highest Bid" : "Price"}
                                                </p>
                                                <p className="text-base font-bold text-brand-primary">
                                                    Rp {(isAuction && listing.current_bid ? listing.current_bid : listing.price).toLocaleString("id-ID")}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
