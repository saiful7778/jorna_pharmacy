import type { Table } from "@tanstack/react-table";
import { cn } from "cn";

import { DataTableFilterView } from "./data-table-filter-view";
import { DataTableViewOptions } from "./data-table-view-options";

interface DataTableToolbarProps<TData> extends React.ComponentProps<"div"> {
  table: Table<TData>;
  timezone?: string | null | undefined;
}

export function DataTableToolbar<TData>({
  table,
  children,
  className,
  timezone,
  ...props
}: DataTableToolbarProps<TData>) {
  "use no memo";
  return (
    <div
      role="toolbar"
      aria-orientation="horizontal"
      className={cn("flex w-full items-start justify-between gap-2", className)}
      {...props}
    >
      <DataTableFilterView table={table} timezone={timezone} />
      <div className="flex items-center gap-2">
        {children}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
