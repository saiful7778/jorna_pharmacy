import type { Column } from "@tanstack/react-table";
import { cn } from "cn";
import {
  ArrowDown01,
  ArrowDownAZ,
  ArrowUp01,
  ArrowUpAZ,
  ArrowUpDown,
  EyeOff,
  X,
} from "lucide-react";

import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface DataTableColumnHeaderProps<
  TData,
  TValue,
> extends React.ComponentProps<"div"> {
  column: Column<TData, TValue>;
  label: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  label,
  className,
  ...props
}: DataTableColumnHeaderProps<TData, TValue>) {
  "use no memo";
  const columnMeta = column.columnDef.meta;

  const isSorted = column.getIsSorted();
  const canSort = column.getCanSort();
  const canHide = column.getCanHide();

  if (!canSort && !canHide) {
    return (
      <div
        className={cn("flex items-center justify-between gap-2", className)}
        {...props}
      >
        <span>{label}</span>
      </div>
    );
  }

  return (
    <div
      className={cn("flex items-center justify-between gap-2", className)}
      {...props}
    >
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" />}>
          <span>{label}</span>
          {canSort &&
            (isSorted === "desc" ? (
              columnMeta?.variant === "number" ||
              columnMeta?.variant === "range" ? (
                <ArrowDown01 />
              ) : columnMeta?.variant === "date" ||
                columnMeta?.variant === "dateRange" ? (
                <ArrowDown01 />
              ) : (
                <ArrowDownAZ />
              )
            ) : isSorted === "asc" ? (
              columnMeta?.variant === "number" ||
              columnMeta?.variant === "range" ? (
                <ArrowUp01 />
              ) : columnMeta?.variant === "date" ||
                columnMeta?.variant === "dateRange" ? (
                <ArrowUp01 />
              ) : (
                <ArrowUpAZ />
              )
            ) : (
              <ArrowUpDown />
            ))}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-40">
          <DropdownMenuGroup>
            {canSort && (
              <>
                <DropdownMenuCheckboxItem
                  className="relative pr-8 pl-2 [&_svg]:text-muted-foreground [&>span:first-child]:right-2 [&>span:first-child]:left-auto"
                  checked={isSorted === "asc"}
                  onClick={() => column.toggleSorting(false)}
                >
                  {columnMeta?.variant === "number" ||
                  columnMeta?.variant === "range" ? (
                    <>
                      <ArrowDown01 />
                      <span>0 - 1</span>
                    </>
                  ) : columnMeta?.variant === "date" ||
                    columnMeta?.variant === "dateRange" ? (
                    <>
                      <ArrowDown01 />
                      <span>Oldest first</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownAZ />
                      <span>A - Z</span>
                    </>
                  )}
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  className="relative pr-8 pl-2 [&_svg]:text-muted-foreground [&>span:first-child]:right-2 [&>span:first-child]:left-auto"
                  checked={isSorted === "desc"}
                  onClick={() => column.toggleSorting(true)}
                >
                  {columnMeta?.variant === "number" ||
                  columnMeta?.variant === "range" ? (
                    <>
                      <ArrowUp01 />
                      <span>1 - 0</span>
                    </>
                  ) : columnMeta?.variant === "date" ||
                    columnMeta?.variant === "dateRange" ? (
                    <>
                      <ArrowUp01 />
                      <span>Newest first</span>
                    </>
                  ) : (
                    <>
                      <ArrowUpAZ />
                      <span>Z - A</span>
                    </>
                  )}
                </DropdownMenuCheckboxItem>
                {isSorted && (
                  <DropdownMenuItem
                    className="pl-2 [&_svg]:text-muted-foreground"
                    onClick={() => column.clearSorting()}
                  >
                    <X />
                    <span>Reset</span>
                  </DropdownMenuItem>
                )}
              </>
            )}
            {canHide && (
              <DropdownMenuCheckboxItem
                className="relative pr-8 pl-2 [&_svg]:text-muted-foreground [&>span:first-child]:right-2 [&>span:first-child]:left-auto"
                checked={!column.getIsVisible()}
                onClick={() => column.toggleVisibility(false)}
              >
                <EyeOff />
                <span>Hide</span>
              </DropdownMenuCheckboxItem>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
