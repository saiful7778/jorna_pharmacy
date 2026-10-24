import { useMemo } from "react";

import type { Table } from "@tanstack/react-table";
import { Settings2 } from "lucide-react";

import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface DataTableViewOptionsProps<TData> extends React.ComponentProps<
  typeof DropdownMenuContent
> {
  table: Table<TData>;
}

export function DataTableViewOptions<TData>({
  table,
  ...props
}: DataTableViewOptionsProps<TData>) {
  "use no memo";
  const columns = useMemo(
    () =>
      table
        .getAllColumns()
        .filter(
          (column) =>
            typeof column.accessorFn !== "undefined" && column.getCanHide()
        ),
    [table]
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            aria-label="Toggle columns"
            role="combobox"
            variant="outline"
            className="hidden lg:inline-flex"
          />
        }
      >
        <Settings2 className="text-muted-foreground" />
        <span>View</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44" {...props}>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {columns.map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              className="cursor-pointer capitalize"
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              <span className="truncate">
                {column.columnDef.meta?.label ?? column.id}
              </span>
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
