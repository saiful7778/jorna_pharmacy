import { useCallback, useMemo } from "react";

import { cn } from "cn";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { useControllableState } from "@/hooks/use-controllable-state";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatDateWithTimezone } from "@/utils/formatDate";

import { Button, type ButtonProps } from "./button";
import { Calendar, type CalendarProps } from "./calendar";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Separator } from "./separator";

function isDateRange(value: unknown): value is DateRange {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    "from" in value &&
    "to" in value
  );
}

const DEFAULT_TIMEZONE = "America/New_York";

function safeFormat(
  date: Date | undefined,
  timezone?: string | null | undefined
): string {
  return date ? formatDateWithTimezone(date, "MMM dd, yy", timezone) : "";
}

export interface DateFilterProps {
  value?: Date | DateRange | undefined;
  onValueChange?: (value: Date | DateRange | undefined) => void;
  onCancel?: () => void;
  onApply?: (value: Date | DateRange | undefined) => void;
  placeholder?: string;
  isInRange?: boolean;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
  timezone?: string | null | undefined;
  calendarProps?: Omit<CalendarProps, "selected" | "onSelect" | "mode">;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DateFilter({
  value,
  onValueChange,
  onCancel,
  onApply,
  placeholder = "Select date",
  isInRange,
  variant = "outline",
  size = "default",
  className,
  timezone,
  calendarProps,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: DateFilterProps) {
  "use no memo";
  const [open, setOpen] = useControllableState<boolean>({
    prop: controlledOpen,
    defaultProp: false,
    onChange: controlledOnOpenChange,
  });

  const isMobile = useIsMobile();

  const handleSelect = useCallback(
    (val: Date | DateRange | undefined) => {
      onValueChange?.(val);
      if (!isInRange && val instanceof Date) {
        onApply?.(val);
        setOpen(false);
      }
    },
    [onValueChange, isInRange, onApply]
  );

  const handleApply = useCallback(() => {
    onApply?.(value);
    setOpen(false);
  }, [onApply, value]);

  const handleCancel = useCallback(() => {
    onCancel?.();
    setOpen(false);
  }, [onCancel]);

  const trigger = (
    <DateFilterTrigger
      isInRange={isInRange}
      value={value}
      placeholder={placeholder}
      variant={variant}
      size={size}
      timezone={timezone}
      className={className}
    />
  );

  const content = (
    <DateFilterContent
      isInRange={isInRange}
      value={value}
      onSelect={handleSelect}
      onCancel={handleCancel}
      onApply={handleApply}
      calendarProps={{
        ...calendarProps,
        timeZone: timezone || DEFAULT_TIMEZONE,
      }}
    />
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger render={trigger} />
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{placeholder}</DrawerTitle>
            <DrawerDescription />
          </DrawerHeader>
          <div className="flex flex-col gap-2 border-t">{content}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={trigger} />
      <PopoverContent className="w-auto p-0" align="start">
        {content}
      </PopoverContent>
    </Popover>
  );
}

interface DateFilterTriggerProps extends Omit<ButtonProps, "value"> {
  isInRange?: boolean;
  value: Date | DateRange | undefined;
  timezone?: string | null | undefined;
  placeholder?: string;
}

function DateFilterTrigger({
  isInRange,
  value,
  placeholder,
  className,
  variant = "outline",
  size = "default",
  timezone,
  ...props
}: DateFilterTriggerProps) {
  const label = useMemo(() => {
    if (isInRange && isDateRange(value)) {
      const has = value.from || value.to;
      const text = has
        ? value.from && value.to
          ? `${safeFormat(value.from, timezone)} - ${safeFormat(value.to, timezone)}`
          : safeFormat(value.from ?? value.to, timezone)
        : null;

      return (
        <>
          <span>{placeholder}</span>
          {text && <Separator orientation="vertical" className="mx-2" />}
          {text && <span>{text}</span>}
        </>
      );
    }

    if (!isInRange && value instanceof Date) {
      return (
        <>
          <span>{placeholder}</span>
          <Separator orientation="vertical" className="mx-2" />
          <span>{safeFormat(value, timezone)}</span>
        </>
      );
    }

    return <span>{placeholder}</span>;
  }, [isInRange, placeholder, value, timezone]);

  return (
    <Button
      variant={variant}
      size={size}
      className={cn("border-dashed font-normal", className)}
      {...props}
    >
      <CalendarIcon className="size-4" />
      {label}
    </Button>
  );
}

interface DateFilterContentProps {
  isInRange?: boolean;
  value: Date | DateRange | undefined;
  calendarProps?: Omit<CalendarProps, "selected" | "onSelect" | "mode">;
  onSelect: (value: Date | DateRange | undefined) => void;
  onCancel: () => void;
  onApply: () => void;
}

function DateFilterContent({
  isInRange,
  value,
  onSelect,
  onCancel,
  onApply,
  calendarProps,
}: DateFilterContentProps) {
  return (
    <div className="flex flex-col">
      {isInRange ? (
        <>
          <Calendar
            autoFocus
            captionLayout="dropdown"
            mode="range"
            selected={isDateRange(value) ? value : undefined}
            onSelect={onSelect}
            {...calendarProps}
          />
          <div className="flex items-center gap-2 px-2 pb-2">
            <Button className="flex-1" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={onApply}>
              Apply
            </Button>
          </div>
        </>
      ) : (
        <Calendar
          captionLayout="dropdown"
          mode="single"
          selected={value instanceof Date ? value : undefined}
          onSelect={onSelect}
          {...calendarProps}
        />
      )}
    </div>
  );
}
