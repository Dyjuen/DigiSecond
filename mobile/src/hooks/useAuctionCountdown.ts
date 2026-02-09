import { useState, useEffect } from "react";

/**
 * Hook to calculate and update auction countdown timer
 * @param endDate - Auction end date (can be Date, string, null, or undefined)
 * @returns Object with timeLeft string, isExpired and isUrgent flags, and atomic time units
 */
export function useAuctionCountdown(endDate: Date | string | null | undefined) {
    const [timeLeft, setTimeLeft] = useState<string>("--:--:--");
    const [timeParts, setTimeParts] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isExpired, setIsExpired] = useState(false);
    const [isUrgent, setIsUrgent] = useState(false);

    useEffect(() => {
        // Handle null/undefined
        if (!endDate) {
            setTimeLeft("--:--:--");
            setTimeParts({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            setIsExpired(false);
            setIsUrgent(false);
            return;
        }

        const updateCountdown = () => {
            try {
                const end = new Date(endDate).getTime();

                // Check for invalid date
                if (isNaN(end)) {
                    setTimeLeft("--:--:--");
                    setTimeParts({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                    setIsExpired(false);
                    setIsUrgent(false);
                    return;
                }

                const now = Date.now();
                const diff = end - now;

                // Expired
                if (diff <= 0) {
                    setTimeLeft("Berakhir");
                    setTimeParts({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                    setIsExpired(true);
                    setIsUrgent(false);
                    return;
                }

                setIsExpired(false);

                // Calculate time components
                const seconds = Math.floor((diff / 1000) % 60);
                const minutes = Math.floor((diff / (1000 * 60)) % 60);
                const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));

                // Set urgency flag (< 1 hour)
                setIsUrgent(diff < 60 * 60 * 1000);

                // Format based on remaining time
                let formatted: string;
                if (days > 0) {
                    // > 24 hours: "2d 05:30:00"
                    formatted = `${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                } else {
                    // < 24 hours: "05:30:45"
                    formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                }

                setTimeParts({ days, hours, minutes, seconds });
                setTimeLeft(formatted);
            } catch (error) {
                // Catch any date parsing errors
                console.error("Error calculating countdown:", error);
                setTimeLeft("--:--:--");
                setTimeParts({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                setIsExpired(false);
                setIsUrgent(false);
            }
        };

        // Initial update
        updateCountdown();

        // Update every second
        const interval = setInterval(updateCountdown, 1000);

        // Cleanup on unmount
        return () => clearInterval(interval);
    }, [endDate]);

    return { timeLeft, isExpired, isUrgent, ...timeParts };
}
