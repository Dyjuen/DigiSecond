import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "outline" | "success" | "warning" | "error";
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
    ({ className, variant = "default", ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors",
                    variant === "default" &&
                    "bg-brand-primary text-white",
                    variant === "secondary" &&
                    "bg-brand-primary-subtle dark:bg-brand-primary/20 text-brand-primary-dark dark:text-brand-primary-light",
                    variant === "outline" &&
                    "border border-zinc-200 dark:border-zinc-700 bg-transparent text-zinc-700 dark:text-zinc-300",
                    variant === "success" &&
                    "bg-success/10 text-success",
                    variant === "warning" &&
                    "bg-warning/10 text-warning",
                    variant === "error" &&
                    "bg-error/10 text-error",
                    className
                )}
                {...props}
            />
        );
    }
);
Badge.displayName = "Badge";

export { Badge };
