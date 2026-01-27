"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
    pauseOnHover?: boolean;
    reverse?: boolean;
    speed?: number;
}

export function Marquee({
    children,
    className,
    pauseOnHover = false,
    reverse = false,
    speed = 40,
    ...props
}: MarqueeProps) {
    return (
        <div
            className={cn(
                "group flex overflow-hidden [--duration:40s] [--gap:1rem] gap-[--gap]",
                className
            )}
            style={{ "--duration": `${speed}s` } as React.CSSProperties}
            {...props}
        >
            <div
                className={cn(
                    "flex shrink-0 gap-[--gap] animate-marquee",
                    pauseOnHover && "group-hover:[animation-play-state:paused]",
                    reverse && "[animation-direction:reverse]"
                )}
            >
                {children}
            </div>
            <div
                className={cn(
                    "flex shrink-0 gap-[--gap] animate-marquee",
                    pauseOnHover && "group-hover:[animation-play-state:paused]",
                    reverse && "[animation-direction:reverse]"
                )}
                aria-hidden="true"
            >
                {children}
            </div>
        </div>
    );
}
