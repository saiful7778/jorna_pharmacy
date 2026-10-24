import { useCallback, useMemo, useState } from "react";

import { cn } from "cn";
import { endOfMonth, startOfMonth } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useRangeSelection, type DateRange } from "@/hooks/use-range-selection";
import { formatDateWithTimezone } from "@/utils/formatDate";
import { useAuthStore } from "@/zustand/auth/AuthStoreContext";

import { Button } from "../ui/button";
import { RangeGrid } from "./range-grid";

export type MonthRange = DateRange;

export interface MonthRangeSelectProps {
  year?: number;
  range?: MonthRange | null;
  defaultRange?: MonthRange | null;
  onChange?: (range: MonthRange | null) => void;
  onYearChange?: (year: number) => void;
  onApply?: (range: MonthRange) => void;
  onClear?: () => void;
  columns?: number;
  className?: string;
}

export function MonthRangeSelect({
  year: controlledYear,
  range: controlledRange,
  defaultRange = null,
  onChange,
  onYearChange,
  onApply,
  onClear,
  columns = 3,
  className,
}: MonthRangeSelectProps) {
  const [internalYear, setInternalYear] = useState(() =>
    new Date().getFullYear()
  );
  const [internalRange, setInternalRange] = useState<MonthRange | null>(
    defaultRange
  );

  const user = useAuthStore((state) => state.user);

  const year = controlledYear ?? internalYear;
  const range = controlledRange ?? internalRange;

  const setRange = useCallback(
    (next: MonthRange | null) => {
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

  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => {
        const start = startOfMonth(new Date(year, index, 1));
        return {
          index,
          start,
          end: endOfMonth(start),
          label: formatDateWithTimezone(start, "MMMM", user.timezone),
        };
      }),
    [year, user.timezone]
  );

  const { select, clear, isInRange, isInHoverRange, setHoverIndex } =
    useRangeSelection({
      periods: months,
      range,
      onChange: setRange,
    });

  return (
    <div className={cn("w-full max-w-xl space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">{`${year} Months`}</h3>
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
        aria-label="Select a month range"
        items={months.map((m) => ({ label: m.label }))}
        columns={columns}
        isSelected={isInRange}
        isHovering={isInHoverRange}
        onSelect={select}
        onHover={setHoverIndex}
      />

      {range && (
        <div className="flex items-center justify-between gap-2 rounded-md bg-secondary px-4 py-2 shadow-md">
          <div className="flex-1 tracking-tight">
            <div className="font-medium text-foreground">Selected Range</div>
            <div className="inline-flex gap-1 text-sm text-muted-foreground">
              <span>
                {formatDateWithTimezone(
                  range.start,
                  "MMMM yyyy",
                  user.timezone
                )}
              </span>
              <span>-</span>
              <span>
                {formatDateWithTimezone(range.end, "MMMM yyyy", user.timezone)}
              </span>
            </div>
          </div>
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
          <Button type="button" onClick={() => onApply?.(range)}>
            Apply Range
          </Button>
        </div>
      )}
    </div>
  );
}
