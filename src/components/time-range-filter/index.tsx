import { useCallback, useMemo, useState } from "react";

import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import { CalendarDays, CalendarRange, ChevronDown, X } from "lucide-react";

import type { DateRange } from "@/hooks/use-range-selection";
import {
  RangeSearchEnumSchema,
  type RangeSearchEnum,
} from "@/lib/zod-schemas/baseZodSchema";
import { formatDateWithTimezone } from "@/utils/formatDate";
import { formatEnumValue } from "@/utils/formatEnum";
import { useAuthStore } from "@/zustand/auth/AuthStoreContext";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogDescription,
  DialogResponsiveBody,
  DialogResponsiveContent,
  DialogStickyHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { MonthRangeSelect } from "./month-range-select";
import { WeekRangeSelect } from "./week-range-select";

interface TimeRangeState {
  range: RangeSearchEnum | undefined;
  startTime?: string | undefined;
  endTime?: string | undefined;
}

interface TimeRangeFilterProps {
  rangeSearch: TimeRangeState;
  setRangeSearch: (next: TimeRangeState) => void;
}

const PRESET_KEYS = [
  RangeSearchEnumSchema.enum.TODAY,
  RangeSearchEnumSchema.enum.THIS_WEEK,
  RangeSearchEnumSchema.enum.THIS_MONTH,
  RangeSearchEnumSchema.enum.LAST_WEEK,
  RangeSearchEnumSchema.enum.LAST_MONTH,
] as const;

const presetRanges: Record<
  (typeof PRESET_KEYS)[number],
  () => { start: Date; end: Date }
> = {
  TODAY: () => {
    const now = new Date();
    return { start: startOfDay(now), end: endOfDay(now) };
  },
  THIS_WEEK: () => {
    const now = new Date();
    return {
      start: startOfWeek(now, { weekStartsOn: 1 }),
      end: endOfWeek(now, { weekStartsOn: 1 }),
    };
  },
  THIS_MONTH: () => {
    const now = new Date();
    return { start: startOfMonth(now), end: endOfMonth(now) };
  },
  LAST_WEEK: () => {
    const lastWeek = subWeeks(new Date(), 1);
    return {
      start: startOfWeek(lastWeek, { weekStartsOn: 1 }),
      end: endOfWeek(lastWeek, { weekStartsOn: 1 }),
    };
  },
  LAST_MONTH: () => {
    const lastMonth = subMonths(new Date(), 1);
    return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
  },
};

function CustomRangeDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogResponsiveContent>
        <DialogStickyHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogStickyHeader>
        <DialogResponsiveBody className="no-scrollbar">
          {open && children}
        </DialogResponsiveBody>
      </DialogResponsiveContent>
    </Dialog>
  );
}

export function TimeRangeFilter({
  rangeSearch,
  setRangeSearch,
}: TimeRangeFilterProps) {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [openCustomWeekDialog, setOpenCustomWeekDialog] = useState(false);
  const [openCustomMonthDialog, setOpenCustomMonthDialog] = useState(false);

  const user = useAuthStore((state) => state.user);

  const activeRange = useMemo<DateRange | null>(() => {
    const { startTime, endTime } = rangeSearch;
    if (!startTime || !endTime) return null;
    return { start: startTime, end: endTime };
  }, [rangeSearch]);

  const hasSelection = rangeSearch.range != null;

  const handleApplyPreset = useCallback(
    (value: string) => {
      const key = value as (typeof PRESET_KEYS)[number];
      const { start, end } = presetRanges[key]();
      setRangeSearch({
        range: key,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      });
      setOpenDropdown(false);
    },
    [setRangeSearch]
  );

  const handleApplyCustomWeek = useCallback(
    (range: DateRange) => {
      setRangeSearch({
        range: RangeSearchEnumSchema.enum.CUSTOM_WEEK,
        startTime: range.start,
        endTime: range.end,
      });
      setOpenCustomWeekDialog(false);
    },
    [setRangeSearch]
  );

  const handleApplyCustomMonth = useCallback(
    (range: DateRange) => {
      setRangeSearch({
        range: RangeSearchEnumSchema.enum.CUSTOM_MONTH,
        startTime: range.start,
        endTime: range.end,
      });
      setOpenCustomMonthDialog(false);
    },
    [setRangeSearch]
  );

  const handleReset = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      setRangeSearch({
        range: undefined,
        startTime: undefined,
        endTime: undefined,
      });
      setOpenDropdown(false);
    },
    [setRangeSearch]
  );

  return (
    <>
      <div className="inline-flex items-center gap-1">
        <DropdownMenu open={openDropdown} onOpenChange={setOpenDropdown}>
          <Tooltip>
            <TooltipTrigger
              render={
                <DropdownMenuTrigger
                  render={<Button type="button" variant="outline" />}
                />
              }
            >
              <CalendarRange />
              <span className="truncate">
                {rangeSearch.range
                  ? `${formatEnumValue(rangeSearch.range)}`
                  : "Select range"}
              </span>
              <ChevronDown />
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {rangeSearch.startTime && rangeSearch.endTime
                  ? `${formatDateWithTimezone(
                      rangeSearch.startTime,
                      "dd, MMM",
                      user.timezone
                    )} - ${formatDateWithTimezone(
                      rangeSearch.endTime,
                      "dd, MMM",
                      user.timezone
                    )}`
                  : "Time range"}
              </p>
            </TooltipContent>
          </Tooltip>

          <DropdownMenuContent align="start" className="min-w-36">
            <DropdownMenuRadioGroup
              value={rangeSearch.range ?? undefined}
              onValueChange={handleApplyPreset}
            >
              {PRESET_KEYS.map((preset) => (
                <DropdownMenuRadioItem
                  key={preset}
                  className="cursor-pointer"
                  value={preset}
                >
                  {formatEnumValue(preset)}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>

            <DropdownMenuItem onClick={() => setOpenCustomWeekDialog(true)}>
              <CalendarDays />
              <span>
                {formatEnumValue(RangeSearchEnumSchema.enum.CUSTOM_WEEK)}
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setOpenCustomMonthDialog(true)}>
              <CalendarDays />
              <span>
                {formatEnumValue(RangeSearchEnumSchema.enum.CUSTOM_MONTH)}
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {hasSelection && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Clear time range filter"
                  onClick={handleReset}
                />
              }
            >
              <X />
              <span className="sr-only">reset filters</span>
            </TooltipTrigger>

            <TooltipContent>
              <p>Reset Filters</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      <CustomRangeDialog
        open={openCustomWeekDialog}
        onOpenChange={setOpenCustomWeekDialog}
        title="Select Week"
        description="You can select weeks in range for searching"
      >
        <WeekRangeSelect
          defaultRange={activeRange}
          onApply={handleApplyCustomWeek}
        />
      </CustomRangeDialog>

      <CustomRangeDialog
        open={openCustomMonthDialog}
        onOpenChange={setOpenCustomMonthDialog}
        title="Select Month"
        description="You can select months in range for searching"
      >
        <MonthRangeSelect
          defaultRange={activeRange}
          onApply={handleApplyCustomMonth}
        />
      </CustomRangeDialog>
    </>
  );
}
