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
import { PurchaseStatusBadge } from "@/features/purchase/components/PurchaseStatusBadge";
import { formatCurrency } from "@/utils/formatCurrency";

import type { ListCompanyPaymentsContractType } from "../api/companyPayment.contract";
import { CompanyPaymentRowAction } from "./company-details/CompanyPaymentRowAction";

type CompanyPaymentsData = ListCompanyPaymentsContractType["output"]["data"];

export function CompanyPaymentsTable({
  paymentsData,
  onPageChange,
  showCompany = false,
}: {
  paymentsData: CompanyPaymentsData;
  onPageChange: (page: number) => void;
  showCompany?: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              {showCompany && <TableHead>Company</TableHead>}
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
                  colSpan={showCompany ? 6 : 5}
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
                  showCompany={showCompany}
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
  showCompany,
}: {
  payment: CompanyPaymentsData["data"][number];
  showCompany: boolean;
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
      {showCompany && (
        <TableCell>
          <CompanyCell payment={payment} />
        </TableCell>
      )}
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

function CompanyCell({
  payment,
}: {
  payment: CompanyPaymentsData["data"][number];
}) {
  return (
    <div className="max-w-56 min-w-36">
      <Link
        to="/dashboard/companies/$companyId"
        params={{ companyId: payment.companyId }}
        search={{ tab: "details" }}
        className="link font-medium"
      >
        {payment.companyName ?? "Unknown company"}
      </Link>
      {payment.companyPhone ? (
        <span className="mt-0.5 flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
          <Phone aria-hidden="true" className="size-3 shrink-0" />
          <span className="truncate tabular-nums">{payment.companyPhone}</span>
        </span>
      ) : (
        <span className="mt-0.5 block text-xs text-muted-foreground">
          No phone
        </span>
      )}
    </div>
  );
}
