"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ListingCarouselProps<T> {
    items: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    title?: string;
    subtitle?: string;
    className?: string;
}

export function ListingCarousel<T>({
    items,
    renderItem,
    title,
    subtitle,
    className,
}: ListingCarouselProps<T>) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
        }
    };

    useEffect(() => {
        const currentRef = scrollRef.current;
        if (currentRef) {
            currentRef.addEventListener("scroll", checkScroll);
            // Initial check
            checkScroll();
            // Handle window resize
            window.addEventListener("resize", checkScroll);
        }
        return () => {
            currentRef?.removeEventListener("scroll", checkScroll);
            window.removeEventListener("resize", checkScroll);
        };
    }, [items]);

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const { clientWidth } = scrollRef.current;
            const scrollAmount = clientWidth > 600 ? clientWidth * 0.8 : clientWidth * 0.9;
            scrollRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    if (items.length === 0) return null;

    return (
        <section className={cn("py-12 relative overflow-hidden group/carousel", className)}>
            <div className="container mx-auto px-6">
                {(title || subtitle) && (
                    <div className="flex items-end justify-between mb-8 gap-4">
                        <div className="flex-1">
                            {title && (
                                <motion.h2
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className="text-2xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-2"
                                >
                                    {title}
                                </motion.h2>
                            )}
                            {subtitle && (
                                <motion.p
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    viewport={{ once: true }}
                                    className="text-zinc-500 dark:text-zinc-400 max-w-2xl"
                                >
                                    {subtitle}
                                </motion.p>
                            )}
                        </div>

                        <div className="hidden md:flex items-center gap-3">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => scroll("left")}
                                disabled={!canScrollLeft}
                                className={cn(
                                    "w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300 backdrop-blur-md",
                                    canScrollLeft
                                        ? "bg-white/80 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white shadow-lg hover:border-brand-primary hover:text-brand-primary"
                                        : "bg-zinc-50/50 dark:bg-zinc-900/30 border-zinc-100 dark:border-zinc-800/50 text-zinc-300 dark:text-zinc-700 cursor-not-allowed"
                                )}
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => scroll("right")}
                                disabled={!canScrollRight}
                                className={cn(
                                    "w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300 backdrop-blur-md",
                                    canScrollRight
                                        ? "bg-white/80 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white shadow-lg hover:border-brand-primary hover:text-brand-primary"
                                        : "bg-zinc-50/50 dark:bg-zinc-900/30 border-zinc-100 dark:border-zinc-800/50 text-zinc-300 dark:text-zinc-700 cursor-not-allowed"
                                )}
                            >
                                <ChevronRight className="w-6 h-6" />
                            </motion.button>
                        </div>
                    </div>
                )}

                <div
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-8 pt-2 -mx-4 px-4 pr-[20%] md:pr-0"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {items.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30, scale: 0.9 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{
                                delay: index * 0.1,
                                type: "spring",
                                damping: 20,
                                stiffness: 100
                            }}
                            viewport={{ once: true, margin: "-50px" }}
                            className="w-[280px] md:w-[320px] lg:w-[350px] flex-shrink-0 snap-start"
                        >
                            {renderItem(item, index)}
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Gradient Mask on edges for small screens */}
            <div className="absolute top-0 right-0 bottom-0 w-24 bg-gradient-to-l from-zinc-50 dark:from-black to-transparent pointer-events-none z-10 md:hidden" />
            <div className="absolute top-0 left-0 bottom-0 w-24 bg-gradient-to-r from-zinc-50 dark:from-black to-transparent pointer-events-none z-10 md:hidden" />
        </section>
    );
}
