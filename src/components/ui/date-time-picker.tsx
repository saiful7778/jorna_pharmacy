import { useCallback, useState } from "react";

import { cn } from "cn";
import { setHours, setMinutes, setMonth, setYear } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { useControllableState } from "@/hooks/use-controllable-state";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatDateWithTimezone } from "@/utils/formatDate";

import type { ButtonProps } from "./button";
import { Button } from "./button";
import type { CalendarProps } from "./calendar";
import { Calendar, CalendarDayButton } from "./calendar";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

const DEFAULT_FROM_YEAR = 1970;
const DEFAULT_TO_YEAR = 2050;
const DEFAULT_TIMEZONE = "America/New_York";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export type CalendarCompProps = Omit<
  CalendarProps,
  "mode" | "selected" | "onSelect" | "month" | "onMonthChange"
>;

interface DateTimePickerProps {
  value: Date | null | undefined;
  onSelectValue: (value: Date | null | undefined) => void;
  triggerVariant?: ButtonProps["variant"];
  timezone?: string | null | undefined;
  calendarProps?: CalendarCompProps;
  placeholder?: string;
  triggerClassName?: string;
  fromYear?: number;
  toYear?: number;
  showTimeSelection?: boolean;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DateTimePicker({
  value,
  onSelectValue,
  timezone,
  fromYear = DEFAULT_FROM_YEAR,
  toYear = DEFAULT_TO_YEAR,
  triggerVariant,
  calendarProps,
  placeholder,
  triggerClassName,
  showTimeSelection = true,
  disabled,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: DateTimePickerProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useControllableState<boolean>({
    prop: controlledOpen,
    defaultProp: false,
    onChange: controlledOnOpenChange,
  });

  const trigger = (
    <DateTimePickerTrigger
      value={value}
      variant={triggerVariant}
      placeholder={placeholder}
      className={triggerClassName}
      showTimeSelection={showTimeSelection}
      disabled={disabled}
      timezone={timezone}
      aria-disabled={disabled}
    />
  );

  const content = (
    <DateTimePickerContent
      value={value}
      onSelectValue={onSelectValue}
      setOpen={setOpen}
      fromYear={fromYear}
      toYear={toYear}
      showTimeSelection={showTimeSelection}
      timeZone={timezone || DEFAULT_TIMEZONE}
      {...calendarProps}
    />
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger render={trigger} />
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Select a Date</DrawerTitle>
            <DrawerDescription />
          </DrawerHeader>
          <div className="border-t">{content}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={trigger}>Open datepicker</PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="center" side="bottom">
        {content}
      </PopoverContent>
    </Popover>
  );
}

interface DateTimePickerTriggerProps extends Omit<ButtonProps, "value"> {
  value: Date | null | undefined;
  timezone?: string | null | undefined;
  placeholder?: string;
  showTimeSelection?: boolean;
}

function DateTimePickerTrigger({
  value,
  className,
  timezone,
  placeholder = "Pick a date and time",
  variant = "outline",
  showTimeSelection,
  ...props
}: DateTimePickerTriggerProps) {
  return (
    <Button
      variant={variant}
      className={cn(
        "justify-start border-input pl-3 text-left font-normal transition-all",
        !value && "text-muted-foreground",
        className
      )}
      type="button"
      {...props}
    >
      <CalendarIcon className="size-4 opacity-70" />
      {value ? (
        <span className="truncate">
          {formatDateWithTimezone(
            value,
            showTimeSelection ? "PP - p" : "PP",
            timezone
          )}
        </span>
      ) : (
        <span>{placeholder}</span>
      )}
    </Button>
  );
}

interface DateTimePickerContentProps extends CalendarCompProps {
  value: Date | null | undefined;
  onSelectValue: (value: Date | null | undefined) => void;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  fromYear?: number;
  toYear?: number;
  showTimeSelection?: boolean;
}

function DateTimePickerContent({
  value,
  onSelectValue,
  fromYear = DEFAULT_FROM_YEAR,
  toYear = DEFAULT_TO_YEAR,
  setOpen,
  showTimeSelection,
  disabled,
  className,
  ...props
}: DateTimePickerContentProps) {
  const [pendingDate, setPendingDate] = useState<Date>(value ?? new Date());

  const handleConfirm = useCallback(() => {
    onSelectValue(pendingDate);
    setOpen(false);
  }, [pendingDate, onSelectValue, setOpen]);

  const handleDaySelect = useCallback((day: Date | undefined) => {
    if (!day) return;
    setPendingDate((prev) =>
      setHours(setMinutes(day, prev.getMinutes()), prev.getHours())
    );
  }, []);

  const handleMonthChange = useCallback((monthIndex: string | null) => {
    if (monthIndex === null) return;
    setPendingDate((prev) => setMonth(prev, Number(monthIndex)));
  }, []);

  const handleYearChange = useCallback((year: string | null) => {
    if (year === null) return;
    setPendingDate((prev) => setYear(prev, Number(year)));
  }, []);

  const handleHourChange = useCallback((hour: string | null) => {
    if (hour === null) return;
    setPendingDate((prev) => {
      const isPM = prev.getHours() >= 12;
      let h = Number(hour);
      if (isPM && h < 12) h += 12;
      if (!isPM && h === 12) h = 0;
      return setHours(prev, h);
    });
  }, []);

  const handleMinuteChange = useCallback((minute: string | null) => {
    if (minute === null) return;
    setPendingDate((prev) => setMinutes(prev, Number(minute)));
  }, []);

  const handleMeridiemChange = useCallback((meridiem: string | null) => {
    if (!meridiem) return;
    setPendingDate((prev) => {
      const h = prev.getHours();
      if (meridiem === "PM" && h < 12) return setHours(prev, h + 12);
      if (meridiem === "AM" && h >= 12) return setHours(prev, h - 12);
      return prev;
    });
  }, []);

  return (
    <div className="flex flex-col">
      {/* Month / Year navigation */}
      <div className="flex items-center justify-center gap-2 border-b border-border px-2 py-2">
        <MonthSelect value={pendingDate} onChange={handleMonthChange} />
        <YearSelect
          value={pendingDate}
          fromYear={fromYear}
          toYear={toYear}
          onChange={handleYearChange}
        />
      </div>

      {/* Day grid — viewMonth is derived directly from pendingDate */}
      <div className="flex justify-center">
        <Calendar
          mode="single"
          className={cn("px-1 py-0", className)}
          selected={pendingDate}
          month={pendingDate}
          onMonthChange={setPendingDate}
          startMonth={new Date(fromYear, 0)}
          endMonth={new Date(toYear, 11)}
          onSelect={handleDaySelect}
          disabled={disabled}
          {...props}
        />
      </div>

      {showTimeSelection && (
        <div className="flex items-center justify-center gap-1 border-t border-border px-2 py-2">
          <HourSelect value={pendingDate} onChange={handleHourChange} />
          <span className="text-muted-foreground">:</span>
          <MinuteSelect value={pendingDate} onChange={handleMinuteChange} />
          <span className="text-muted-foreground">:</span>
          <MeridiemSelect value={pendingDate} onChange={handleMeridiemChange} />
        </div>
      )}

      <div className="border-t border-border p-2">
        <Button className="w-full" onClick={handleConfirm}>
          Done
        </Button>
      </div>
    </div>
  );
}

function MonthSelect({
  value,
  onChange,
}: {
  value: Date | null | undefined;
  onChange: (v: string | null) => void;
}) {
  const items = MONTH_NAMES.map((label, i) => ({ value: i.toString(), label }));

  return (
    <Select
      items={items}
      value={value?.getMonth().toString()}
      onValueChange={onChange}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map(({ value: itemValue, label }) => (
          <SelectItem key={itemValue} value={itemValue}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function YearSelect({
  value,
  fromYear = DEFAULT_FROM_YEAR,
  toYear = DEFAULT_TO_YEAR,
  onChange,
}: {
  value: Date;
  fromYear?: number;
  toYear?: number;
  onChange: (v: string | null) => void;
}) {
  const items = Array.from({ length: toYear - fromYear + 1 }, (_, i) => {
    const year = (fromYear + i).toString();
    return { value: year, label: year };
  });

  return (
    <Select
      items={items}
      value={value.getFullYear().toString()}
      onValueChange={onChange}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {items.map(({ value: itemValue, label }) => (
            <SelectItem key={itemValue} value={itemValue}>
              {label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

function HourSelect({
  value,
  onChange,
}: {
  value: Date;
  onChange: (v: string | null) => void;
}) {
  const items = Array.from({ length: 12 }, (_, i) => {
    const hour = (i + 1).toString();
    return { value: hour, label: hour };
  });

  const raw = value.getHours();
  const display = raw === 0 ? 12 : raw > 12 ? raw - 12 : raw;

  return (
    <Select
      items={items}
      value={display.toString().padStart(2, "0")}
      onValueChange={onChange}
    >
      <SelectTrigger className="w-15">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {items.map(({ value: itemValue, label }) => (
            <SelectItem key={itemValue} value={itemValue}>
              {label.padStart(2, "0")}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

function MinuteSelect({
  value,
  onChange,
}: {
  value: Date;
  onChange: (v: string | null) => void;
}) {
  const items = Array.from({ length: 12 }, (_, i) => {
    const minute = (i * 5).toString();
    return { value: minute, label: minute };
  });

  return (
    <Select
      items={items}
      value={value.getMinutes().toString().padStart(2, "0")}
      onValueChange={onChange}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {items.map(({ value: itemValue, label }) => (
            <SelectItem key={itemValue} value={itemValue}>
              {label.padStart(2, "0")}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

function MeridiemSelect({
  value,
  onChange,
}: {
  value: Date;
  onChange: (v: string | null) => void;
}) {
  const items = [
    { value: "AM", label: "AM" },
    { value: "PM", label: "PM" },
  ];

  return (
    <Select
      items={items}
      value={value.getHours() >= 12 ? "PM" : "AM"}
      onValueChange={onChange}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {items.map(({ value: itemValue, label }) => (
            <SelectItem key={itemValue} value={itemValue}>
              {label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export function DateTimeDayButton({
  bookings,
  className,
  day,
  timezone,
  ...props
}: React.ComponentProps<typeof CalendarDayButton> & {
  bookings?: Record<string, number>;
  timezone?: string | null | undefined;
}) {
  const dateKey = formatDateWithTimezone(day.date, "yyyy-MM-dd", timezone);
  const bookingCount = bookings?.[dateKey];

  return (
    <CalendarDayButton
      {...props}
      day={day}
      className={cn(className, "relative")}
    >
      <div className="flex flex-col items-center justify-center gap-1">
        <span>{day.date.getDate()}</span>
        {bookingCount && bookingCount > 0 && (
          <span
            className={cn(
              "inline-flex h-3 max-w-5 min-w-3 items-center justify-center truncate rounded-full px-0.5 text-[8px] leading-none font-bold",
              props.modifiers.selected
                ? "bg-primary-foreground text-primary"
                : "bg-primary text-primary-foreground"
            )}
          >
            {bookingCount}
          </span>
        )}
      </div>
    </CalendarDayButton>
  );
}
