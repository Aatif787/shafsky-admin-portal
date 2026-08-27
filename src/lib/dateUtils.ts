/**
 * Aviation Operational Date & Time Utilities
 * Canonical timezone for Shafsky Aviation Operations: Asia/Kolkata (IST, UTC+5:30)
 */

const TIMEZONE = "Asia/Kolkata";

/**
 * Formats an ISO date string into a standard IST operational date & time.
 * Example: "27 Aug 2026, 03:45 PM IST"
 */
export function formatOperationalDateTime(isoString?: string | null): string {
  if (!isoString) return "—";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("en-IN", {
      timeZone: TIMEZONE,
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch {
    return isoString;
  }
}

/**
 * Formats date only in IST.
 * Example: "27 Aug 2026"
 */
export function formatOperationalDate(isoString?: string | null): string {
  if (!isoString) return "—";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("en-IN", {
      timeZone: TIMEZONE,
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return isoString;
  }
}

/**
 * Formats time only in IST.
 * Example: "03:45 PM"
 */
export function formatOperationalTime(isoString?: string | null): string {
  if (!isoString) return "—";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("en-IN", {
      timeZone: TIMEZONE,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch {
    return isoString;
  }
}

/**
 * Formats currency amount in Indian Rupee format.
 * Example: "₹1,380,488"
 */
export function formatCurrencyINR(amount?: number | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
