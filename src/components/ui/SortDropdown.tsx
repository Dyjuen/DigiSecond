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
            <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "h-12 px-5 flex items-center gap-3 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-xl",
                    "text-zinc-900 dark:text-white font-bold text-sm transition-all duration-300",
                    "hover:border-brand-primary hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]",
                    isOpen && "border-brand-primary ring-4 ring-brand-primary/10 shadow-[0_0_25px_rgba(99,102,241,0.2)]"
                )}
            >
                <div className="p-1.5 rounded-lg bg-brand-primary/10 text-brand-primary">
                    <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
                <span className="flex-1 text-left min-w-[120px] whitespace-nowrap">{selectedOption?.label}</span>
                <ChevronDown
                    className={cn(
                        "w-4 h-4 text-zinc-400 transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)",
                        isOpen && "rotate-180 text-brand-primary"
                    )}
                />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.9, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 6, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: 15, scale: 0.9, filter: "blur(10px)" }}
                        transition={{
                            type: "spring",
                            damping: 25,
                            stiffness: 400,
                            mass: 0.8
                        }}
                        className="absolute top-full left-0 md:right-0 mt-2 min-w-[200px] bg-white/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden py-2"
                    >
                        <div className="px-3 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800 mb-1">
                            Urutkan Berdasarkan
                        </div>
                        {options.map((option, idx) => (
                            <motion.button
                                key={option.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => {
                                    onChange(option.id);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "w-full px-4 py-3 flex items-center justify-between text-sm font-medium transition-all duration-200 group relative",
                                    value === option.id
                                        ? "text-brand-primary bg-brand-primary/10"
                                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-white"
                                )}
                            >
                                <span className="relative z-10">{option.label}</span>
                                {value === option.id && (
                                    <motion.div
                                        layoutId="active-check"
                                        className="relative z-10"
                                    >
                                        <Check className="w-4 h-4 text-brand-primary" />
                                    </motion.div>
                                )}
                                <div className="absolute inset-y-0 left-0 w-1 bg-brand-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-200 rounded-r-full" />
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
