/**
 * Formats a date string or Date object into a human-readable string based on recency.
 * - < 24 hours: Show time (e.g., "14:30")
 * - < 7 days: Show day name (e.g., "Mon")
 * - Otherwise: Show short date (e.g., "Oct 12")
 */
export const formatDate = (dateInput: string | Date | number): string => {
    const date = new Date(dateInput);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    // If less than 24 hours, show time
    if (diff < 24 * 60 * 60 * 1000) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    // If less than 7 days, show day name
    if (diff < 7 * 24 * 60 * 60 * 1000) {
        return date.toLocaleDateString([], { weekday: 'short' });
    }
    // Otherwise show date
    return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
};
