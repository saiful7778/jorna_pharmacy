import { differenceInCalendarDays } from "date-fns";

import { FormatDateCell } from "@/components/FormatDateCell";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Checkbox } from "@/components/ui/checkbox";
import { BIN_RETENTION_DAYS } from "@/constants";
import type { ColumnType } from "@/types/data-table";
import { formatCurrency } from "@/utils/formatCurrency";

import type { ListPurchaseBinContractType } from "../../api/purchaseDelete.contract";
import { PurchaseBinTableRowAction } from "./PurchaseBinTableRowAction";

type PurchaseBinTableRowDataType =
  ListPurchaseBinContractType["output"]["data"]["data"][number];

export const purchaseBinTableColumn: ColumnType<PurchaseBinTableRowDataType> = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all purchases on this page"
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected()}
        onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label={`Select purchase from ${row.original.company.name}`}
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onCheckedChange={(checked) => row.toggleSelected(checked)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "company",
    accessorFn: (row) => row.company.name,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Company" />
    ),
    cell: ({ row }) => (
      <div className="max-w-56 min-w-36">
        <div className="font-medium">{row.original.company.name}</div>
        <FormatDateCell
          format="dd MMM, yyyy"
          value={row.original.createdAt}
          className="mt-0.5 block text-xs text-muted-foreground tabular-nums"
        />
      </div>
    ),
    meta: { label: "Company" },
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
        {formatCurrency(getValue<PurchaseBinTableRowDataType["totalAmount"]>())}
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
      const deletedAt = getValue<PurchaseBinTableRowDataType["deletedAt"]>();

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
    cell: ({ row }) => (
      <PurchaseBinTableRowAction purchaseData={row.original} />
    ),
    enableSorting: false,
    enableHiding: false,
  },
];
