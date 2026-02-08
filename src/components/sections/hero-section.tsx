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
                            <div className="relative z-30">
                                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 sm:mb-6 text-zinc-900 dark:text-white leading-[1.1] tracking-tight">
                                    Trading Digital <br /> Goods{" "}
                                    <div className="mt-2 text-brand-primary flex flex-wrap items-center gap-3">
                                        <div className="relative inline-flex items-center">
                                            <TrueFocus
                                                sentence="Aman & Terpercaya"
                                                manualMode={false}
                                                blurAmount={5}
                                                borderColor="#6366f1"
                                                animationDuration={0.5}
                                                pauseBetweenAnimations={1}
                                            />
                                        </div>
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

                            <div className="relative group/card h-full perspective-[1000px]">
                                {/* Glow Effect behind card */}
                                <div className="absolute -inset-1 bg-gradient-to-r from-brand-primary to-purple-600 rounded-2xl blur-xl opacity-30 group-hover/card:opacity-60 transition duration-500"></div>

                                {isLoading ? (
                                    <div className="relative h-[400px] w-full rounded-2xl bg-zinc-900/90 border border-zinc-800 backdrop-blur-xl flex items-center justify-center shadow-2xl">
                                        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : listings.length > 0 ? (
                                    <div className="relative h-full rounded-2xl bg-zinc-900/80 border border-zinc-800/50 backdrop-blur-xl shadow-2xl overflow-hidden hover:border-brand-primary/30 transition-all duration-300 flex flex-col">
                                        {/* Card Header with Glass effect */}
                                        <div className="p-6 border-b border-zinc-800/50 bg-white/5 dark:bg-black/20">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                                    <h3 className="text-lg font-bold text-white tracking-tight">Featured Listings</h3>
                                                </div>
                                                <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-zinc-700 text-zinc-400 bg-zinc-800/50">Live Market</Badge>
                                            </div>

                                            {/* Listing Tabs */}
                                            <div className="flex gap-2 overflow-x-auto pb-1 -mx-2 px-2 scrollbar-none">
                                                {listings.map((listing, idx) => (
                                                    <button
                                                        key={listing.listing_id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedListing(idx);
                                                        }}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-300 border ${selectedListing === idx
                                                            ? "bg-brand-primary/20 border-brand-primary text-brand-primary shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                                                            : "bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                                                            }`}
                                                    >
                                                        {listing.game}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Card Content */}
                                        <div className="p-6 flex-1 flex flex-col relative">
                                            {/* Background Gradient Mesh */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-transparent pointer-events-none" />

                                            <div className="relative z-10 flex items-start gap-4 mb-4">
                                                <div className="relative">
                                                    <Avatar
                                                        name={listings[selectedListing].seller?.name || "Premium Seller"}
                                                        size="lg"
                                                    />
                                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-zinc-900 flex items-center justify-center">
                                                        <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-white text-base truncate">
                                                        {listings[selectedListing].seller?.name || "Premium Seller"}
                                                    </p>
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        <div className="flex text-amber-500">
                                                            {"★★★★★".split("").map((star, i) => (
                                                                <span key={i} className="text-xs">{star}</span>
                                                            ))}
                                                        </div>
                                                        <span className="text-[10px] text-zinc-500 font-medium ml-1">4.9/5.0</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <Link href={`/listings/${listings[selectedListing].listing_id}`} className="group/title relative z-10 block">
                                                <h4 className="text-xl font-black text-white mb-2 line-clamp-2 leading-tight group-hover/title:text-brand-primary transition-colors">
                                                    {listings[selectedListing].title}
                                                </h4>
                                            </Link>

                                            <p className="text-sm text-zinc-400 line-clamp-2 mb-6 relative z-10 leading-relaxed">
                                                {listings[selectedListing].description || "Akun premium dengan berbagai fitur eksklusif. Garansi 30 hari dan support penuh."}
                                            </p>

                                            <div className="mt-auto pt-4 border-t border-zinc-800/50 flex items-center justify-between relative z-10">
                                                <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-0.5">
                                                    {listings[selectedListing].listing_type === "AUCTION" ? "Current Bid" : "Current Price"}
                                                </p>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-sm font-semibold text-brand-primary">Rp</span>
                                                    <span className="text-2xl font-black text-white tracking-tight">
                                                        {(listings[selectedListing].current_bid ?? listings[selectedListing].starting_bid ?? listings[selectedListing].price).toLocaleString("id-ID")}
                                                    </span>
                                                </div>
                                                <Link href={`/listings/${listings[selectedListing].listing_id}`}>
                                                    <Button className="h-10 px-5 bg-white text-black hover:bg-zinc-200 font-bold rounded-xl transition-transform hover:-translate-y-0.5">
                                                        Beli Sekarang
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    // FALLBACK: Use hardcoded featured listings if API is empty/error
                                    <div className="relative h-full rounded-2xl bg-zinc-900/80 border border-zinc-800/50 backdrop-blur-xl shadow-2xl overflow-hidden hover:border-brand-primary/30 transition-all duration-300 flex flex-col">
                                        {/* Card Header with Glass effect */}
                                        <div className="p-6 border-b border-zinc-800/50 bg-white/5 dark:bg-black/20">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                                    <h3 className="text-lg font-bold text-white tracking-tight">Featured Listings</h3>
                                                </div>
                                                <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-zinc-700 text-zinc-400 bg-zinc-800/50">Hot Picks</Badge>
                                            </div>

                                            {/* Listing Tabs */}
                                            <div className="flex gap-2 overflow-x-auto pb-1 -mx-2 px-2 scrollbar-none">
                                                {featuredListings.map((listing, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedListing(idx);
                                                        }}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-300 border ${selectedListing === idx
                                                            ? "bg-brand-primary/20 border-brand-primary text-brand-primary shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                                                            : "bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                                                            }`}
                                                    >
                                                        {listing.game}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Card Content */}
                                        <div className="p-6 flex-1 flex flex-col relative">
                                            {/* Background Gradient Mesh */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-transparent pointer-events-none" />

                                            <div className="relative z-10 flex items-start gap-4 mb-4">
                                                <div className="relative">
                                                    <Avatar
                                                        name={featuredListings[selectedListing].seller}
                                                        size="lg"
                                                    />
                                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-zinc-900 flex items-center justify-center">
                                                        <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-white text-base truncate">
                                                        {featuredListings[selectedListing].seller}
                                                    </p>
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        <div className="flex text-amber-500">
                                                            {"★★★★★".split("").map((star, i) => (
                                                                <span key={i} className="text-xs">{star}</span>
                                                            ))}
                                                        </div>
                                                        <span className="text-[10px] text-zinc-500 font-medium ml-1">4.9/5.0</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <h4 className="text-xl font-black text-white mb-2 line-clamp-2 leading-tight relative z-10">
                                                {featuredListings[selectedListing].title}
                                            </h4>

                                            <p className="text-sm text-zinc-400 line-clamp-2 mb-6 relative z-10 leading-relaxed">
                                                Akun premium dengan berbagai fitur eksklusif. Garansi 30 hari dan support penuh.
                                            </p>

                                            <div className="mt-auto pt-4 border-t border-zinc-800/50 flex items-center justify-between relative z-10">
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-0.5">Best Price</p>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-xl font-black text-white tracking-tight">
                                                            {featuredListings[selectedListing].price}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Link href="/listings">
                                                    <Button className="h-10 px-5 bg-white text-black hover:bg-zinc-200 font-bold rounded-xl transition-transform hover:-translate-y-0.5">
                                                        Lihat Detail
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
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
        </div >
    );
}
