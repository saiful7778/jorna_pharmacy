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
}: {
  paymentsData: CustomerPaymentsData;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
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
                  colSpan={5}
                  className="py-8 text-center text-muted-foreground"
                >
                  No payments yet
                </TableCell>
              </TableRow>
            ) : (
              paymentsData.data.map((payment) => (
                <PaymentRow key={payment.id} payment={payment} />
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
}: {
  payment: CustomerPaymentsData["data"][number];
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
