import { useCallback, useMemo, useState } from "react";

import { cn } from "cn";
import {
  eachWeekOfInterval,
  endOfWeek,
  endOfYear,
  startOfWeek,
  startOfYear,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useRangeSelection, type DateRange } from "@/hooks/use-range-selection";
import { formatDateWithTimezone } from "@/utils/formatDate";
import { useAuthStore } from "@/zustand/auth/AuthStoreContext";

import { Button } from "../ui/button";
import { RangeGrid } from "./range-grid";

export type WeekRange = DateRange;

export interface WeekRangeSelectProps {
  year?: number;
  range?: WeekRange | null;
  defaultRange?: WeekRange | null;
  onChange?: (range: WeekRange | null) => void;
  onYearChange?: (year: number) => void;
  onApply: (range: WeekRange) => void;
  onClear?: () => void;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  columns?: number;
  className?: string;
}

export function WeekRangeSelect({
  year: controlledYear,
  range: controlledRange,
  defaultRange = null,
  onChange,
  onYearChange,
  onApply,
  onClear,
  weekStartsOn = 1,
  columns = 4,
  className,
}: WeekRangeSelectProps) {
  const [internalYear, setInternalYear] = useState(() =>
    new Date().getFullYear()
  );
  const [internalRange, setInternalRange] = useState<WeekRange | null>(
    defaultRange
  );

  const user = useAuthStore((state) => state.user);

  const year = controlledYear ?? internalYear;
  const range = controlledRange ?? internalRange;

  const setRange = useCallback(
    (next: WeekRange | null) => {
      if (controlledRange === undefined) setInternalRange(next);
      onChange?.(next);
    },
    [controlledRange, onChange]
  );

  const changeYear = useCallback(
    (delta: number) => {
      const next = year + delta;
      if (controlledYear === undefined) setInternalYear(next);
      onYearChange?.(next);
    },
    [year, controlledYear, onYearChange]
  );

  const weeks = useMemo(() => {
    const yearStart = startOfWeek(startOfYear(new Date(year, 0, 1)), {
      weekStartsOn,
    });
    const yearEnd = endOfWeek(endOfYear(new Date(year, 11, 31)), {
      weekStartsOn,
    });
    return eachWeekOfInterval(
      { start: yearStart, end: yearEnd },
      { weekStartsOn }
    ).map((start, index) => {
      const end = endOfWeek(start, { weekStartsOn });
      return {
        index,
        start,
        end,
        label: `Week ${index + 1}`,
        dateRange: `${formatDateWithTimezone(
          start,
          "MMM d",
          user.timezone
        )} - ${formatDateWithTimezone(end, "MMM d", user.timezone)}`,
      };
    });
  }, [year, weekStartsOn, user.timezone]);

  const { select, clear, isInRange, isInHoverRange, setHoverIndex } =
    useRangeSelection({
      periods: weeks,
      range,
      onChange: setRange,
    });

  return (
    <div className={cn("w-full max-w-xl space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">{`${year} Weeks`}</h3>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => changeYear(-1)}
          >
            <ChevronLeft />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => changeYear(1)}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      <RangeGrid
        aria-label="Select a week range"
        items={weeks.map((w) => ({ label: w.label, sublabel: w.dateRange }))}
        columns={columns}
        scrollable
        isSelected={isInRange}
        isHovering={isInHoverRange}
        onSelect={select}
        onHover={setHoverIndex}
      />

      {range && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-secondary px-4 py-2 shadow-md">
          <div className="flex-1 tracking-tight">
            <div className="font-medium text-foreground">Selected Range</div>
            <div className="inline-flex gap-1 text-sm text-muted-foreground">
              <span>
                {formatDateWithTimezone(
                  range.start,
                  "MMMM d, yyyy",
                  user.timezone
                )}
              </span>
              <span>-</span>
              <span>
                {formatDateWithTimezone(
                  range.end,
                  "MMMM d, yyyy",
                  user.timezone
                )}
              </span>
            </div>
          </div>
          <div className="inline-flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                clear();
                onClear?.();
              }}
            >
              Clear
            </Button>
            <Button type="button" onClick={() => onApply(range)}>
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
