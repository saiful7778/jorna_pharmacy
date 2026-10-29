import * as React from "react";

import { cn } from "cn";

const colSpanClasses = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
  5: "col-span-5",
  6: "col-span-6",
  7: "col-span-7",
  8: "col-span-8",
  9: "col-span-9",
  10: "col-span-10",
  11: "col-span-11",
  12: "col-span-12",
} as const;

type GridTableSpan = keyof typeof colSpanClasses;

function GridTable({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="grid-table"
      role="table"
      className={cn("border", className)}
      {...props}
    />
  );
}

function GridTableHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="grid-table-header"
      role="rowgroup"
      className={cn(className)}
      {...props}
    />
  );
}

function GridTableBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="grid-table-body"
      role="rowgroup"
      className={cn(className)}
      {...props}
    />
  );
}

function GridTableRow({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="grid-table-row"
      role="row"
      className={cn("grid grid-cols-12 items-center", className)}
      {...props}
    />
  );
}

interface GridTableSpanProps {
  span: GridTableSpan;
}

function GridTableHead({
  span,
  className,
  ...props
}: React.ComponentProps<"div"> & GridTableSpanProps) {
  return (
    <div
      data-slot="grid-table-head"
      role="columnheader"
      className={cn(
        "flex h-full items-center p-2 text-left font-medium text-foreground [&:not(:last-child)]:border-r",
        colSpanClasses[span],
        className
      )}
      {...props}
    />
  );
}

function GridTableCell({
  span,
  className,
  ...props
}: React.ComponentProps<"div"> & GridTableSpanProps) {
  return (
    <div
      data-slot="grid-table-cell"
      role="cell"
      className={cn(
        "[&:not(:last-child)]:border-r",
        colSpanClasses[span],
        className
      )}
      {...props}
    />
  );
}

export {
  GridTable,
  GridTableHeader,
  GridTableBody,
  GridTableRow,
  GridTableHead,
  GridTableCell,
  type GridTableSpan,
};
