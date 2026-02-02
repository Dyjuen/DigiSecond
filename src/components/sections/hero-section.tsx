"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Marquee } from "@/components/sections/marquee";
import { Blur } from "@/components/sections/blur";
import TrueFocus from "@/components/effects/TrueFocus";
import Image from "next/image";
import { logoMap } from "@/assets/images/logo-map";
import { api } from "@/trpc/react";

const gameCategories = [
    { name: "Mobile Legends", color: "bg-blue-600" },
    { name: "Free Fire", color: "bg-orange-500" },
    { name: "PUBG Mobile", color: "bg-amber-500" },
    { name: "Genshin Impact", color: "bg-cyan-600" },
    { name: "Valorant", color: "bg-rose-500" },
    { name: "Roblox", color: "bg-purple-500" },
    { name: "Steam", color: "bg-slate-700" },
    { name: "PlayStation", color: "bg-blue-700" },
];

const featuredListings = [
    { game: "Mobile Legends", title: "Akun Sultan Full Skin", price: "Rp 2.500.000", seller: "GameMaster" },
    { game: "Genshin Impact", title: "AR 58 + 50 Character 5★", price: "Rp 1.800.000", seller: "PrimoDealer" },
    { game: "Valorant", title: "Radiant Account + Skins", price: "Rp 3.200.000", seller: "ValorantPro" },
];

