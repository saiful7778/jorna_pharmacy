import { useState } from "react";

import { useAtomSet } from "@effect-atom/atom-react";
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
import { DEFAULT_PAGE_SIZE } from "@/constants";
import { usePermissionCheck } from "@/hooks/use-permission-check";
import { orpcTQClient } from "@/oRPC/orpc";
import { formatCurrency } from "@/utils/formatCurrency";

import type { ListCustomerPaymentsContractType } from "../../api/customerPayment.contract";
import {
  CustomerPaymentCreateDialog,
  openCustomerPaymentCreateDialog,
} from "../CustomerPaymentCreateDialog";

export function CustomerPaymentsTab({ customerId }: { customerId: string }) {
  const [page, setPage] = useState(1);
  const setOpenCustomerPaymentDialog = useAtomSet(
    openCustomerPaymentCreateDialog
  );

  const isAllowCreatePayment = usePermissionCheck([
    {
      level: "system",
      resource: "customer_payment",
      action: "create",
    },
  ]);

  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.customer.payment.list.queryOptions({
      input: { customerId, page, limit: DEFAULT_PAGE_SIZE },
      select: (result) => result.data,
    })
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Payments</CardTitle>
          <CardDescription>
            All payments received from this customer
          </CardDescription>
          {isAllowCreatePayment && (
            <CardAction>
              <Button
                size="sm"
                onClick={() => setOpenCustomerPaymentDialog(true)}
              >
                <Plus />
                Record payment
              </Button>
            </CardAction>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <QueryStateBoundary
            isLoading={isLoading}
            isError={isError}
            error={error}
            data={data}
            isEmpty={() => false}
            loadingFallback={<HistorySkeleton />}
          >
            {({ data: payments, meta }) => (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Against</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Note</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
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
                <MetaPagination meta={meta} onPageChange={setPage} />
              </>
            )}
          </QueryStateBoundary>
        </CardContent>
      </Card>

      {isAllowCreatePayment && (
        <CustomerPaymentCreateDialog customerId={customerId} />
      )}
    </>
  );
}

function PaymentRow({
  payment,
}: {
  payment: ListCustomerPaymentsContractType["output"]["data"]["data"][number];
}) {
  return (
    <TableRow>
      <TableCell className="text-muted-foreground">
        <FormatDateCell format="dd MMM, yyyy" value={payment.createdAt} />
      </TableCell>
      <TableCell>
        {payment.invoiceNo ? (
          <span className="font-medium">{payment.invoiceNo}</span>
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
