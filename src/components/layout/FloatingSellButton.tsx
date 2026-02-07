"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { uiEvents } from "@/lib/ui-events";

export function FloatingSellButton() {
    const pathname = usePathname();
    const [isHidden, setIsHidden] = useState(false);

    useEffect(() => {
        const unsubscribe = uiEvents.subscribe((isOpen) => setIsHidden(isOpen));
        return () => { unsubscribe(); };
    }, []);

    // Only show on Marketplace (/listings) and Auction (/lelang) pages
    // Also support sub-paths like /listings?category=... but usually we want it on the main listing pages
    // Adapting logic to show if pathname starts with these
    const isMarketplace = pathname.startsWith("/listings");
    const isAuction = pathname.startsWith("/lelang");

    if (!isMarketplace && !isAuction) {
        return null;
    }

    return (
        <div
            className="fixed bottom-24 right-6 z-50 transition-transform duration-300 ease-in-out"
            style={{ transform: isHidden ? "translateX(200%)" : "none" }}
        >
            <Link
                href="/sell"
                className="group relative flex items-center justify-center w-14 h-14 bg-white dark:bg-zinc-800 text-brand-primary border-2 border-brand-primary rounded-full shadow-xl hover:scale-105 transition-all"
                title="Jual Barang"
            >
                <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform" />

                {/* Tooltip Label */}
                <span className="absolute right-full mr-3 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white px-3 py-1 rounded-lg text-sm font-medium shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Jual Barang
                </span>
            </Link>
        </div>
    );
}
