import { useCallback, useMemo, useState } from "react";

import { cn } from "cn";
import { endOfDay, startOfDay } from "date-fns";

import type { DateRange } from "@/hooks/use-range-selection";
import { formatDateWithTimezone } from "@/utils/formatDate";
import { useAuthStore } from "@/zustand/auth/AuthStoreContext";

import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";

export type DateRangeValue = DateRange;

export interface DateRangeSelectProps {
  range?: DateRangeValue | null;
  defaultRange?: DateRangeValue | null;
  onChange?: (range: DateRangeValue | null) => void;
  onApply?: (range: DateRangeValue) => void;
  onClear?: () => void;
  numberOfMonths?: number;
  className?: string;
}

export function DateRangeSelect({
  range: controlledRange,
  defaultRange = null,
  onChange,
  onApply,
  onClear,
  numberOfMonths = 2,
  className,
}: DateRangeSelectProps) {
  const [internalRange, setInternalRange] = useState<DateRangeValue | null>(
    defaultRange
  );
  const [today] = useState(() => new Date());

  const user = useAuthStore((state) => state.user);

  const range = controlledRange ?? internalRange;

  const setRange = useCallback(
    (next: DateRangeValue | null) => {
      if (controlledRange === undefined) setInternalRange(next);
      onChange?.(next);
    },
    [controlledRange, onChange]
  );

  const calendarRange = useMemo(
    () =>
      range
        ? { from: new Date(range.start), to: new Date(range.end) }
        : undefined,
    [range]
  );

  const handleSelect = useCallback(
    (next: { from?: Date; to?: Date } | undefined) => {
      if (!next?.from) {
        setRange(null);
        return;
      }

      setRange({
        start: startOfDay(next.from).toISOString(),
        end: endOfDay(next.to ?? next.from).toISOString(),
      });
    },
    [setRange]
  );

  return (
    <div className={cn("w-full max-w-xl space-y-4", className)}>
      <Calendar
        mode="range"
        aria-label="Select a date range"
        className="mx-auto"
        defaultMonth={range ? new Date(range.start) : today}
        numberOfMonths={numberOfMonths}
        captionLayout="dropdown"
        selected={calendarRange}
        onSelect={handleSelect}
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
                setRange(null);
                onClear?.();
              }}
            >
              Clear
            </Button>
            <Button type="button" onClick={() => onApply?.(range)}>
              Apply Range
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
