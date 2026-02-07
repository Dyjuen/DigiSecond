"use client";

import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    className,
}: PaginationProps) {
    if (totalPages <= 1) return null;

    const renderPageNumbers = () => {
        const pages: React.ReactNode[] = [];
        const showThreshold = 2; // Number of pages to show around current page

        // Always show first page
        pages.push(
            <PageButton
                key={1}
                page={1}
                active={currentPage === 1}
                onClick={() => onPageChange(1)}
            />
        );

        if (currentPage > showThreshold + 2) {
            pages.push(
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key="dots-1"
                    className="px-2 text-zinc-400"
                >
                    <MoreHorizontal className="w-4 h-4" />
                </motion.span>
            );
        }

        // Show pages around current
        for (
            let i = Math.max(2, currentPage - showThreshold);
            i <= Math.min(totalPages - 1, currentPage + showThreshold);
            i++
        ) {
            pages.push(
                <PageButton
                    key={i}
                    page={i}
                    active={currentPage === i}
                    onClick={() => onPageChange(i)}
                />
            );
        }

        if (currentPage < totalPages - showThreshold - 1) {
            pages.push(
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key="dots-2"
                    className="px-2 text-zinc-400"
                >
                    <MoreHorizontal className="w-4 h-4" />
                </motion.span>
            );
        }

        // Always show last page
        if (totalPages > 1) {
            pages.push(
                <PageButton
                    key={totalPages}
                    page={totalPages}
                    active={currentPage === totalPages}
                    onClick={() => onPageChange(totalPages)}
                />
            );
        }

        return pages;
    };

    return (
        <nav className={cn("flex items-center justify-center gap-3 py-8", className)}>
            <motion.button
                whileHover={{ x: -2, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2.5 rounded-xl bg-white/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-zinc-800 hover:border-brand-primary/50 hover:shadow-lg hover:shadow-brand-primary/5 transition-all text-zinc-600 dark:text-zinc-400 hover:text-brand-primary"
                aria-label="Previous page"
            >
                <ChevronLeft className="w-5 h-5" />
            </motion.button>

            <div className="flex items-center gap-1.5 p-1.5 bg-zinc-100/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl">
                <AnimatePresence mode="popLayout">
                    {renderPageNumbers()}
                </AnimatePresence>
            </div>

            <motion.button
                whileHover={{ x: 2, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2.5 rounded-xl bg-white/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-zinc-800 hover:border-brand-primary/50 hover:shadow-lg hover:shadow-brand-primary/5 transition-all text-zinc-600 dark:text-zinc-400 hover:text-brand-primary"
                aria-label="Next page"
            >
                <ChevronRight className="w-5 h-5" />
            </motion.button>
        </nav>
    );
}

const PageButton = React.forwardRef<HTMLButtonElement, {
    page: number;
    active: boolean;
    onClick: () => void;
}>(({ page, active, onClick }, ref) => {
    return (
        <motion.button
            ref={ref}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={cn(
                "relative w-10 h-10 rounded-xl text-sm font-bold transition-all duration-300",
                active
                    ? "text-white shadow-lg shadow-brand-primary/25"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-800 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
            )}
        >
            {active && (
                <motion.div
                    layoutId="pagination-pill"
                    className="absolute inset-0 bg-brand-primary rounded-xl -z-10"
                    transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                />
            )}
            <span className="relative z-10">{page}</span>
        </motion.button>
    );
});
PageButton.displayName = "PageButton";
