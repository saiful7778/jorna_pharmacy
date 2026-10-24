/**
 * Converts milliseconds into a human-readable time format.
 *
 * Examples:
 *   formatDuration(500)        -> "500 ms"
 *   formatDuration(1500)       -> "1.5 s"
 *   formatDuration(65000)      -> "1.08 min"
 *   formatDuration(3600000)    -> "1 h"
 *
 * @param ms - Time in milliseconds
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted time string with appropriate unit
 */
export function formatDuration(ms: number, decimals = 2): string {
  // Handle zero or invalid input
  if (ms === 0) return "0 ms";
  if (!ms || ms < 0) return "0 ms";

  const dm = decimals < 0 ? 0 : decimals;

  // Time units in milliseconds
  const units = [
    { label: "ms", value: 1 },
    { label: "s", value: 1000 },
    { label: "min", value: 60 * 1000 },
    { label: "h", value: 60 * 60 * 1000 },
    { label: "d", value: 24 * 60 * 60 * 1000 },
  ];

  // Find the largest unit that fits the value
  let i = units.length - 1;
  while (i > 0 && ms < units[i]!.value) {
    i--;
  }

  const converted = ms / units[i]!.value;

  return `${Number.parseFloat(converted.toFixed(dm))} ${units[i]!.label}`;
}
