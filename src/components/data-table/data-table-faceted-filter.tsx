import { useCallback, useMemo, useState } from "react";

import type { Column } from "@tanstack/react-table";

import type { Option } from "@/types/data-table";

import { FacetedFilter } from "../ui/faceted-filter";

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  options: Option[];
  isMultiple?: boolean;
  placeholder?: string;
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  options,
  isMultiple,
  placeholder,
}: DataTableFacetedFilterProps<TData, TValue>) {
  "use no memo";
  const [open, setOpen] = useState(false);

  const columnFilterValue = column?.getFilterValue();

  const selectedValues = useMemo(
    () =>
      new Set<string>(
        Array.isArray(columnFilterValue) ? columnFilterValue : []
      ),
    [columnFilterValue]
  );

  const onSelect = useCallback(
    (option: Option, isSelected: boolean) => {
      if (!column) return;

      if (isMultiple) {
        const newSelectedValues = new Set(selectedValues);
        if (isSelected) {
          newSelectedValues.delete(option.value);
        } else {
          newSelectedValues.add(option.value);
        }
        const filterValues = Array.from(newSelectedValues);
        column.setFilterValue(filterValues.length ? filterValues : undefined);
      } else {
        column.setFilterValue(isSelected ? undefined : [option.value]);
        setOpen(false);
      }
    },
    [column, isMultiple, selectedValues]
  );

  const onReset = useCallback(() => {
    column?.setFilterValue(undefined);
  }, [column]);

  return (
    <FacetedFilter
      selectedValues={selectedValues}
      onSelect={onSelect}
      onReset={onReset}
      options={options}
      isMultiple={isMultiple}
      placeholder={placeholder}
      open={open}
      onOpenChange={setOpen}
    />
  );
}
