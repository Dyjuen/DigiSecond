import * as React from "react";
import { cn } from "@/lib/utils";

interface BlurProps extends React.HTMLAttributes<HTMLDivElement> {
    direction?: "left" | "right";
    blurIntensity?: number;
}

export function Blur({
    className,
    direction = "left",
    blurIntensity = 1,
    ...props
}: BlurProps) {
    return (
        <div
            className={cn(
                "pointer-events-none absolute inset-y-0 w-20 z-10",
                direction === "left"
                    ? "left-0 bg-gradient-to-r from-black"
                    : "right-0 bg-gradient-to-l from-black",
                className
            )}
            style={{
                backdropFilter: `blur(${blurIntensity}px)`,
                WebkitBackdropFilter: `blur(${blurIntensity}px)`
            }}
            {...props}
        />
    );
}
