import { differenceInCalendarDays } from "date-fns";
import { Phone } from "lucide-react";

import { FormatDateCell } from "@/components/FormatDateCell";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Checkbox } from "@/components/ui/checkbox";
import { BIN_RETENTION_DAYS } from "@/constants";
import type { ColumnType } from "@/types/data-table";
import { formatCurrency } from "@/utils/formatCurrency";

import type { ListSaleBinContractType } from "../../api/saleDelete.contract";
import { SaleBinTableRowAction } from "./SaleBinTableRowAction";

type SaleBinTableRowDataType =
  ListSaleBinContractType["output"]["data"]["data"][number];

export const saleBinTableColumn: ColumnType<SaleBinTableRowDataType> = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all sales on this page"
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected()}
        onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label={`Select ${row.original.invoiceNo}`}
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onCheckedChange={(checked) => row.toggleSelected(checked)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "invoiceNo",
    accessorKey: "invoiceNo",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Invoice" />
    ),
    cell: ({ row }) => (
      <div className="min-w-32">
        <span className="font-medium tabular-nums">
          {row.original.invoiceNo}
        </span>
        <FormatDateCell
          format="dd MMM, yyyy · hh:mm a"
          value={row.original.createdAt}
          className="mt-0.5 block text-xs text-muted-foreground tabular-nums"
        />
      </div>
    ),
    meta: { label: "Invoice" },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "customer",
    accessorFn: (row) => row.customer?.name,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Customer" />
    ),
    cell: ({ row }) => {
      const customer = row.original.customer;

      if (!customer) {
        return (
          <div className="min-w-36">
            <span className="font-medium">Walk-in customer</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              No customer selected
            </span>
          </div>
        );
      }

      return (
        <div className="max-w-56 min-w-36">
          <span className="font-medium">{customer.name}</span>
          {customer.phone ? (
            <span className="mt-0.5 flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
              <Phone aria-hidden="true" className="size-3 shrink-0" />
              <span className="truncate tabular-nums">{customer.phone}</span>
            </span>
          ) : (
            <span className="mt-0.5 block text-xs text-muted-foreground">
              No phone
            </span>
          )}
        </div>
      );
    },
    meta: { label: "Customer" },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "totalAmount",
    accessorKey: "totalAmount",
    header: ({ column }) => (
      <DataTableColumnHeader
        className="justify-end"
        column={column}
        label="Total"
      />
    ),
    cell: ({ getValue }) => (
      <div className="text-right font-medium tabular-nums">
        {formatCurrency(getValue<SaleBinTableRowDataType["totalAmount"]>())}
      </div>
    ),
    meta: { label: "Total", variant: "number" },
    enableSorting: false,
  },
  {
    id: "deletedAt",
    accessorKey: "deletedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Deleted on" />
    ),
    cell: ({ getValue }) => {
      const deletedAt = getValue<SaleBinTableRowDataType["deletedAt"]>();

      return deletedAt ? (
        <FormatDateCell
          format="dd MMM, yyyy"
          value={deletedAt}
          className="text-muted-foreground"
        />
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
    meta: { label: "Deleted on" },
    enableSorting: false,
  },
  {
    id: "purgeIn",
    header: "Purge in",
    cell: ({ row }) => {
      const { deletedAt } = row.original;

      if (!deletedAt) {
        return <span className="text-muted-foreground">-</span>;
      }

      const daysLeft = Math.max(
        BIN_RETENTION_DAYS - differenceInCalendarDays(new Date(), deletedAt),
        0
      );

      return (
        <span className="text-muted-foreground tabular-nums">
          {daysLeft} {daysLeft === 1 ? "day" : "days"}
        </span>
      );
    },
    meta: { label: "Purge in" },
    enableSorting: false,
  },
  {
    id: "actions",
    cell: ({ row }) => <SaleBinTableRowAction saleData={row.original} />,
    enableSorting: false,
    enableHiding: false,
  },
];
