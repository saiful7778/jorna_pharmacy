/**
 * Converts a byte value into a human-readable string.
 *
 * Examples:
 *   formatBytes(1024)        -> "1 KB"
 *   formatBytes(1048576)     -> "1 MB"
 *   formatBytes(1536)        -> "1.5 KB"
 *
 * @param bytes - The size in bytes
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string with appropriate unit
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]!}`;
}
