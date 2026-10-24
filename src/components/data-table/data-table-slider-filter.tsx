import { useMemo } from "react";

import type { Column } from "@tanstack/react-table";

import { SliderFilter } from "../ui/slider-filter";

type RangeValue = [number, number];

interface SliderMeta {
  unit?: string;
  range?: RangeValue;
}

class SliderUtils {
  static isValidRange(value: unknown): value is RangeValue {
    return (
      Array.isArray(value) &&
      value.length === 2 &&
      value.every((v) => typeof v === "number" && !Number.isNaN(v))
    );
  }

  static parseRange(value: unknown): RangeValue | undefined {
    if (
      Array.isArray(value) &&
      value.length === 2 &&
      value.every(
        (v) =>
          (typeof v === "string" || typeof v === "number") &&
          !Number.isNaN(Number(v))
      )
    ) {
      return [Number(value[0]), Number(value[1])];
    }
    return undefined;
  }

  static computeBounds(
    column: Column<unknown>,
    defaultRange?: RangeValue
  ): { min: number; max: number; step: number } {
    let rangeMin = 0;
    let rangeMax = 100;

    if (defaultRange && SliderUtils.isValidRange(defaultRange)) {
      [rangeMin, rangeMax] = defaultRange;
    } else {
      const faceted = column.getFacetedMinMaxValues();
      if (
        Array.isArray(faceted) &&
        typeof faceted[0] === "number" &&
        typeof faceted[1] === "number"
      ) {
        [rangeMin, rangeMax] = faceted;
      }
    }

    if (rangeMin >= rangeMax) rangeMax = rangeMin + 1;

    const span = rangeMax - rangeMin;
    const step =
      span <= 20
        ? 1
        : span <= 100
          ? Math.max(1, Math.ceil(span / 20))
          : Math.max(1, Math.ceil(span / 50));

    return { min: rangeMin, max: rangeMax, step };
  }
}

interface DataTableSliderFilterProps<TData> {
  column?: Column<TData>;
  placeholder?: string;
}

export function DataTableSliderFilter<TData>({
  column,
  placeholder,
}: DataTableSliderFilterProps<TData>) {
  "use no memo";

  const { unit, range: defaultRange } = (column?.columnDef.meta ??
    {}) as SliderMeta;

  const { min, max, step } = useMemo(
    () => SliderUtils.computeBounds(column as Column<unknown>, defaultRange),
    [column, defaultRange]
  );

  const value = useMemo(
    () => SliderUtils.parseRange(column?.getFilterValue()),
    [column]
  );

  return (
    <SliderFilter
      value={value}
      onValueChange={column?.setFilterValue}
      min={min}
      max={max}
      step={step}
      unit={unit}
      placeholder={placeholder}
    />
  );
}
