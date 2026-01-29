"use client";

import { useSession, signOut } from "next-auth/react";
import { useSidebarContext } from "./SidebarContext";
import { useState } from "react";

export function EnhancedHeader() {
    const { data: session } = useSession();
    const { toggleSidebar, isMobile } = useSidebarContext();
    const [showUserMenu, setShowUserMenu] = useState(false);

    return (
        <header className="sticky top-0 z-30 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex h-16 items-center justify-between px-4 md:px-6">
                {/* Left: Mobile Menu + Title */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    <div className="hidden xl:block">
                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                            Admin Dashboard
                        </h2>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            DigiSecond Marketplace Control Panel
                        </p>
                    </div>
                </div>

                {/* Right: Search, Notifications, Theme, User */}
                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="hidden md:block relative">
                        <input
                            type="search"
                            placeholder="Search..."
                            className="w-64 px-4 py-2 pl-10 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* Notifications */}
                    <button className="relative p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <svg className="w-6 h-6 text-zinc-600 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                                {session?.user?.name?.charAt(0) || "A"}
                            </div>
                            <div className="hidden sm:block text-left">
                                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                                    {session?.user?.name || "Admin"}
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                    {session?.user?.role || "ADMIN"}
                                </p>
                            </div>
                            <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {showUserMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowUserMenu(false)}
                                />
                                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl z-50">
                                    <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
                                        <p className="text-sm font-medium text-zinc-900 dark:text-white">
                                            {session?.user?.email}
                                        </p>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                            {session?.user?.role}
                                        </p>
                                    </div>
                                    <div className="p-1">
                                        <button
                                            onClick={() => {
                                                setShowUserMenu(false);
                                                // Navigate to profile
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            Profile
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowUserMenu(false);
                                                signOut({ callbackUrl: "/admin-login" });
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded-md"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
