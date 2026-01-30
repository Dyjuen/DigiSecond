"use client";

import { MotionValue, motion, useSpring, useTransform, useInView } from "motion/react";
import { useEffect, useState, useRef } from "react";

/**
 * COUNTER COMPONENT (Mechanical/Briefcase Style)
 * Supports Light/Dark mode with silver/dark metallic look.
 */

interface CounterProps {
    value: number;
    direction?: "up" | "down";
    fontSize?: number;
    padding?: number;
    gap?: number;
    borderRadius?: number;
    horizontalPadding?: number;
    textColor?: string;
    fontWeight?: string;
    containerStyle?: React.CSSProperties;
    counterStyle?: React.CSSProperties;
    digitStyle?: React.CSSProperties;
    places?: number[];
    className?: string;
}

const defaultContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
};

const defaultCounterStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
};

export default function Counter({
    value,
    fontSize = 100,
    padding = 0,
    gap = 8, // Tighter gap for lock mechanism
    borderRadius = 8,
    horizontalPadding = 8,
    textColor = "inherit",
    fontWeight = "inherit",
    containerStyle,
    counterStyle,
    digitStyle,
    className,
}: CounterProps) {
    const { height } = useFontHeight(fontSize);
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <span ref={ref} style={{ ...defaultContainerStyle, ...containerStyle }} className={className}>
            <span style={{ ...defaultCounterStyle, ...counterStyle, gap }}>
                {String(value).split("").map((digitStr, i) => {
                    const place = Math.pow(10, String(value).length - 1 - i);
                    return (
                        <div key={i} className="relative group perspective-500">
                            {/* Mechanical Lock / Briefcase Style Container */}
                            <div
                                className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700/50 rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_10px_rgba(0,0,0,0.3)] overflow-hidden flex items-center justify-center relative transform transition-transform duration-300 hover:scale-105"
                                style={{
                                    height: height * 1.3,
                                    width: (fontSize || 100) * 0.8,
                                    boxShadow: "inset 0 0 20px rgba(0,0,0,0.05)"
                                }}
                            >
                                {/* Cylinder Highlights - Top Sheen */}
                                <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white to-transparent pointer-events-none z-20 opacity-50 dark:opacity-10" />

                                {/* Cylinder Highlights - Bottom Shadow */}
                                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-20 dark:from-black/80" />

                                {/* Metallic edge highlights */}
                                <div className="absolute inset-x-0 top-0 h-[1px] bg-white/80 dark:bg-white/10 z-30" />
                                <div className="absolute inset-x-0 bottom-0 h-[1px] bg-black/10 dark:bg-black/80 z-30" />

                                {/* Inner Content - The Number Wheel */}
                                <div className="z-10 text-zinc-800 dark:text-white font-mono font-bold tracking-tighter" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                                    <Digit
                                        place={place}
                                        value={value}
                                        height={height}
                                        digitStyle={{
                                            ...digitStyle,
                                            height: height,
                                            width: "100%",
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            fontVariantNumeric: "tabular-nums"
                                        }}
                                        shouldAnimate={isInView}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </span>
        </span>
    );
}

function Digit({
    place,
    value,
    height,
    digitStyle,
    shouldAnimate,
}: {
    place: number;
    value: number;
    height: number;
    digitStyle?: React.CSSProperties;
    shouldAnimate: boolean;
}) {
    let valueRoundedToPlace = Math.floor(value / place);
    let animatedValue = useSpring(0, {
        stiffness: 50,
        damping: 15,
        mass: 0.8,
    });

    useEffect(() => {
        if (shouldAnimate) {
            animatedValue.set(valueRoundedToPlace);
        }
    }, [animatedValue, valueRoundedToPlace, shouldAnimate]);

    return (
        <div style={{ height, position: "relative", overflow: "hidden" }}>
            <motion.div style={{ y: useTransform(animatedValue, (v) => -1 * (v % 10) * height) }}>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((i, index) => ( // Extra 0 for smooth loop if needed, though %10 handles it mostly
                    <div key={index} style={{ ...digitStyle, height, fontSize: height * 0.8, lineHeight: `${height}px` }}>
                        {i}
                    </div>
                ))}
            </motion.div>
        </div>
    );
}

// Hook to measure font height
function useFontHeight(fontSize: number) {
    // For specific fonts or generic usage, we can approximate or measure.
    // Here we approximate based on fontSize
    return { height: fontSize };
}
