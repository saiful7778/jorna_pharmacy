import { cn } from "cn";

import { Skeleton } from "../ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { DataTablePaginationSkeleton } from "./data-table-pagination-skeleton";

interface DataTableSkeletonProps extends React.ComponentProps<"div"> {
  rows?: number;
  pagination?: boolean;
}

export function DataTableSkeleton({
  rows = 10,
  pagination = true,
  children,
  className,
  ...props
}: DataTableSkeletonProps) {
  return (
    <div className={cn("flex w-full flex-col gap-2.5", className)} {...props}>
      {children}

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Skeleton className="h-8 w-full" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <TableRow key={`row${rowIndex}`}>
                <TableCell>
                  <Skeleton className="h-8 w-full" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination && <DataTablePaginationSkeleton />}
    </div>
  );
}
