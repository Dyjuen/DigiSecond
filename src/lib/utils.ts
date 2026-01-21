import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with proper precedence
 * Combines clsx for conditional classes and tailwind-merge for deduplication
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format price in Indonesian Rupiah
 * @param amount - Price in IDR
 * @returns Formatted string (e.g., "Rp 500.000")
 */
export function formatPrice(amount: number): string {
    return `Rp ${amount.toLocaleString("id-ID")}`;
}

/**
 * Calculate platform fee (5% of transaction amount)
 * @param amount - Transaction amount in IDR
 * @returns Platform fee in IDR
 */
export function calculatePlatformFee(amount: number): number {
    const FEE_PERCENTAGE = 0.05;
    return Math.floor(amount * FEE_PERCENTAGE);
}

/**
 * Calculate seller payout (amount minus platform fee)
 * @param amount - Transaction amount in IDR
 * @returns Seller payout in IDR
 */
export function calculateSellerPayout(amount: number): number {
    return amount - calculatePlatformFee(amount);
}

/**
 * Format date for display
 * @param date - Date to format
 * @returns Formatted date string in Indonesian locale
 */
export function formatDate(date: Date | string): string {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

/**
 * Format relative time (e.g., "2 hours ago")
 * @param date - Date to format
 * @returns Relative time string
 */
export function formatRelativeTime(date: Date | string): string {
    const d = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 7) {
        return formatDate(d);
    } else if (diffDays > 0) {
        return `${diffDays} hari lalu`;
    } else if (diffHours > 0) {
        return `${diffHours} jam lalu`;
    } else if (diffMins > 0) {
        return `${diffMins} menit lalu`;
    } else {
        return "Baru saja";
    }
}

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + "...";
}

/**
 * Generate initials from a name
 * @param name - Full name
 * @returns Initials (max 2 characters)
 */
export function getInitials(name: string): string {
    return name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}
