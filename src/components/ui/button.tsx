import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "outline" | "ghost" | "secondary" | "destructive";
    size?: "sm" | "default" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", ...props }, ref) => {
        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50 disabled:pointer-events-none disabled:opacity-50",
                    // Variants
                    variant === "default" &&
                    "bg-gradient-primary text-white shadow-3d hover:shadow-3d-hover hover:-translate-y-0.5",
                    variant === "outline" &&
                    "border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white hover:border-brand-primary dark:hover:border-brand-primary",
                    variant === "ghost" &&
                    "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white",
                    variant === "secondary" &&
                    "bg-brand-primary-subtle dark:bg-brand-primary/20 text-brand-primary-dark dark:text-brand-primary-light hover:bg-brand-primary/20",
                    variant === "destructive" &&
                    "bg-error text-white hover:bg-error/90",
                    // Sizes
                    size === "sm" && "h-9 px-3 text-sm",
                    size === "default" && "h-11 px-5 text-base",
                    size === "lg" && "h-12 px-8 text-base",
                    size === "icon" && "h-10 w-10",
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button };
