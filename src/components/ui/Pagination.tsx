"use client";

import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
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
            pages.push(<span key="dots-1" className="px-2 text-zinc-400"><MoreHorizontal className="w-4 h-4" /></span>);
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
            pages.push(<span key="dots-2" className="px-2 text-zinc-400"><MoreHorizontal className="w-4 h-4" /></span>);
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
        <div className={cn("flex items-center justify-center gap-2 py-8", className)}>
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                aria-label="Previous page"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1">
                {renderPageNumbers()}
            </div>

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                aria-label="Next page"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    );
}

function PageButton({
    page,
    active,
    onClick,
}: {
    page: number;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-10 h-10 rounded-xl text-sm font-bold transition-all duration-300",
                active
                    ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/25"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
            )}
        >
            {page}
        </button>
    );
}
