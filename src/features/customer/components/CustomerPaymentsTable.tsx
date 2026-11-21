import { Link } from "@tanstack/react-router";
import { Phone } from "lucide-react";

import { FormatDateCell } from "@/components/FormatDateCell";
import { MetaPagination } from "@/components/MetaPagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/utils/formatCurrency";

import type { ListCustomerPaymentsContractType } from "../api/customerPayment.contract";
import { CustomerPaymentRowAction } from "./customer-details/CustomerPaymentRowAction";

type CustomerPaymentsData = ListCustomerPaymentsContractType["output"]["data"];

export function CustomerPaymentsTable({
  paymentsData,
  onPageChange,
  showCustomer = false,
}: {
  paymentsData: CustomerPaymentsData;
  onPageChange: (page: number) => void;
  showCustomer?: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              {showCustomer && <TableHead>Customer</TableHead>}
              <TableHead>Sale</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Note</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentsData.data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={showCustomer ? 6 : 5}
                  className="py-8 text-center text-muted-foreground"
                >
                  No payments yet
                </TableCell>
              </TableRow>
            ) : (
              paymentsData.data.map((payment) => (
                <PaymentRow
                  key={payment.id}
                  payment={payment}
                  showCustomer={showCustomer}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <MetaPagination meta={paymentsData.meta} onPageChange={onPageChange} />
    </div>
  );
}

function PaymentRow({
  payment,
  showCustomer,
}: {
  payment: CustomerPaymentsData["data"][number];
  showCustomer: boolean;
}) {
  return (
    <TableRow>
      <TableCell>
        <FormatDateCell
          format="dd MMM, yyyy"
          value={payment.createdAt}
          className="block whitespace-nowrap"
        />
      </TableCell>
      {showCustomer && (
        <TableCell>
          <CustomerCell payment={payment} />
        </TableCell>
      )}
      <TableCell>
        {payment.saleId ? (
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
        ) : (
          <span className="text-muted-foreground">General payment</span>
        )}
      </TableCell>
      <TableCell className="text-right font-medium tabular-nums">
        {formatCurrency(payment.amount)}
      </TableCell>
      <TableCell className="max-w-xs">
        {payment.note ? (
          <span className="line-clamp-1" title={payment.note}>
            {payment.note}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        {payment.saleId && <CustomerPaymentRowAction saleId={payment.saleId} />}
      </TableCell>
    </TableRow>
  );
}

function CustomerCell({
  payment,
}: {
  payment: CustomerPaymentsData["data"][number];
}) {
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
