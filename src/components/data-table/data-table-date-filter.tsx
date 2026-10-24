import { useCallback, useEffect, useState } from "react";

import type { Column } from "@tanstack/react-table";
import type { DateRange } from "react-day-picker";

import { DateFilter } from "../ui/date-filter";

const ISO_DATE_REGEX =
  /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)?$/;

function parseIsoDate(str: string): Date | undefined {
  if (!ISO_DATE_REGEX.test(str)) return undefined;
  const parsed = new Date(str);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function parseFilterValue(value: unknown): (Date | undefined)[] {
  if (value == null) return [];
  if (Array.isArray(value)) {
    return value.map((v) =>
      typeof v === "string" ? parseIsoDate(v) : undefined
    );
  }
  if (typeof value === "string") {
    return [parseIsoDate(value)];
  }
  return [];
}

interface DataTableDateFilterProps<TData> {
  column?: Column<TData>;
  placeholder?: string;
  isInRange?: boolean;
  timezone?: string | null | undefined;
}

export function DataTableDateFilter<TData>({
  column,
  placeholder,
  isInRange,
  timezone,
}: DataTableDateFilterProps<TData>) {
  "use no memo";

  const raw = column?.getFilterValue();

  const [internalValue, setInternalValue] = useState<
    Date | DateRange | undefined
  >(() => {
    const values = parseFilterValue(raw);
    return isInRange ? { from: values[0], to: values[1] } : values[0];
  });

  useEffect(() => {
    const values = parseFilterValue(raw);
    queueMicrotask(() => {
      setInternalValue(
        isInRange ? { from: values[0], to: values[1] } : values[0]
      );
    });
  }, [raw, isInRange]);

  const onApply = useCallback(
    (val: Date | DateRange | undefined) => {
      if (isInRange) {
        if (
          val &&
          typeof val === "object" &&
          "from" in val &&
          "to" in val &&
          (val.from || val.to)
        ) {
          column?.setFilterValue([
            val.from?.toISOString(),
            val.to?.toISOString(),
          ]);
        } else {
          column?.setFilterValue(undefined);
        }
      } else if (val instanceof Date) {
        column?.setFilterValue(val.toISOString());
      } else {
        column?.setFilterValue(undefined);
      }
    },
    [column, isInRange]
  );

  const onCancel = useCallback(() => {
    column?.setFilterValue(undefined);
  }, [column]);

  return (
    <DateFilter
      value={internalValue}
      onValueChange={setInternalValue}
      onApply={onApply}
      onCancel={onCancel}
      placeholder={placeholder}
      isInRange={isInRange}
      timezone={timezone}
    />
  );
}
