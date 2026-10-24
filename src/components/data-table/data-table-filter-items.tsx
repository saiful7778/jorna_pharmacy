import type { Column } from "@tanstack/react-table";

import { Input } from "../ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { DataTableDateFilter } from "./data-table-date-filter";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { DataTableSliderFilter } from "./data-table-slider-filter";

interface DataTableFilterItemProps<TData> {
  column: Column<TData>;
  timezone?: string | null | undefined;
}

export function DataTableFilterItems<TData>({
  column,
  timezone,
}: DataTableFilterItemProps<TData>) {
  "use no memo";
  const columnMeta = column.columnDef.meta;
  const columnVariant = columnMeta?.variant;

  if (!columnVariant) return null;

  if (columnVariant === "text") {
    return (
      <Input
        type="text"
        inputMode="text"
        autoComplete="off"
        id={column.id}
        placeholder={columnMeta.placeholder ?? columnMeta.label ?? column.id}
        value={(column.getFilterValue() as string | undefined) ?? ""}
        onChange={(event) => column.setFilterValue(event.target.value)}
        className="w-40 lg:w-56"
      />
    );
  }

  if (columnVariant === "number") {
    return (
      <InputGroup className="w-40 lg:w-56">
        <InputGroupInput
          type="number"
          inputMode="numeric"
          autoComplete="off"
          id={column.id}
          placeholder={columnMeta.placeholder ?? columnMeta.label ?? column.id}
          value={(column.getFilterValue() as string | undefined) ?? ""}
          onChange={(event) => column.setFilterValue(event.target.value)}
        />
        {columnMeta.unit && (
          <InputGroupAddon align="inline-end">
            {columnMeta.unit}
          </InputGroupAddon>
        )}
      </InputGroup>
    );
  }

  if (columnVariant === "range") {
    return (
      <DataTableSliderFilter
        column={column}
        placeholder={columnMeta.placeholder ?? columnMeta.label ?? column.id}
      />
    );
  }

  if (columnVariant === "date" || columnVariant === "dateRange") {
    return (
      <DataTableDateFilter
        column={column}
        isInRange={columnMeta.variant === "dateRange"}
        placeholder={columnMeta.placeholder ?? columnMeta.label ?? column.id}
        timezone={timezone}
      />
    );
  }

  if (columnVariant === "select" || columnVariant === "multiSelect") {
    return (
      <DataTableFacetedFilter
        column={column}
        options={columnMeta.options ?? []}
        isMultiple={columnMeta.variant === "multiSelect"}
        placeholder={columnMeta.placeholder ?? columnMeta.label ?? column.id}
      />
    );
  }

  return null;
}
