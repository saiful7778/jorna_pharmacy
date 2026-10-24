import type { Table } from "@tanstack/react-table";
import { cn } from "cn";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface DataTablePaginationProps<TData> extends React.ComponentProps<"div"> {
  table: Table<TData>;
  pageSizeOptions?: number[];
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 30, 40, 50],
  className,
  ...props
}: DataTablePaginationProps<TData>) {
  "use no memo";
  return (
    <div
      className={cn(
        "flex w-full flex-col-reverse items-center justify-between gap-4 overflow-auto p-1 sm:flex-row sm:gap-8",
        className
      )}
      {...props}
    >
      <TooltipProvider>
        <div className="flex items-center gap-2">
          <Tooltip>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <TooltipTrigger
                render={
                  <SelectTrigger className="w-17.5">
                    <SelectValue
                      placeholder={table.getState().pagination.pageSize}
                    />
                  </SelectTrigger>
                }
              />
              <SelectContent side="top">
                {pageSizeOptions.map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <TooltipContent>
              <p>Select row par page</p>
            </TooltipContent>
          </Tooltip>
          <div className="flex-1 text-sm whitespace-nowrap text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length}{" "}
            {table.getFilteredSelectedRowModel().rows.length > 1
              ? "rows"
              : "row"}{" "}
            selected.
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 sm:flex-row">
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    className="hidden lg:flex"
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                  />
                }
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="size-4" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Go to first page</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  />
                }
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="size-4" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Go to previous page</p>
              </TooltipContent>
            </Tooltip>
            <div className="flex w-25 items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  />
                }
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="size-4" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Go to next page</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    className="hidden lg:flex"
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                  />
                }
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="size-4" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Go to last page</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
}
