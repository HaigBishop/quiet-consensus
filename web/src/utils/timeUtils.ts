/**
 * Formats a date to show how long ago it was
 * @param date - The date to compare against now
 * @returns A human-readable string like "2 minutes", "1 hour", etc.
 */
export function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInMinutes < 1) {
        return "<1 minute";
    } else if (diffInMinutes < 60) {
        return diffInMinutes === 1 ? "1 minute" : `${diffInMinutes} minutes`;
    } else {
        return diffInHours === 1 ? "1 hour" : `${diffInHours} hours`;
    }
}