export function HeroSection() {
    const [selectedListing, setSelectedListing] = React.useState(0);

    // Fetch real listings for the hero section
    const { data: listingsData, isLoading } = api.listing.getAll.useQuery({
        limit: 5,
    });

    const listings = listingsData?.listings || [];

    return (
        <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 relative overflow-hidden bg-transparent">
            {/* Main hero container - CARD STYLE */}
            <div className="max-w-7xl mx-auto relative h-full">
                <div className="relative border border-zinc-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl shadow-xl dark:shadow-2xl overflow-hidden bg-white/50 dark:bg-black/50 backdrop-blur-sm pt-4 sm:pt-8 md:pt-12 lg:pt-16 pb-0 px-4 sm:px-8 md:px-12 lg:px-16">

                    {/* Content */}
                    <div className="relative z-10 pb-12 lg:pb-16">
                        {/* Badge */}
                        <div className="mb-4 sm:mb-6">
                            <Badge variant="secondary" className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm bg-zinc-100/50 dark:bg-zinc-900/50 backdrop-blur-sm border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100">
                                Marketplace Digital #1 Indonesia
                                <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Badge>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                            {/* Left Content */}
                            <div>
                                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 sm:mb-6 text-zinc-900 dark:text-white leading-[1.1] tracking-tight">
                                    Trading Digital <br /> Goods{" "}
                                    <div className="mt-2 text-brand-primary flex items-center gap-3">
                                        <div className="relative inline-flex items-center">
                                            <span className="text-brand-primary/40 -mr-1 text-5xl md:text-6xl font-light">[</span>
                                            <TrueFocus
                                                sentence="Aman"
                                                manualMode={false}
                                                blurAmount={5}
                                                borderColor="#6366f1"
                                                animationDuration={0.5}
                                                pauseBetweenAnimations={1}
                                            />
                                            <span className="text-brand-primary/40 -ml-1 text-5xl md:text-6xl font-light">]</span>
                                        </div>
                                        <span className="text-zinc-400">&</span>
                                        <span className="text-zinc-900 dark:text-white">Terpercaya</span>
                                    </div>
                                </h1>

                                <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 mb-6 sm:mb-8 max-w-lg">
                                    Jual beli akun game, item, skin, dan aset digital dengan sistem escrow.
                                    Dana aman sampai barang diterima.
                                </p>

                                {/* CTA Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3 mb-6 sm:mb-8">
                                    <Link href="/listings" className="flex-1 sm:flex-initial">
                                        <Button className="w-full sm:w-auto h-11 sm:h-12 text-sm sm:text-base px-6 shadow-lg shadow-brand-primary/20" size="lg">
                                            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                            Jelajahi Marketplace
                                        </Button>
                                    </Link>

                                    <Link href="/register" className="flex-1 sm:flex-initial">
                                        <Button variant="outline" className="w-full sm:w-auto h-11 sm:h-12 text-sm sm:text-base px-6 border-zinc-300 dark:border-zinc-700 bg-white/50 dark:bg-black/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-900 dark:text-white" size="lg">
                                            Mulai Jualan
                                            <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Button>
                                    </Link>
                                </div>

                                {/* Trust badges */}
                                <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span>Escrow Aman</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span>24/7 Support</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span>Verified Sellers</span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative group/card h-full">
                                {isLoading ? (
                                    <Card className="shadow-2xl overflow-hidden border-zinc-200 dark:border-zinc-700 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md h-[400px] flex items-center justify-center">
                                        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                                    </Card>
                                ) : listings.length > 0 ? (
                                    <Card className="shadow-2xl overflow-hidden border-zinc-200 dark:border-zinc-700 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md hover:border-brand-primary/50 transition-all duration-300 h-full flex flex-col">
                                        <div className="p-4 sm:p-6 border-b border-zinc-100 dark:border-zinc-800">
                                            <div className="flex items-center justify-between mb-3 sm:mb-4">
                                                <CardTitle className="text-base sm:text-lg text-zinc-900 dark:text-white">Featured Listings</CardTitle>
                                                <Badge variant="outline" className="text-[10px] sm:text-xs border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400">Live</Badge>
                                            </div>

                                            {/* Listing tabs */}
                                            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                                                {listings.map((listing, idx) => (
                                                    <button
                                                        key={listing.listing_id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedListing(idx);
                                                        }}
                                                        className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${selectedListing === idx
                                                            ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20"
                                                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                                                            }`}
                                                    >
                                                        {listing.game}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <CardContent className="p-4 sm:p-6 flex-1 flex flex-col">
                                            <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                                                <Avatar
                                                    name={listings[selectedListing].seller?.name || "Premium Seller"}
                                                    size="lg"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-zinc-900 dark:text-white text-sm sm:text-base truncate">
                                                        {listings[selectedListing].seller?.name || "Premium Seller"}
                                                    </p>
                                                    <div className="flex items-center gap-0.5 text-amber-500">
                                                        {"★★★★★".split("").map((star, i) => (
                                                            <span key={i} className="text-xs sm:text-sm">{star}</span>
                                                        ))}
                                                        <span className="text-[10px] sm:text-xs text-zinc-500 ml-1">(4.9)</span>
                                                    </div>
                                                </div>
                                                <Badge variant="success" className="text-[10px] sm:text-xs flex-shrink-0">Verified</Badge>
                                            </div>

                                            <Link href={`/listings/${listings[selectedListing].listing_id}`} className="group/title">
                                                <CardTitle className="text-lg sm:text-xl mb-2 line-clamp-2 text-zinc-900 dark:text-white group-hover/title:text-brand-primary transition-colors">
                                                    {listings[selectedListing].title}
                                                </CardTitle>
                                            </Link>
                                            <CardDescription className="mb-4 text-xs sm:text-sm line-clamp-2 text-zinc-600 dark:text-zinc-400">
                                                {listings[selectedListing].description || "Akun premium dengan berbagai fitur eksklusif. Garansi 30 hari dan support penuh."}
                                            </CardDescription>

                                            <div className="mt-auto flex items-center justify-between pt-3 sm:pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                                <div>
                                                    <p className="text-[10px] sm:text-xs text-zinc-500">Harga</p>
                                                    <p className="text-xl sm:text-2xl font-bold text-brand-primary">
                                                        Rp {listings[selectedListing].price.toLocaleString("id-ID")}
                                                    </p>
                                                </div>
                                                <Link href={`/listings/${listings[selectedListing].listing_id}`}>
                                                    <Button size="sm" className="text-xs sm:text-sm h-8 sm:h-9">
                                                        Lihat Detail
                                                        <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </Button>
                                                </Link>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <Card className="shadow-2xl overflow-hidden border-zinc-200 dark:border-zinc-700 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md h-[400px] flex items-center justify-center">
                                        <p className="text-zinc-500">No featured listings found.</p>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="relative py-6 sm:py-10 w-full z-10 border-t border-zinc-200 dark:border-zinc-800/50 [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
                        <Marquee pauseOnHover speed={40} className="[--gap:1.5rem] py-4">
                            {gameCategories.map((category, index) => {
                                const logo = logoMap[category.name];
                                return (
                                    <div
                                        key={index}
                                        className={`
                                            group/item relative flex items-center gap-3 px-5 py-2.5 
                                            rounded-2xl bg-white dark:bg-zinc-900/50 
                                            border border-zinc-200 dark:border-zinc-800 
                                            backdrop-blur-sm cursor-pointer overflow-hidden
                                            transition-all duration-300 hover:scale-105 hover:border-brand-primary/50 shadow-sm
                                        `}
                                    >
                                        {/* Hover Glow Effect */}
                                        <div className={`absolute inset-0 opacity-0 group-hover/item:opacity-5 transition-opacity duration-300 ${category.color}`} />

                                        {/* Category Icon/Logo */}
                                        {logo ? (
                                            <div className="relative w-6 h-6 shrink-0 group-hover/item:scale-110 transition-transform">
                                                <Image
                                                    src={logo}
                                                    alt={category.name}
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>
                                        ) : (
                                            <div className={`w-2 h-2 rounded-full ${category.color} shadow-[0_0_8px_currentColor]`} />
                                        )}

                                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-200">
                                            {category.name}
                                        </span>
                                    </div>
                                );
                            })}
                        </Marquee>
                    </div>
                </div>
            </div>
        </div>
    );
}
