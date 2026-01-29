"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimation, PanInfo } from "motion/react";

interface ThreeDCarouselProps {
    items: React.ReactNode[];
    radius?: number; // Distance from center
    itemWidth?: number; // Width of each item
    itemHeight?: number; // Height of each item
    autoPlaySpeed?: number; // Rotations per second (approx)
}

export function ThreeDCarousel({
    items,
    radius = 400,
    itemWidth = 240,
    itemHeight = 320,
    autoPlaySpeed = 0.05
}: ThreeDCarouselProps) {
    const [rotation, setRotation] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number>();
    const lastTimeRef = useRef<number>(0);
    const rotationRef = useRef(0);

    const totalItems = items.length;
    const anglePerItem = 360 / totalItems;

    // Auto-rotation loop
    useEffect(() => {
        const animate = (time: number) => {
            if (!lastTimeRef.current) lastTimeRef.current = time;
            const delta = time - lastTimeRef.current;
            lastTimeRef.current = time;

            if (!isDragging) {
                // Adjust speed: degrees per millisecond
                rotationRef.current -= (autoPlaySpeed * delta) / 16;
                setRotation(rotationRef.current);
            }

            animationRef.current = requestAnimationFrame(animate);
        };
        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [isDragging, autoPlaySpeed]);

    const handleDragStart = () => {
        setIsDragging(true);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        lastTimeRef.current = 0; // Reset time to prevent huge jumps
    };

    const handleDrag = (_: any, info: PanInfo) => {
        // Dragging moves the rotation
        // horizontal drag delta (info.delta.x) maps to rotation
        rotationRef.current += info.delta.x * 0.5;
        setRotation(rotationRef.current);
    };

    return (
        <div
            className="relative w-full h-[500px] flex justify-center items-center perspective-[1600px] py-20"
            style={{
                perspective: "1600px",
                perspectiveOrigin: "50% 50%"
            }}
        >
            {/*
                This container holds the 3D scene.
                It rotates around the Y axis.
            */}
            {/*
                This container holds the 3D scene.
                It rotates around the Y axis.
                We use a 0x0 sized div as the geometric center to prevent "wobble" 
                caused by container width mismatches.
            */}
            <motion.div
                ref={containerRef}
                className="absolute w-0 h-0 transform-style-preserve-3d flex items-center justify-center"
                style={{
                    transformStyle: "preserve-3d",
                    transform: `rotateY(${rotation}deg)` // Use inline transform for rotation to avoid conflict
                }}
            // Add drag interactions for fun if needed, but let's stick to the rotation logic above
            // We render a transparent overlay for gesture capture if implemented fully using motion values
            >
                {items.map((item, index) => {
                    const itemAngle = index * anglePerItem;

                    return (
                        <div
                            key={index}
                            className="absolute left-0 top-0 flex items-center justify-center"
                            style={{
                                transformStyle: "preserve-3d",
                                // "Nuclear Centering": 
                                // Use layout positioning (margins) to center the item relative to the 0x0 parent.
                                // This guarantees the center of rotation is exactly the center of the item.
                                marginLeft: -itemWidth / 2,
                                marginTop: -itemHeight / 2,
                                width: itemWidth,
                                height: itemHeight,
                                transform: `rotateY(${itemAngle}deg) translateZ(${radius}px)`,
                            }}
                        >
                            {/* Inner content wrapper to handle "face player" rotation if desired, 
                                but for a cylinder we usually want them fixed to the cylinder face. 
                            */}
                            {item}
                        </div>
                    );
                })}
            </motion.div>

            {/* Gradient Overlay removed as per user request */}
        </div>
    );
}
