"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebarContext } from "./SidebarContext";
import { useState } from "react";
import Image from "next/image";
import logoImage from "@/assets/images/digisecond-logo.png";

interface NavItem {
    title: string;
    href?: string;
    icon: React.ReactNode;
    items?: { title: string; href: string }[];
}

const NAV_DATA: { label: string; items: NavItem[] }[] = [
    {
        label: "MAIN MENU",
        items: [
            {
                title: "Dashboard",
                href: "/admin",
                icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                ),
            },
            {
                title: "User Management",
                href: "/admin/users",
                icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                ),
            },
            {
                title: "Customer Support",
                href: "/admin/support",
                icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                ),
            },
        ],
    },
    {
        label: "MARKETPLACE",
        items: [
            {
                title: "Listings",
                icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                ),
                items: [
                    { title: "All Listings", href: "/admin/listings" },
                    { title: "Pending Approval", href: "/admin/listings/pending" },
                ],
            },
            {
                title: "Transactions",
                href: "/admin/transactions",
                icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                ),
            },
            {
                title: "Disputes",
                href: "/admin/disputes",
                icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                ),
            },
        ],
    },
    {
        label: "SETTINGS",
        items: [
            {
                title: "Configuration",
                href: "/admin/settings",
                icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                ),
            },
        ],
    },
];

export function EnhancedSidebar() {
    const pathname = usePathname();
    const { isOpen, isMobile, setIsOpen, toggleSidebar } = useSidebarContext();
    const [expandedItems, setExpandedItems] = useState<string[]>([]);

    const toggleExpanded = (title: string) => {
        setExpandedItems((prev) =>
            prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
        );
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isMobile && isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    ${isMobile ? "fixed bottom-0 top-0 z-50" : "sticky top-0 h-screen"}
                    ${isOpen ? "w-full max-w-[290px]" : "w-0"}
                    overflow-hidden border-r border-zinc-200 dark:border-zinc-800 
                    bg-white dark:bg-zinc-900 transition-all duration-200
                `}
            >
                <div className="flex h-full flex-col py-6 px-4">
                    {/* Logo */}
                    <div className="flex items-center justify-between px-2 mb-8">
                        <Link href="/admin" className="flex items-center gap-2">
                            <div className="relative w-8 h-8">
                                <Image
                                    src={logoImage}
                                    alt="DigiSecond"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <span className="font-bold text-xl text-zinc-900 dark:text-white">
                                DigiSecond
                            </span>
                        </Link>

                        {isMobile && (
                            <button onClick={toggleSidebar} className="lg:hidden">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto custom-scrollbar">
                        {NAV_DATA.map((section) => (
                            <div key={section.label} className="mb-6">
                                <h3 className="px-2 mb-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                    {section.label}
                                </h3>
                                <ul className="space-y-1">
                                    {section.items.map((item) => (
                                        <li key={item.title}>
                                            {item.items ? (
                                                <>
                                                    <button
                                                        onClick={() => toggleExpanded(item.title)}
                                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                                                            ${item.items.some((sub) => pathname === sub.href)
                                                                ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                                                                : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                                            }`}
                                                    >
                                                        {item.icon}
                                                        <span className="flex-1 text-left">{item.title}</span>
                                                        <svg
                                                            className={`w-4 h-4 transition-transform ${expandedItems.includes(item.title) ? "rotate-180" : ""}`}
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>
                                                    {expandedItems.includes(item.title) && (
                                                        <ul className="ml-9 mt-1 space-y-1">
                                                            {item.items.map((subItem) => (
                                                                <li key={subItem.href}>
                                                                    <Link
                                                                        href={subItem.href}
                                                                        className={`block px-3 py-2 rounded-lg text-sm transition-colors
                                                                            ${pathname === subItem.href
                                                                                ? "text-indigo-600 dark:text-indigo-400 font-medium"
                                                                                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                                                                            }`}
                                                                    >
                                                                        {subItem.title}
                                                                    </Link>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </>
                                            ) : (
                                                <Link
                                                    href={item.href!}
                                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                                                        ${pathname === item.href
                                                            ? "bg-indigo-600 text-white"
                                                            : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                                        }`}
                                                >
                                                    {item.icon}
                                                    <span>{item.title}</span>
                                                </Link>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </nav>

                    {/* Footer */}
                    <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
                        <p className="text-xs text-zinc-500 dark:text-zinc-500 text-center">
                            © 2026 DigiSecond Admin
                        </p>
                    </div>
                </div>
            </aside>
        </>
    );
}
