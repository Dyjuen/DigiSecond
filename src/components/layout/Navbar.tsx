"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Image from "next/image";
import logoImage from "@/assets/icons/logotrans.png";

interface NavItem {
    label: string;
    href: string;
    description?: string;
}

const navItems: NavItem[] = [
    { label: "Marketplace", href: "/listings", description: "Jelajahi semua listing" },
    { label: "Jual", href: "/sell", description: "Mulai jual barang digital" },
    { label: "Bantuan", href: "/help", description: "FAQ & Support" },
];

export function Navbar() {
    const [isScrolled, setIsScrolled] = React.useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const pathname = usePathname();

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu on route change
    React.useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                isScrolled
                    ? "bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50 shadow-sm"
                    : "bg-transparent border-transparent"
            )}
        >
            <nav className="max-w-7xl mx-auto px-6">
                <div className="h-16 flex items-center justify-between">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="relative w-32 h-10 md:w-40 md:h-12 transition-transform group-hover:scale-105">
                            <Image
                                src={logoImage}
                                alt="DigiSecond Logo"
                                fill
                                className="object-contain object-left"
                                sizes="(max-width: 768px) 128px, 160px"
                                priority
                            />
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "text-sm font-medium transition-colors relative group py-2",
                                    isActive(item.href)
                                        ? "text-brand-primary dark:text-brand-primary"
                                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                                )}
                            >
                                {item.label}
                                {isActive(item.href) && (
                                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                                )}
                                {!isActive(item.href) && (
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-zinc-400 dark:bg-zinc-600 rounded-full transition-all group-hover:w-full opacity-50" />
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        {/* Theme toggle */}
                        <ThemeToggle />

                        {/* Search button */}
                        <button
                            className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                            aria-label="Search"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>

                        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800" />

                        <Link href="/login">
                            <Button variant="ghost" size="sm" className="text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white">
                                Masuk
                            </Button>
                        </Link>
                        <Link href="/register">
                            <Button size="sm">
                                Daftar
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                        aria-expanded={isMobileMenuOpen}
                    >
                        <div className="w-6 h-6 relative">
                            <span className={cn(
                                "absolute left-0 w-6 h-0.5 bg-current transition-all duration-300",
                                isMobileMenuOpen ? "top-3 rotate-45" : "top-1.5"
                            )} />
                            <span className={cn(
                                "absolute left-0 top-3 w-6 h-0.5 bg-current transition-opacity duration-300",
                                isMobileMenuOpen ? "opacity-0" : "opacity-100"
                            )} />
                            <span className={cn(
                                "absolute left-0 w-6 h-0.5 bg-current transition-all duration-300",
                                isMobileMenuOpen ? "top-3 -rotate-45" : "top-[18px]"
                            )} />
                        </div>
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            <div
                className={cn(
                    "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
                    isMobileMenuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
                )}
            >
                <div className="px-6 py-4 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800/50">
                    {/* Mobile Search */}
                    <div className="relative mb-4">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="search"
                            placeholder="Cari listing..."
                            className="w-full h-11 pl-12 pr-4 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:border-brand-primary transition-colors"
                        />
                    </div>

                    {/* Mobile Nav Links */}
                    <div className="space-y-1 mb-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center justify-between p-3 rounded-xl transition-colors",
                                    isActive(item.href)
                                        ? "bg-zinc-100 dark:bg-zinc-800 text-brand-primary dark:text-white"
                                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-white"
                                )}
                            >
                                <div>
                                    <p className="font-medium">{item.label}</p>
                                    {item.description && (
                                        <p className="text-xs text-zinc-500 mt-0.5">{item.description}</p>
                                    )}
                                </div>
                                <svg className="w-5 h-5 text-zinc-400 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        ))}
                    </div>

                    {/* Mobile CTA */}
                    <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-zinc-600 dark:text-zinc-400">Tema</span>
                            <ThemeToggle />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Link href="/login">
                                <Button variant="outline" className="w-full border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300">
                                    Masuk
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button className="w-full">
                                    Daftar
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
