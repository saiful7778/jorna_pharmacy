import { useCallback, useMemo } from "react";

import type { Table } from "@tanstack/react-table";
import { Funnel, X } from "lucide-react";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogDescription,
  DialogResponsiveBody,
  DialogResponsiveContent,
  DialogStickyHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { DataTableFilterItems } from "./data-table-filter-items";

interface DataTableFilterViewProps<TData> {
  table: Table<TData>;
  timezone?: string | null | undefined;
}

export function DataTableFilterView<TData>({
  table,
  timezone,
}: DataTableFilterViewProps<TData>) {
  "use no memo";
  const isFiltered = table.getState().columnFilters.length > 0;

  const columns = useMemo(
    () => table.getAllColumns().filter((column) => column.getCanFilter()),
    [table]
  );

  const onReset = useCallback(() => {
    table.resetColumnFilters();
  }, [table]);

  return (
    <div className="flex flex-1 flex-wrap items-center gap-2">
      {columns.length <= 3 ? (
        columns.map((column) => (
          <DataTableFilterItems
            key={column.id}
            column={column}
            timezone={timezone}
          />
        ))
      ) : (
        <FilterFunnelView>
          {columns.map((column) => (
            <DataTableFilterItems
              key={column.id}
              column={column}
              timezone={timezone}
            />
          ))}
        </FilterFunnelView>
      )}
      {isFiltered && (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                aria-label="Reset filters"
                variant="outline"
                size="icon"
                className="border-dashed"
                onClick={onReset}
              />
            }
          >
            <X />
          </TooltipTrigger>
          <TooltipContent>
            <p>Reset filters</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

function FilterFunnelView({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger
          render={
            <DialogTrigger
              render={<Button className="border-dashed" variant="outline" />}
            />
          }
        >
          <Funnel />
          <span>Filters</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>All filters</p>
        </TooltipContent>
      </Tooltip>
      <DialogResponsiveContent>
        <DialogStickyHeader>
          <DialogTitle>Filters</DialogTitle>
          <DialogDescription>Filter by column</DialogDescription>
        </DialogStickyHeader>
        <DialogResponsiveBody>
          <div className="mx-auto flex w-full max-w-xs flex-col gap-4">
            {children}
          </div>
        </DialogResponsiveBody>
      </DialogResponsiveContent>
    </Dialog>
  );
}
