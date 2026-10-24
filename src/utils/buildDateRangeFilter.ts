export function buildDateRangeFilter(
  startTime: string | null | undefined,
  endTime: string | null | undefined
): { from: string; to: string } | undefined {
  if (!startTime || !endTime) return undefined;
  return { from: startTime, to: endTime };
}
