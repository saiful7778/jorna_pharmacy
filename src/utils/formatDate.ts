import { TZDate } from "@date-fns/tz";
import { formatDate, type FormatOptions } from "date-fns";

/**
 * Formats a date value in a specific timezone.
 * @param dateValue - Date, ISO string, or Unix timestamp (ms)
 * @param formatStr - date-fns format pattern (e.g., "PPP p")
 * @param timezone  - IANA timezone identifier; falsy values fall back to DEFAULT_TIMEZONE
 * @param options   - Optional date-fns FormatOptions (locale, etc.)
 */
export function formatDateWithTimezone(
  dateValue: Date | string | number,
  formatStr: string,
  timezone?: string | null | undefined,
  options?: FormatOptions | undefined
): string {
  if (!formatStr) {
    throw new RangeError(
      "formatDateWithTimezone: formatStr is required and cannot be empty."
    );
  }

  const resolvedTz = timezone || "Asia/Dhaka";
  const normalizedDate =
    dateValue instanceof Date ? dateValue : new Date(dateValue);

  const tzDate = new TZDate(normalizedDate, resolvedTz);
  return formatDate(tzDate, formatStr, options);
}
