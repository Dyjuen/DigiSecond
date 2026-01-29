"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

const CursorContext = createContext({
    active: false,
    setActive: (active: boolean) => { },
});

export const CursorProvider = ({ children }: { children: React.ReactNode }) => {
    const [active, setActive] = useState(false);
    return (
        <CursorContext.Provider value={{ active, setActive }}>
            {children}
        </CursorContext.Provider>
    );
};

export const CursorFollow = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);
    const [isVisible, setIsVisible] = useState(false);

    const springConfig = { damping: 25, stiffness: 300 };
    const springX = useSpring(cursorX, springConfig);
    const springY = useSpring(cursorY, springConfig);

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
            setIsVisible(true);
        };
        const handleMouseLeave = () => setIsVisible(false);
        const handleMouseEnter = () => setIsVisible(true);

        window.addEventListener("mousemove", moveCursor);
        document.body.addEventListener("mouseleave", handleMouseLeave);
        document.body.addEventListener("mouseenter", handleMouseEnter);

        return () => {
            window.removeEventListener("mousemove", moveCursor);
            document.body.removeEventListener("mouseleave", handleMouseLeave);
            document.body.removeEventListener("mouseenter", handleMouseEnter);
        };
    }, [cursorX, cursorY]);

    return (
        <motion.div
            className={cn(
                "fixed pointer-events-none z-[9999] flex items-center justify-center rounded-full bg-white px-4 py-1.5 text-sm font-medium text-black shadow-lg border border-zinc-200",
                className
            )}
            style={{
                x: springX,
                y: springY,
                translateX: "12px", // Offset to bottom-right
                translateY: "12px",
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
                opacity: isVisible ? 1 : 0,
                scale: isVisible ? 1 : 0
            }}
            transition={{ duration: 0.2 }}
        >
            {children}
        </motion.div>
    );
};

// Removed dot cursor component as we are using system cursor
export const Cursor = () => null;
