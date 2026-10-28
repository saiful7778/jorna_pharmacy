import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import { FormatDateCell } from "@/components/FormatDateCell";
import { MetaPagination } from "@/components/MetaPagination";
import { QueryStateBoundary } from "@/components/tanstack-query/query-state-boundary";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from "@/constants";
import { usePermissionCheck } from "@/hooks/use-permission-check";
import { orpcTQClient } from "@/oRPC/orpc";
import { formatCurrency } from "@/utils/formatCurrency";

import type { ListCompanyPaymentsContractType } from "../../api/companyPayment.contract";
import { CompanyPaymentCreateDialog } from "../CompanyPaymentCreateDialog";
import { PurchaseStatusBadge } from "../PurchaseStatusBadge";
import { CompanyPaymentRowAction } from "./CompanyPaymentRowAction";

export function CompanyPaymentsTab({ companyId }: { companyId: string }) {
  const [page, setPage] = useState<number>(DEFAULT_PAGE_INDEX);
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const isAllowCreatePayment = usePermissionCheck([
    {
      level: "system",
      resource: "company_payment",
      action: "create",
    },
  ]);

  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.company.payment.list.queryOptions({
      input: {
        page,
        limit: DEFAULT_PAGE_SIZE,
        filter: {
          companyId,
        },
      },
      select: (result) => result.data,
    })
  );

  return (
    <div className="space-y-2">
      <Card>
        <CardHeader>
          <CardTitle>Payments</CardTitle>
          <CardDescription>All payments made to this company</CardDescription>
          {isAllowCreatePayment && (
            <>
              <CardAction>
                <Button size="sm" onClick={() => setOpenDialog(true)}>
                  <Plus />
                  New payment
                </Button>
              </CardAction>
              <CompanyPaymentCreateDialog
                open={openDialog}
                setOpen={setOpenDialog}
                companyId={companyId}
              />
            </>
          )}
        </CardHeader>
        <CardContent>
          <QueryStateBoundary
            isLoading={isLoading}
            isError={isError}
            error={error}
            data={data}
            isEmpty={() => false}
            loadingFallback={<HistorySkeleton />}
          >
            {({ data: payments, meta }) => (
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
                      {payments.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="py-8 text-center text-muted-foreground"
                          >
                            No payments yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        payments.map((payment) => (
                          <PaymentRow key={payment.id} payment={payment} />
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                <MetaPagination meta={meta} onPageChange={setPage} />
              </div>
            )}
          </QueryStateBoundary>
        </CardContent>
      </Card>
    </div>
  );
}

function PaymentRow({
  payment,
}: {
  payment: ListCompanyPaymentsContractType["output"]["data"]["data"][number];
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

function HistorySkeleton() {
  return (
    <div className="space-y-3" aria-busy="true">
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  );
}
