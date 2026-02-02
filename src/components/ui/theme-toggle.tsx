"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ className }: { className?: string }) {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    // Ensure we're mounted to prevent hydration mismatch
    React.useEffect(() => {
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        const nextTheme = resolvedTheme === "dark" ? "light" : "dark";

        // Check if the browser supports the View Transitions API
        if (!document.startViewTransition) {
            setTheme(nextTheme);
            return;
        }

        // With the View Transitions API:
        document.startViewTransition(() => {
            setTheme(nextTheme);
        });
    };

    // Prevent hydration mismatch - show placeholder until mounted
    if (!mounted) {
        return (
            <div className={cn("w-20 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse", className)} />
        );
    }

    const isDark = resolvedTheme === "dark";

    return (
        <button
            onClick={toggleTheme}
            className={cn(
                "relative flex h-10 w-20 items-center rounded-full p-1 transition-colors duration-500 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 dark:focus:ring-offset-black",
                isDark ? "bg-zinc-800" : "bg-zinc-200",
                className
            )}
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        >
            {/* Sliding Indicator */}
            <motion.div
                className="absolute h-8 w-8 rounded-full bg-white dark:bg-zinc-950 shadow-md flex items-center justify-center p-1.5"
                initial={false}
                animate={{
                    x: isDark ? 40 : 0,
                }}
                transition={{
                    type: "spring",
                    stiffness: 200, // Slower spring
                    damping: 25   // Smoother damping
                }}
            >
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={isDark ? "moon" : "sun"}
                        initial={{ opacity: 0, rotate: -90, scale: 0 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: 90, scale: 0 }}
                        transition={{ duration: 0.4 }} // Slower icon fade/rotate
                    >
                        {isDark ? (
                            <Moon className="w-5 h-5 text-indigo-400 fill-indigo-400/20" />
                        ) : (
                            <Sun className="w-5 h-5 text-amber-500 fill-amber-500/20" />
                        )}
                    </motion.div>
                </AnimatePresence>
            </motion.div>

            {/* Background Icons (Visible when not covered by indicator) */}
            <div className="flex w-full justify-between px-2.5">
                <Sun className={cn("w-4 h-4 transition-opacity duration-300", isDark ? "opacity-40" : "opacity-0")} />
                <Moon className={cn("w-4 h-4 transition-opacity duration-300", isDark ? "opacity-0" : "opacity-40")} />
            </div>
        </button>
    );
}

