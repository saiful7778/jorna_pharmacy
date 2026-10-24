import { useCallback, useState } from "react";

import { isWithinInterval } from "date-fns";

/** A range whose boundaries are ISO date-time strings. */
export interface DateRange {
  start: string;
  end: string;
}

interface Period {
  index: number;
  start: Date;
  end: Date;
}

interface UseRangeSelectionArgs<T extends Period> {
  periods: T[];
  range: DateRange | null;
  onChange: (range: DateRange | null) => void;
}

/**
 * Shared "click a period, click another to complete a range" behavior
 * used by both month and week pickers. Tracks the anchor by *index*
 * (not by re-matching dates) so it stays correct across year navigation.
 */
export function useRangeSelection<T extends Period>({
  periods,
  range,
  onChange,
}: UseRangeSelectionArgs<T>) {
  const [anchorIndex, setAnchorIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const isSelecting = anchorIndex !== null;

  const select = useCallback(
    (index: number) => {
      const clicked = periods[index];
      if (!clicked) return;

      if (anchorIndex === null) {
        onChange({
          start: clicked.start.toISOString(),
          end: clicked.end.toISOString(),
        });
        setAnchorIndex(index);
        return;
      }

      const lo = Math.min(anchorIndex, index);
      const hi = Math.max(anchorIndex, index);
      onChange({
        start: periods[lo]!.start.toISOString(),
        end: periods[hi]!.end.toISOString(),
      });
      setAnchorIndex(null);
      setHoverIndex(null);
    },
    [anchorIndex, onChange, periods]
  );

  const clear = useCallback(() => {
    onChange(null);
    setAnchorIndex(null);
    setHoverIndex(null);
  }, [onChange]);

  const isInRange = useCallback(
    (index: number) => {
      if (!range) return false;
      const period = periods[index];
      if (!period) return false;
      const interval = {
        start: new Date(range.start),
        end: new Date(range.end),
      };
      return (
        isWithinInterval(period.start, interval) &&
        isWithinInterval(period.end, interval)
      );
    },
    [periods, range]
  );

  const isInHoverRange = useCallback(
    (index: number) => {
      if (!isSelecting || hoverIndex === null) {
        return false;
      }
      const lo = Math.min(anchorIndex, hoverIndex);
      const hi = Math.max(anchorIndex, hoverIndex);
      return index >= lo && index <= hi;
    },
    [isSelecting, hoverIndex, anchorIndex]
  );

  return {
    select,
    clear,
    isInRange,
    isInHoverRange,
    setHoverIndex,
    isSelecting,
  };
}
