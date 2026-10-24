import { Link } from "@tanstack/react-router";
import { Phone } from "lucide-react";

import { FormatDateCell } from "@/components/FormatDateCell";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { ColumnType } from "@/types/data-table";
import { formatCurrency } from "@/utils/formatCurrency";

import type { ListSaleContractType } from "../../api/sale.contract";
import { SaleStatusBadge } from "../SaleStatusBadge";
import { SaleTableRowAction } from "./SaleTableRowAction";

type SaleTableRowDataType =
  ListSaleContractType["output"]["data"]["data"][number];

const DUE_EPSILON = 0.005;

function getDue(sale: SaleTableRowDataType) {
  const due = sale.totalAmount - sale.paidAmount;
  return due > DUE_EPSILON ? due : 0;
}

export const saleTableColumn: ColumnType<SaleTableRowDataType> = [
  {
    id: "createdAt",
    accessorKey: "createdAt",
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
          <Link
            to="/dashboard/customers/$customerId"
            params={{ customerId: customer.id }}
            search={{ tab: "details" }}
            className="link font-medium"
          >
            {customer.name}
          </Link>
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
    id: "itemCount",
    accessorKey: "itemCount",
    header: ({ column }) => (
      <DataTableColumnHeader
        className="justify-end"
        column={column}
        label="Items"
      />
    ),
    cell: ({ getValue }) => (
      <div className="text-right tabular-nums">
        {getValue<SaleTableRowDataType["itemCount"]>()}
      </div>
    ),
    meta: { label: "Items", variant: "number" },
    enableSorting: false,
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
    cell: ({ row }) => {
      const { discount, totalAmount } = row.original;

      return (
        <div className="text-right">
          <span className="font-medium tabular-nums">
            {formatCurrency(totalAmount)}
          </span>
          {discount > DUE_EPSILON && (
            <span className="mt-0.5 block text-xs text-muted-foreground tabular-nums">
              Discount {formatCurrency(discount)}
            </span>
          )}
        </div>
      );
    },
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
    cell: ({ getValue }) => {
      const paid = getValue<SaleTableRowDataType["paidAmount"]>();

      if (paid <= DUE_EPSILON) {
        return (
          <div className="text-right text-muted-foreground">No payment</div>
        );
      }

      return (
        <div className="text-right tabular-nums">{formatCurrency(paid)}</div>
      );
    },
    meta: { label: "Paid", variant: "number" },
    enableSorting: false,
  },
  {
    id: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Status" />
    ),
    cell: ({ row }) => {
      const { paidAmount } = row.original;
      const due = getDue(row.original);

      return (
        <div className="flex min-w-24 flex-col items-start gap-1">
          <SaleStatusBadge due={due} paidAmount={paidAmount} />
          {due > DUE_EPSILON && (
            <span className="text-xs text-destructive tabular-nums">
              {formatCurrency(due)} due
            </span>
          )}
        </div>
      );
    },
    meta: { label: "Status" },
    enableSorting: false,
  },
  {
    id: "actions",
    cell: ({ row }) => <SaleTableRowAction saleData={row.original} />,
    enableSorting: false,
    enableHiding: false,
  },
];
