"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebarContext } from "./SidebarContext";
import { useState } from "react";
import Image from "next/image";
import logoImage from "@/assets/icons/logotrans.png";
import { motion, AnimatePresence } from "motion/react";
import {
    LayoutDashboard,
    Users,
    HeadphonesIcon,
    Package,
    History,
    AlertTriangle,
    Settings,
    ChevronDown,
    X,
    GripVertical
} from "lucide-react";

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
                icon: <LayoutDashboard className="w-5 h-5" />,
            },
            {
                title: "User Management",
                href: "/admin/users",
                icon: <Users className="w-5 h-5" />,
            },
            {
                title: "Customer Support",
                href: "/admin/support",
                icon: <HeadphonesIcon className="w-5 h-5" />,
            },
        ],
    },
    {
        label: "MARKETPLACE",
        items: [
            {
                title: "Listings",
                icon: <Package className="w-5 h-5" />,
                items: [
                    { title: "All Listings", href: "/admin/listings" },
                    { title: "Pending Approval", href: "/admin/listings/pending" },
                ],
            },
            {
                title: "Transactions",
                href: "/admin/transactions",
                icon: <History className="w-5 h-5" />,
            },
            {
                title: "Disputes",
                href: "/admin/disputes",
                icon: <AlertTriangle className="w-5 h-5" />,
            },
        ],
    },
    {
        label: "SETTINGS",
        items: [
            {
                title: "Configuration",
                href: "/admin/settings",
                icon: <Settings className="w-5 h-5" />,
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
                    {/* Logo Area */}
                    <div className="flex items-center justify-center relative w-full px-2 mb-10">
                        <Link href="/admin" className="relative flex items-center justify-center group w-full">
                            <div className="relative w-48 h-14">
                                <Image
                                    src={logoImage}
                                    alt="DigiSecond"
                                    fill
                                    className="object-contain object-center"
                                    priority
                                />
                            </div>
                        </Link>

                        {isMobile && (
                            <button onClick={toggleSidebar} className="absolute right-2 p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                <X className="w-5 h-5 text-zinc-500" />
                            </button>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto custom-scrollbar">
                        {NAV_DATA.map((section) => (
                            <div key={section.label} className="mb-6">
                                <h3 className="px-5 mb-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] opacity-80">
                                    {section.label}
                                </h3>
                                <ul className="space-y-1">
                                    {section.items.map((item) => (
                                        <li key={item.title}>
                                            {item.items ? (
                                                <>
                                                    <button
                                                        onClick={() => toggleExpanded(item.title)}
                                                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-semibold transition-all duration-300
                                                            ${item.items.some((sub) => pathname === sub.href)
                                                                ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                                                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5"
                                                            }`}
                                                    >
                                                        <div className={`transition-transform duration-300 ${expandedItems.includes(item.title) ? "scale-110" : "scale-100"}`}>
                                                            {item.icon}
                                                        </div>
                                                        <span className="flex-1 text-left">{item.title}</span>
                                                        <ChevronDown
                                                            className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${expandedItems.includes(item.title) ? "rotate-180" : ""}`}
                                                        />
                                                    </button>
                                                    <AnimatePresence>
                                                        {expandedItems.includes(item.title) && (
                                                            <motion.ul
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: "auto", opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                                className="ml-6 border-l border-zinc-100 dark:border-white/5 mt-1 space-y-1 overflow-hidden"
                                                            >
                                                                {item.items.map((subItem) => (
                                                                    <li key={subItem.href}>
                                                                        <Link
                                                                            href={subItem.href}
                                                                            className={`block px-5 py-2.5 rounded-xl text-sm transition-all duration-200
                                                                                ${pathname === subItem.href
                                                                                    ? "text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50/50 dark:bg-indigo-500/5"
                                                                                    : "text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                                                                                }`}
                                                                        >
                                                                            {subItem.title}
                                                                        </Link>
                                                                    </li>
                                                                ))}
                                                            </motion.ul>
                                                        )}
                                                    </AnimatePresence>
                                                </>
                                            ) : (
                                                <Link
                                                    href={item.href!}
                                                    className={`group flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-bold transition-all duration-300
                                                        ${pathname === item.href
                                                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25"
                                                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5"
                                                        }`}
                                                >
                                                    <div className={`transition-transform duration-300 ${pathname === item.href ? "scale-110" : "group-hover:scale-110"}`}>
                                                        {item.icon}
                                                    </div>
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
