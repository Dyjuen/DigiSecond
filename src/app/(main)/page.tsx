"use client";

import Link from "next/link";
import { HeroSection } from "@/components/sections/hero-section";
import { Navbar } from "@/components/layout/Navbar";
import { Aurora } from "@/components/effects/Aurora";
import CardSwap, { Card } from "@/components/effects/CardSwap";
import Counter from "@/components/ui/Counter";
import { Footer } from "@/components/layout/Footer";
import { GlowCard } from "@/components/ui/spotlight-card";
import { motion } from "motion/react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";


import { Marquee } from "@/components/sections/marquee";
import { FeaturedListings } from "@/components/sections/featured-listings";
import Image from "next/image";

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

// Payment Logos
import bcaLogo from "@/assets/images/bank-central-asia-(bca)-logo.svg";
import mandiriLogo from "@/assets/images/bank-mandiri-logo.svg";
import bniLogo from "@/assets/images/bank-negara-indonesia-(bni)-logo.svg";
import briLogo from "@/assets/images/bank-rakyat-indonesia-(bri)-logo.svg";
import gopayLogo from "@/assets/images/gopay-logo.svg";
import ovoLogo from "@/assets/images/Logo_ovo_purple.svg.png";
import danaLogo from "@/assets/images/dana-logo.svg";
import shopeepayLogo from "@/assets/images/shopeepay-logo.svg";
import qrisLogo from "@/assets/images/Logo_QRIS.svg.png";
import visaLogo from "@/assets/images/Visa_Inc._logo.svg.png";
import mastercardLogo from "@/assets/images/mclogo-for-footer.svg";
import alfamartLogo from "@/assets/images/Alfamart_logo.svg.png";
import indomaretLogo from "@/assets/images/Indomaret.svg.png";
import bsiLogo from "@/assets/images/Bank_Syariah_Indonesia.svg.png";

const popularGames = [
    { name: "Mobile Legends", logo: mobileLegendsLogo, href: "mobile-legends" },
    { name: "Free Fire", logo: freeFireLogo, href: "free-fire" },
    { name: "PUBG Mobile", logo: pubgLogo, href: "pubg-mobile" },
    { name: "Genshin Impact", logo: genshinLogo, href: "genshin-impact" },
    { name: "Valorant", logo: valorantLogo, href: "valorant" },
    { name: "Roblox", logo: robloxLogo, href: "roblox" },
    { name: "Steam", logo: steamLogo, href: "steam" },
    { name: "PlayStation", logo: playstationLogo, href: "playstation" },
    { name: "Nintendo", logo: nintendoLogo, href: "nintendo" },
];

