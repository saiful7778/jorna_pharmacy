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

import type { ListCompanyPaymentsContractType } from "../api/companyPayment.contract";
import { PurchaseStatusBadge } from "./PurchaseStatusBadge";
import { CompanyPaymentRowAction } from "./company-details/CompanyPaymentRowAction";

type CompanyPaymentsData = ListCompanyPaymentsContractType["output"]["data"];

export function CompanyPaymentsTable({
  paymentsData,
  onPageChange,
}: {
  paymentsData: CompanyPaymentsData;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Purchase</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Note</TableHead>
              <TableHead className="w-0">
                <span className="sr-only">Actions</span>
              </TableHead>
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
  payment: CompanyPaymentsData["data"][number];
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
        {payment.purchase ? (
          <div className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-1">
              <div className="block text-xs">
                {payment.purchaseId
                  ? payment.purchase.companyInvoiceNo
                    ? `Invoice ${payment.purchase.companyInvoiceNo}`
                    : "No invoice no"
                  : "General payment"}
              </div>
            </div>
            <PurchaseStatusBadge
              due={payment.purchase.dueAmount}
              paidAmount={payment.purchase.paidAmount}
            />
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
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
      <TableCell>
        {payment.purchaseId && (
          <CompanyPaymentRowAction purchaseId={payment.purchaseId} />
        )}
      </TableCell>
    </TableRow>
  );
}
