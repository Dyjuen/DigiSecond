"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Check, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SortOption {
    id: string;
    label: string;
}

interface SortDropdownProps {
    options: SortOption[];
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export function SortDropdown({ options, value, onChange, className }: SortDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.id === value) || options[0];

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className={cn("relative z-20", className)} ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "h-12 px-5 flex items-center gap-3 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl",
                    "text-zinc-900 dark:text-white font-bold text-sm transition-all duration-300",
                    "hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 active:scale-95",
                    isOpen && "border-indigo-500 ring-2 ring-indigo-500/10"
                )}
            >
                <ArrowUpDown className="w-4 h-4 text-indigo-500" />
                <span className="flex-1 text-left min-w-[120px]">{selectedOption?.label}</span>
                <ChevronDown
                    className={cn(
                        "w-4 h-4 text-zinc-500 transition-transform duration-300",
                        isOpen && "rotate-180 text-indigo-500"
                    )}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 4, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden py-2"
                    >
                        {options.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => {
                                    onChange(option.id);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "w-full px-4 py-3 flex items-center justify-between text-sm font-medium transition-colors",
                                    value === option.id
                                        ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10"
                                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                                )}
                            >
                                {option.label}
                                {value === option.id && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                    >
                                        <Check className="w-4 h-4" />
                                    </motion.div>
                                )}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
