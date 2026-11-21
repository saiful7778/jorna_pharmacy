import { Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { Phone } from "lucide-react";

import { FormatDateCell } from "@/components/FormatDateCell";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { ColumnType } from "@/types/data-table";
import { formatCurrency } from "@/utils/formatCurrency";

import type { ListCustomerPaymentsContractType } from "../../api/customerPayment.contract";
import { CustomerPaymentRowAction } from "../customer-details/CustomerPaymentRowAction";

type CustomerPaymentsRowDataType =
  ListCustomerPaymentsContractType["output"]["data"]["data"][number];

const dateColumn: ColumnDef<CustomerPaymentsRowDataType> = {
  id: "createdAt",
  accessorKey: "createdAt",
  header: ({ column }) => (
    <DataTableColumnHeader column={column} label="Date" />
  ),
  cell: ({ getValue }) => (
    <FormatDateCell
      format="dd MMM, yyyy"
      value={getValue<CustomerPaymentsRowDataType["createdAt"]>()}
      className="block whitespace-nowrap"
    />
  ),
  meta: { label: "Date", variant: "date" },
  enableSorting: false,
  enableHiding: false,
};

const customerColumn: ColumnDef<CustomerPaymentsRowDataType> = {
  id: "customer",
  accessorFn: (row) => row.customerName,
  header: ({ column }) => (
    <DataTableColumnHeader column={column} label="Customer" />
  ),
  cell: ({ row }) => <CustomerCell payment={row.original} />,
  meta: { label: "Customer" },
  enableSorting: false,
  enableHiding: false,
};

const saleColumn: ColumnDef<CustomerPaymentsRowDataType> = {
  id: "sale",
  accessorFn: (row) => row.invoiceNo,
  header: ({ column }) => (
    <DataTableColumnHeader column={column} label="Sale" />
  ),
  cell: ({ row }) => {
    const payment = row.original;

    if (!payment.saleId) {
      return <span className="text-muted-foreground">General payment</span>;
    }

    return (
      <div className="flex flex-col">
        <span className="font-medium">
          {payment.invoiceNo ? `Invoice ${payment.invoiceNo}` : "Sale"}
        </span>
        <span className="text-xs text-muted-foreground">
          {payment.saleCreatedAt && (
            <FormatDateCell
              format="dd MMM, yyyy"
              value={payment.saleCreatedAt}
            />
          )}
          {payment.saleTotalAmount !== null && (
            <span>{` · Total ${formatCurrency(payment.saleTotalAmount)}`}</span>
          )}
        </span>
      </div>
    );
  },
  meta: { label: "Sale" },
  enableSorting: false,
  enableHiding: false,
};

const amountColumn: ColumnDef<CustomerPaymentsRowDataType> = {
  id: "amount",
  accessorKey: "amount",
  header: ({ column }) => (
    <DataTableColumnHeader
      className="justify-end"
      column={column}
      label="Amount"
    />
  ),
  cell: ({ getValue }) => (
    <div className="text-right font-medium tabular-nums">
      {formatCurrency(getValue<CustomerPaymentsRowDataType["amount"]>())}
    </div>
  ),
  meta: { label: "Amount", variant: "number" },
  enableSorting: false,
  enableHiding: false,
};

const noteColumn: ColumnDef<CustomerPaymentsRowDataType> = {
  id: "note",
  accessorKey: "note",
  header: ({ column }) => (
    <DataTableColumnHeader column={column} label="Note" />
  ),
  cell: ({ getValue }) => {
    const note = getValue<CustomerPaymentsRowDataType["note"]>();

    return note ? (
      <div className="max-w-xs">
        <span className="line-clamp-1" title={note}>
          {note}
        </span>
      </div>
    ) : (
      <span className="text-muted-foreground">—</span>
    );
  },
  meta: { label: "Note" },
  enableSorting: false,
  enableHiding: false,
};

const actionsColumn: ColumnDef<CustomerPaymentsRowDataType> = {
  id: "actions",
  cell: ({ row }) => (
    <div className="text-right">
      {row.original.saleId && (
        <CustomerPaymentRowAction saleId={row.original.saleId} />
      )}
    </div>
  ),
  enableSorting: false,
  enableHiding: false,
};

export function customerPaymentsTableColumn({
  showCustomer,
}: {
  showCustomer: boolean;
}): ColumnType<CustomerPaymentsRowDataType> {
  return [
    dateColumn,
    ...(showCustomer ? [customerColumn] : []),
    saleColumn,
    amountColumn,
    noteColumn,
    actionsColumn,
  ];
}

function CustomerCell({ payment }: { payment: CustomerPaymentsRowDataType }) {
  return (
    <div className="max-w-56 min-w-36">
      <Link
        to="/dashboard/customers/$customerId"
        params={{ customerId: payment.customerId }}
        search={{ tab: "details" }}
        className="link font-medium"
      >
        {payment.customerName ?? "Unknown customer"}
      </Link>
      {payment.customerPhone ? (
        <span className="mt-0.5 flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
          <Phone aria-hidden="true" className="size-3 shrink-0" />
          <span className="truncate tabular-nums">{payment.customerPhone}</span>
        </span>
      ) : (
        <span className="mt-0.5 block text-xs text-muted-foreground">
          No phone
        </span>
      )}
    </div>
  );
}
