"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Image from "next/image";
import logoImage from "@/assets/icons/logotrans.png";
import { useSession, signOut } from "next-auth/react";
import { SearchOverlay } from "@/components/layout/SearchOverlay";

interface NavItem {
    label: string;
    href: string;
    description?: string;
    requiresRole?: ("SELLER" | "ADMIN")[];
}

const allNavItems: NavItem[] = [
    { label: "Marketplace", href: "/listings", description: "Jelajahi semua listing" },
    { label: "Lelang", href: "/lelang", description: "Ikuti lelang aktif" },
    { label: "Bantuan", href: "/help", description: "FAQ & Support" },
];

// User Profile Dropdown Component
function UserProfileDropdown() {
    const [isOpen, setIsOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const { data: session } = useSession();
    const router = useRouter();
    const user = session?.user;

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSignOut = async () => {
        setIsOpen(false);
        await signOut({ callbackUrl: "/" });
    };

    // Get initials for avatar
    const initials = user?.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U";

    // Role badge color based on Tier (except Admin)
    const isPro = user?.tier === "PRO" || user?.tier === "ENTERPRISE";
    const isAdmin = user?.role === "ADMIN";

    const roleBadgeClass = isAdmin
        ? "bg-red-500/10 text-red-500 border-red-500/20"
        : isPro
            ? "bg-brand-primary/10 text-brand-primary border-brand-primary/20"
            : "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700";

    // Display label
    const displayLabel = isAdmin ? "Admin" : (user?.tier === "PRO" ? "Pro Plan" : user?.tier === "ENTERPRISE" ? "Enterprise" : "Free Tier");

    return (
        <div ref={dropdownRef} className="relative">
            {/* Profile Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-2 p-1.5 rounded-xl transition-all duration-200",
                    isOpen
                        ? "bg-zinc-100 dark:bg-zinc-800"
                        : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                )}
            >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-primary to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                    {initials}
                </div>
                {/* Chevron */}
                <svg
                    className={cn(
                        "w-4 h-4 text-zinc-500 transition-transform duration-200",
                        isOpen && "rotate-180"
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown Menu */}
            <div
                className={cn(
                    "absolute right-0 top-full mt-2 w-64 origin-top-right transition-all duration-200",
                    isOpen
                        ? "opacity-100 scale-100 translate-y-0"
                        : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                )}
            >
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden">
                    {/* User Info Header */}
                    <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                                {initials}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-zinc-900 dark:text-white truncate">
                                    {user?.name}
                                </p>
                                <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                            </div>
                        </div>
                        <div className="mt-3">
                            <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", roleBadgeClass)}>
                                {displayLabel}
                            </span>
                        </div>
                    </div>


                    {/* Menu Items */}
                    <div className="p-2">
                        <Link
                            href="/profile"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                            <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>Profil Saya</span>
                        </Link>
                        <Link
                            href={user?.role === "ADMIN" ? "/admin" : "/dashboard"}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                            <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                            <span>{user?.role === "ADMIN" ? "Admin Panel" : "Dashboard"}</span>
                        </Link>
                        <Link
                            href="/transactions"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                            <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                            <span>Transaksi Saya</span>
                        </Link>
                        <Link
                            href="/settings"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                            <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>Pengaturan</span>
                        </Link>
                    </div>

                    {/* Logout */}
                    <div className="p-2 border-t border-zinc-100 dark:border-zinc-800">
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Keluar</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Mobile Profile Section Component
function MobileProfileSection() {
    const { data: session } = useSession();
    const user = session?.user;

    const handleSignOut = async () => {
        await signOut({ callbackUrl: "/" });
    };

    const initials = user?.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U";

    // Role badge color based on Tier (except Admin)
    const isPro = user?.tier === "PRO" || user?.tier === "ENTERPRISE";
    const isAdmin = user?.role === "ADMIN";

    const roleBadgeClass = isAdmin
        ? "bg-red-500/10 text-red-500 border-red-500/20"
        : isPro
            ? "bg-brand-primary/10 text-brand-primary border-brand-primary/20"
            : "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700";

    // Display label
    const displayLabel = isAdmin ? "Admin" : (user?.tier === "PRO" ? "Pro Plan" : user?.tier === "ENTERPRISE" ? "Enterprise" : "Free Tier");

    return (
        <div className="space-y-3">
            {/* User Info */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                    {initials}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-zinc-900 dark:text-white truncate">{user?.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full border font-medium", roleBadgeClass)}>
                            {displayLabel}
                        </span>
                    </div>
                </div>
            </div>

            {/* Profile Links */}
            <div className="space-y-1">
                <Link
                    href="/profile"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                    <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Profil Saya</span>
                </Link>
                <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                    <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <span>Dashboard</span>
                </Link>
                <Link
                    href="/transactions"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                    <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <span>Transaksi Saya</span>
                </Link>
            </div>

            {/* Logout Button */}
            <Button
                variant="outline"
                className="w-full border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                onClick={handleSignOut}
            >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Keluar
            </Button>
        </div>
    );
}

export function Navbar() {
    const [isScrolled, setIsScrolled] = React.useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const [isSearchOpen, setIsSearchOpen] = React.useState(false);

    // Only show auth-dependent content after initial load to prevent hydration mismatch
    const isLoading = status === "loading";
    const isAuthenticated = status === "authenticated" && session?.user;

    // Filter nav items based on user role
    const navItems = React.useMemo(() => {
        return allNavItems.filter(item => {
            if (!item.requiresRole) return true;
            if (!session?.user) return false;
            return item.requiresRole.includes(session.user.role as "SELLER" | "ADMIN");
        });
    }, [session]);

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
                        <div className="relative w-32 h-10 md:w-40 md:h-12 transition-transform">
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


                        {/* Wishlist button */}
                        <Link
                            href="/wishlist"
                            className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                            aria-label="Wishlist"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </Link>

                        {/* Search button */}
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                            aria-label="Search"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>



                        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800" />

                        {/* Show Profile or Auth Buttons based on session - only after hydration */}
                        {isLoading ? (
                            // Skeleton placeholder during loading to prevent hydration mismatch
                            <div className="w-20 h-8 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
                        ) : isAuthenticated ? (
                            <UserProfileDropdown />
                        ) : (
                            <>
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
                            </>
                        )}
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
            </nav >

            {/* Mobile Menu */}
            < div
                className={
                    cn(
                        "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
                        isMobileMenuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
                    )
                }
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

                        {isLoading ? (
                            <div className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
                        ) : isAuthenticated ? (
                            <MobileProfileSection />
                        ) : (
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
                        )}
                    </div>
                </div>
            </div >
            <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </header>
    );
}
