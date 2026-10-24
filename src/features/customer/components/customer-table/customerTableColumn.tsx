import { Link } from "@tanstack/react-router";
import { MapPin, Phone } from "lucide-react";

import { FormatDateCell } from "@/components/FormatDateCell";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import type { ColumnType } from "@/types/data-table";
import { formatCurrency } from "@/utils/formatCurrency";

import type { ListCustomerContractType } from "../../api/customer.contract";
import { CustomerTableRowAction } from "./CustomerTableRowAction";

type CustomerTableRowDataType =
  ListCustomerContractType["output"]["data"]["data"][number];

const DUE_EPSILON = 0.005;

export const customerTableColumn: ColumnType<CustomerTableRowDataType> = [
  {
    id: "customer",
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Customer" />
    ),
    cell: ({ row, getValue }) => (
      <div className="max-w-sm min-w-56">
        <div className="flex items-center gap-2">
          <Link
            to="/dashboard/customers/$customerId"
            params={{ customerId: row.original.id }}
            search={{ tab: "details" }}
            className="link font-medium"
          >
            {getValue<CustomerTableRowDataType["name"]>()}
          </Link>
          {!row.original.isActive && (
            <Badge variant="secondary">Inactive</Badge>
          )}
        </div>
        <div className="mt-1 flex flex-col text-xs text-muted-foreground">
          {row.original.phone ? (
            <span className="inline-flex min-w-0 items-center gap-1">
              <Phone aria-hidden="true" className="size-3 shrink-0" />
              <span className="tabular-nums">{row.original.phone}</span>
            </span>
          ) : (
            <span>No phone</span>
          )}
          {row.original.address ? (
            <span className="inline-flex min-w-0 items-center gap-1">
              <MapPin aria-hidden="true" className="size-3 shrink-0" />
              <span className="line-clamp-1" title={row.original.address}>
                {row.original.address}
              </span>
            </span>
          ) : (
            <span>No address</span>
          )}
        </div>
      </div>
    ),
    meta: { label: "Customer" },
    enableHiding: false,
  },
  {
    id: "dueAmount",
    accessorKey: "dueAmount",
    header: ({ column }) => (
      <DataTableColumnHeader
        className="justify-end"
        column={column}
        label="Due amount"
      />
    ),
    cell: ({ getValue }) => {
      const due = Number(getValue<CustomerTableRowDataType["dueAmount"]>());

      if (due > DUE_EPSILON) {
        return (
          <div className="text-right">
            <span className="font-medium text-destructive tabular-nums">
              {formatCurrency(due)}
            </span>
            <span className="sr-only"> outstanding</span>
          </div>
        );
      }

      if (due < -DUE_EPSILON) {
        return (
          <div className="text-right text-muted-foreground tabular-nums">
            {formatCurrency(Math.abs(due))} advance
          </div>
        );
      }

      return <div className="text-right text-muted-foreground">No due</div>;
    },
    meta: { label: "Due amount" },
    enableSorting: false,
  },
  {
    id: "lastPurchaseAt",
    accessorKey: "lastPurchaseAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Last purchase" />
    ),
    cell: ({ getValue }) => {
      const lastPurchaseAt =
        getValue<CustomerTableRowDataType["lastPurchaseAt"]>();

      return lastPurchaseAt ? (
        <FormatDateCell
          format="dd MMM, yyyy"
          value={lastPurchaseAt}
          className="text-muted-foreground"
        />
      ) : (
        <span className="text-muted-foreground">No purchases</span>
      );
    },
    meta: { label: "Last purchase" },
    enableSorting: false,
  },
  {
    id: "actions",
    cell: ({ row }) => <CustomerTableRowAction customerData={row.original} />,
    enableSorting: false,
    enableHiding: false,
  },
];