export default function HomePage() {
    const { theme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch by waiting for client mount
    useEffect(() => {
        setMounted(true);
    }, []);



    return (
        <main className="min-h-screen bg-zinc-50 dark:bg-black relative selection:bg-brand-primary selection:text-white">
            <Navbar />

            {/* GLOBAL AURORA BACKGROUND - Only render after mount to prevent hydration mismatch */}
            {mounted && (
                <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                    {resolvedTheme === "light" ? (
                        <div className="w-full h-full opacity-60">
                            <Aurora
                                key="light-aurora"
                                colorStops={["#6366f1", "#a5b4fc", "#c7d2fe"]}
                                blend={0.5}
                                amplitude={1.0}
                                speed={0.3}
                                className="w-full h-full scale-110"
                            />
                        </div>
                    ) : (
                        <div className="w-full h-full opacity-50">
                            <Aurora
                                key="dark-aurora"
                                colorStops={["#6366f1", "#a5b4fc", "#6366f1"]}
                                blend={0.6}
                                amplitude={1.2}
                                speed={0.5}
                                className="w-full h-full scale-110"
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Hero Section */}
            <div className="relative z-10">
                <HeroSection />
            </div>

            {/* Features Section with CardSwap */}
            <section className="py-20 lg:py-32 relative z-10 overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                        {/* Left: Text Content */}
                        <div className="lg:w-1/2 text-left">
                            <h2 className="text-3xl lg:text-5xl font-bold text-zinc-900 dark:text-white mb-6 leading-tight">
                                Kenapa Harus <br />
                                <span className="text-brand-primary">DigiSecond</span>?
                            </h2>
                            <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
                                Kami menghadirkan standar baru dalam marketplace barang digital.
                                Keamanan, kecepatan, dan transparansi adalah prioritas utama kami untuk
                                memastikan pengalaman trading terbaik bagi Anda.
                            </p>

                            <div className="space-y-4">
                                {[
                                    "Sistem Escrow Otomatis",
                                    "Verifikasi Seller Ketat",
                                    "Support 24/7 Indonesia",
                                    "Garansi Uang Kembali"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-brand-primary/10 flex items-center justify-center">
                                            <svg className="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <span className="text-zinc-700 dark:text-zinc-300 font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: CardSwap Animation */}
                        <div className="lg:w-1/2 w-full flex justify-center h-[400px]">
                            <CardSwap cardDistance={40} verticalDistance={50} delay={4000} width={500} height={320}>
                                {/* Feature 1: Escrow */}
                                <Card customClass="flex flex-col bg-zinc-900 border border-zinc-700 overflow-hidden shadow-2xl">
                                    {/* Window Header */}
                                    <div className="h-10 bg-zinc-800/80 backdrop-blur-md border-b border-zinc-700 flex items-center px-4 gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                                        <div className="ml-2 px-2 py-0.5 rounded bg-zinc-900/50 border border-zinc-700/50 text-[10px] text-zinc-400 font-mono">
                                            secure_escrow.exe
                                        </div>
                                    </div>
                                    {/* Content */}
                                    <div className="flex-1 p-8 flex flex-col justify-center relative bg-gradient-to-br from-zinc-900 to-zinc-950">
                                        <div className="absolute top-1/2 right-6 -translate-y-1/2 p-4">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-brand-primary/20 blur-xl rounded-full"></div>
                                                <svg className="w-32 h-32 text-brand-primary drop-shadow-[0_0_15px_rgba(99,102,241,0.8)]" fill="none" viewBox="0 0 24 24">
                                                    <path stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" className="hidden" />
                                                    <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <h3 className="text-4xl font-bold text-white mb-2 relative z-10">
                                            100%
                                            <span className="text-brand-primary block text-lg font-normal tracking-wider mt-1">SECURED MONEY</span>
                                        </h3>
                                        <p className="text-zinc-400 text-sm mt-4 relative z-10 max-w-[80%]">
                                            Dana ditahan di sistem Escrow otomatis. Penjual tidak dibayar sampai Anda puas.
                                        </p>
                                    </div>
                                </Card>

                                {/* Feature 2: Verification */}
                                <Card customClass="flex flex-col bg-zinc-900 border border-zinc-700 overflow-hidden shadow-2xl">
                                    {/* Window Header */}
                                    <div className="h-10 bg-zinc-800/80 backdrop-blur-md border-b border-zinc-700 flex items-center px-4 gap-2">
                                        <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-xs text-zinc-300 font-medium">Verified Seller Protocol</span>
                                    </div>
                                    {/* Content */}
                                    <div className="flex-1 p-8 flex flex-col justify-center relative bg-gradient-to-br from-zinc-900 to-zinc-950">
                                        <div className="absolute top-1/2 right-4 -translate-y-1/2 w-24 h-24 bg-cyan-500/20 rounded-full blur-2xl animate-pulse" />
                                        <div className="flex items-baseline gap-2 relative z-10">
                                            <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                                                KTP
                                            </span>
                                            <span className="text-xl text-white font-bold">VERIFIED</span>
                                        </div>
                                        <div className="mt-6 flex items-center gap-3 relative z-10">
                                            <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded text-cyan-400 text-xs shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                                                Cek Identitas
                                            </div>
                                            <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded text-cyan-400 text-xs shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                                                Anti-Fraud
                                            </div>
                                        </div>
                                        <p className="text-zinc-400 text-sm mt-4 relative z-10">
                                            Setiap seller melewati proses verifikasi identitas ketat (KTP & Wajah) demi keamanan.
                                        </p>
                                    </div>
                                </Card>

                                {/* Feature 3: Speed */}
                                <Card customClass="flex flex-col bg-zinc-900 border border-zinc-700 overflow-hidden shadow-2xl">
                                    {/* Window Header */}
                                    <div className="h-10 bg-zinc-800/80 backdrop-blur-md border-b border-zinc-700 flex items-center px-4 gap-2">
                                        <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        <span className="text-xs text-zinc-300 font-medium">Instant Delivery</span>
                                    </div>
                                    {/* Content */}
                                    <div className="flex-1 p-8 flex flex-col justify-center relative bg-gradient-to-br from-zinc-900 to-zinc-950">
                                        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-amber-500/10 to-transparent" />
                                        <div className="relative z-10">
                                            <h3 className="text-6xl font-black text-white italic tracking-tighter shadow-black drop-shadow-lg">
                                                &lt;10<span className="text-2xl not-italic ml-1 text-amber-500">Mins</span>
                                            </h3>
                                            <div className="h-1 w-full bg-zinc-800 rounded-full mt-4 overflow-hidden">
                                                <div className="h-full bg-amber-500 w-[90%] shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                                            </div>
                                            <p className="text-zinc-400 text-sm mt-4">
                                                Rata-rata waktu penyelesaian transaksi. Sistem otomatis memproses pesanan Anda secara instan.
                                            </p>
                                        </div>
                                    </div>
                                </Card>

                                {/* Feature 4: Support (NEW) */}
                                <Card customClass="flex flex-col bg-zinc-900 border border-zinc-700 overflow-hidden shadow-2xl">
                                    {/* Window Header */}
                                    <div className="h-10 bg-zinc-800/80 backdrop-blur-md border-b border-zinc-700 flex items-center px-4 gap-2">
                                        <div className="w-3 h-3 rounded-full bg-purple-500/20 border border-purple-500/50" />
                                        <div className="ml-2 px-2 py-0.5 rounded bg-zinc-900/50 border border-zinc-700/50 text-[10px] text-zinc-400 font-mono">
                                            live_support.agent
                                        </div>
                                    </div>
                                    {/* Content */}
                                    <div className="flex-1 p-8 flex flex-col justify-center relative bg-gradient-to-br from-zinc-900 to-zinc-950">
                                        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-purple-500/10 to-transparent" />

                                        <div className="flex items-center gap-4 mb-4 relative z-10">
                                            <div className="relative">
                                                <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-purple-500 flex items-center justify-center overflow-hidden">
                                                    <svg className="w-8 h-8 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-2 border-zinc-900 rounded-full"></div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-purple-400 font-bold tracking-wider mb-0.5">CUSTOMER SUCCESS</div>
                                                <div className="text-3xl font-bold text-white">Online 24/7</div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 relative z-10">
                                            <div className="flex items-center gap-2 text-sm text-zinc-300 bg-zinc-800/50 p-2 rounded border border-zinc-700/50">
                                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                Respon &lt; 5 Menit
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-zinc-300 bg-zinc-800/50 p-2 rounded border border-zinc-700/50">
                                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                Bantuan Bahasa Indonesia
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </CardSwap>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-20 lg:py-32 relative z-10">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl lg:text-5xl font-black text-zinc-900 dark:text-white mb-4"
                        >
                            Kategori Populer
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto"
                        >
                            Pilih platform favoritmu dan temukan penawaran terbaik dari ribuan seller terverifikasi.
                        </motion.p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4 lg:gap-6">
                        {popularGames.map((game, i) => (
                            <motion.div
                                key={game.name}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                className="w-[calc(50%-1rem)] md:w-[calc(33.33%-1.5rem)] lg:w-[calc(20%-1.5rem)]"
                            >
                                <Link
                                    href={`/listings?category=${game.href}`}
                                    className="group relative block aspect-[4/5] overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-brand-primary transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-brand-primary/10 hover:-translate-y-2"
                                >
                                    {/* Card Content */}
                                    <div className="absolute inset-0 p-6 flex flex-col items-center justify-between z-10">
                                        {/* Status Badge */}
                                        <div className="w-full flex justify-end">
                                            <div className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest group-hover:border-brand-primary/30 group-hover:text-brand-primary transition-colors">
                                                Active
                                            </div>
                                        </div>

                                        {/* Logo */}
                                        <div className="relative w-24 h-24 transform group-hover:scale-110 transition-transform duration-500 ease-out">
                                            <div className="absolute inset-0 bg-brand-primary blur-2xl opacity-0 group-hover:opacity-20 transition-opacity" />
                                            <Image
                                                src={game.logo}
                                                alt={game.name}
                                                fill
                                                className="object-contain drop-shadow-md"
                                                sizes="(max-width: 768px) 96px, 120px"
                                            />
                                        </div>

                                        {/* Info */}
                                        <div className="text-center">
                                            <h3 className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-brand-primary transition-colors">
                                                {game.name}
                                            </h3>
                                            <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-tighter mt-1">
                                                1200+ Listings
                                            </p>
                                        </div>
                                    </div>

                                    {/* Hover Background Accent */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Listings - Mobile Legends */}
            <FeaturedListings
                categorySlug="mobile-legends"
                title="Akun Sultan Mobile Legends"
                subtitle="Koleksi skin legend, collector, dan rank mythic terbaik."
                limit={4}
            />

            {/* Featured Listings - Free Fire */}
            <FeaturedListings
                categorySlug="free-fire"
                title="Free Fire Sultan"
                subtitle="Akun old, bundle langka, dan senjata evo level max."
                limit={4}
            />

            {/* Latest Listings - All Categories */}
            <FeaturedListings
                title="Listing Terbaru"
                subtitle="Jelajahi berbagai item dan akun digital terbaru di marketplace."
                limit={4}
            />



            {/* Partners Marquee Section */}
            <section className="py-10 relative z-10 border-t border-zinc-800/50 bg-zinc-950/30 backdrop-blur-sm overflow-hidden">
                <div className="container mx-auto px-6 mb-8 text-center">
                    <p className="text-sm font-semibold text-zinc-500 uppercase tracking-widest">
                        Mitra Pembayaran & Game Resmi
                    </p>
                </div>

                <Marquee className="[--gap:3rem] py-6 [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]" pauseOnHover speed={40}>
                    {[
                        { name: "BCA", logo: bcaLogo },
                        { name: "Mandiri", logo: mandiriLogo },
                        { name: "BNI", logo: bniLogo },
                        { name: "BRI", logo: briLogo },
                        { name: "BSI", logo: bsiLogo },
                        { name: "GoPay", logo: gopayLogo },
                        { name: "OVO", logo: ovoLogo },
                        { name: "Dana", logo: danaLogo },
                        { name: "ShopeePay", logo: shopeepayLogo },
                        { name: "QRIS", logo: qrisLogo },
                        { name: "Alfamart", logo: alfamartLogo },
                        { name: "Indomaret", logo: indomaretLogo },
                        { name: "Visa", logo: visaLogo },
                        { name: "Mastercard", logo: mastercardLogo },
                    ].map((partner) => (
                        <div key={partner.name} className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 hover:border-brand-primary hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all duration-300 cursor-default h-16 min-w-[140px] justify-center">
                            <div className="relative h-8 w-28">
                                <Image
                                    src={partner.logo}
                                    alt={partner.name}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </div>
                    ))}
                </Marquee>
            </section>

            {/* CTA Section */}
            <section className="py-20 lg:py-32 relative z-10">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-3xl p-8 lg:p-12 shadow-2xl relative overflow-hidden"
                    >
                        {/* Background Grid - Removed as per request */}
                        {/* <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div> */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
                            {/* Text & Buttons */}
                            <div className="lg:w-1/2 text-left">
                                <h2 className="text-3xl lg:text-5xl font-bold text-zinc-900 dark:text-white mb-6 leading-tight">
                                    Siap Mulai <span className="text-brand-primary">Trading?</span>
                                </h2>
                                <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8 max-w-xl">
                                    Bergabung dengan komunitas trader terbesar di Indonesia. Jual beli akun game aman, cepat, dan terpercaya.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Link
                                        href="/register"
                                        className="px-8 py-4 bg-brand-primary hover:bg-brand-primary-dark rounded-xl text-white font-bold shadow-lg shadow-brand-primary/25 transform hover:-translate-y-1 transition-all duration-300 text-center"
                                    >
                                        Daftar Gratis Sekarang
                                    </Link>
                                    <Link
                                        href="/listings"
                                        className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-white font-semibold border border-zinc-700 transition-all duration-300 text-center"
                                    >
                                        Lihat Marketplace
                                    </Link>
                                </div>
                            </div>

                            {/* Stats Counters - Horizontal Layout */}
                            <div className="flex flex-wrap justify-center lg:justify-end gap-4 md:gap-10">
                                <div className="flex flex-col items-center">
                                    <div className="flex items-end gap-2 text-zinc-900 dark:text-white">
                                        <span className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Rp</span>
                                        <Counter
                                            value={134}
                                            fontSize={50}
                                            textColor="inherit"
                                        />
                                        <span className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">M+</span>
                                    </div>
                                    <p className="text-xs md:text-sm text-zinc-500 mt-1">Total Transaksi</p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="flex items-end gap-2 text-zinc-900 dark:text-white">
                                        <Counter
                                            value={15}
                                            fontSize={50}
                                            textColor="inherit"
                                        />
                                        <span className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">RB+</span>
                                    </div>
                                    <p className="text-xs md:text-sm text-zinc-500 mt-1">Active Users</p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="flex items-end gap-2 text-zinc-900 dark:text-white">
                                        <Counter
                                            value={50}
                                            fontSize={50}
                                            textColor="inherit"
                                        />
                                        <span className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">+</span>
                                    </div>
                                    <p className="text-xs md:text-sm text-zinc-500 mt-1">Games Supported</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>


        </main >
    );
}
