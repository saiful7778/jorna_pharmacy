import { Link } from "@tanstack/react-router";

import { FormatDateCell } from "@/components/FormatDateCell";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Checkbox } from "@/components/ui/checkbox";
import type { ColumnType } from "@/types/data-table";
import { formatCurrency } from "@/utils/formatCurrency";

import type { ListPurchaseContractType } from "../../api/purchase.contract";
import { PurchaseStatusBadge } from "../PurchaseStatusBadge";
import { PurchaseTableRowAction } from "./PurchaseTableRowAction";

type PurchaseTableRowDataType =
  ListPurchaseContractType["output"]["data"]["data"][number];

export const purchaseTableColumn: ColumnType<PurchaseTableRowDataType> = [
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
        <Link
          to="/dashboard/companies/$companyId"
          params={{ companyId: row.original.company.id }}
          search={{ tab: "details" }}
          className="link block truncate font-medium"
        >
          {row.original.company.name}
        </Link>
        <div className="mt-0.5 truncate text-xs text-muted-foreground">
          {row.original.companyInvoiceNo
            ? `Invoice ${row.original.companyInvoiceNo}`
            : "No invoice no"}
        </div>
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
        {formatCurrency(getValue<PurchaseTableRowDataType["totalAmount"]>())}
      </div>
    ),
    meta: { label: "Total", variant: "number" },
    enableSorting: false,
  },
  {
    id: "paidAmount",
    accessorKey: "paidAmount",
    header: ({ column }) => (
      <DataTableColumnHeader
        className="justify-end"
        column={column}
        label="Paid"
      />
    ),
    cell: ({ getValue }) => (
      <div className="text-right tabular-nums">
        {formatCurrency(getValue<PurchaseTableRowDataType["paidAmount"]>())}
      </div>
    ),
    meta: { label: "Paid", variant: "number" },
    enableSorting: false,
  },
  {
    id: "dueAmount",
    accessorKey: "dueAmount",
    header: ({ column }) => (
      <DataTableColumnHeader
        className="justify-end"
        column={column}
        label="Due"
      />
    ),
    cell: ({ getValue }) => {
      const due = getValue<PurchaseTableRowDataType["dueAmount"]>();
      return (
        <div
          className={
            due > 0
              ? "text-right font-semibold text-destructive tabular-nums"
              : "text-right text-muted-foreground tabular-nums"
          }
        >
          {formatCurrency(due)}
        </div>
      );
    },
    meta: { label: "Due", variant: "number" },
    enableSorting: false,
  },
  {
    id: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Status" />
    ),
    cell: ({ row }) => (
      <PurchaseStatusBadge
        due={row.original.dueAmount}
        paidAmount={row.original.paidAmount}
      />
    ),
    meta: { label: "Status" },
    enableSorting: false,
  },
  {
    id: "note",
    accessorKey: "note",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Note" />
    ),
    cell: ({ getValue }) => {
      const note = getValue<PurchaseTableRowDataType["note"]>();
      return note ? (
        <span className="line-clamp-1 max-w-xs text-sm" title={note}>
          {note}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
    meta: { label: "Note" },
    enableSorting: false,
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Date" />
    ),
    cell: ({ getValue }) => (
      <FormatDateCell
        format="dd MMM, yyyy"
        value={getValue<PurchaseTableRowDataType["createdAt"]>()}
        className="whitespace-nowrap text-muted-foreground"
      />
    ),
    meta: { label: "Date" },
    enableSorting: false,
  },
  {
    id: "actions",
    cell: ({ row }) => <PurchaseTableRowAction purchaseData={row.original} />,
    enableSorting: false,
    enableHiding: false,
  },
];
