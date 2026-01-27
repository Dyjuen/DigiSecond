import * as React from "react";
import Image from "next/image";
import { cn, getInitials } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    src?: string | null;
    alt?: string;
    name?: string;
    size?: "sm" | "default" | "lg";
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
    ({ className, src, alt, name, size = "default", ...props }, ref) => {
        const sizeClasses = {
            sm: "h-8 w-8 text-xs",
            default: "h-10 w-10 text-sm",
            lg: "h-14 w-14 text-base",
        };

        return (
            <div
                ref={ref}
                className={cn(
                    "relative flex shrink-0 overflow-hidden rounded-full bg-brand-primary-subtle dark:bg-brand-primary/20",
                    sizeClasses[size],
                    className
                )}
                {...props}
            >
                {src ? (
                    <Image
                        src={src}
                        alt={alt || name || "Avatar"}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <span className="flex h-full w-full items-center justify-center font-semibold text-brand-primary-dark dark:text-brand-primary-light">
                        {name ? getInitials(name) : "?"}
                    </span>
                )}
            </div>
        );
    }
);
Avatar.displayName = "Avatar";

export { Avatar };
