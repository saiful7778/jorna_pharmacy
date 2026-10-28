import { useState } from "react";

import { Atom, useAtom, useAtomSet } from "@effect-atom/atom-react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, HandCoins, Plus, Receipt, User, Wallet } from "lucide-react";

import { FormatDateCell } from "@/components/FormatDateCell";
import { MetaPagination } from "@/components/MetaPagination";
import { SummaryStat } from "@/components/SummaryStat";
import { DataTableEmpty } from "@/components/data-table/data-table-empty";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import {
  DashboardShellDescription,
  DashboardShellHeader,
  DashboardShellTitle,
} from "@/components/shared/dashboard-shell/DashboardShellHeader";
import {
  DashboardShellDescriptionSkeleton,
  DashboardShellTitleSkeleton,
} from "@/components/shared/dashboard-shell/DashboardShellHeaderSkeleton";
import { DashboardShellSkeleton } from "@/components/shared/dashboard-shell/DashboardShellSkeleton";
import { QueryStateBoundary } from "@/components/tanstack-query/query-state-boundary";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { RefreshButton } from "@/components/ui/refresh-button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BALANCE_EPSILON,
  DEFAULT_PAGE_INDEX,
  DEFAULT_PAGE_SIZE,
} from "@/constants";
import { requirePermissions } from "@/features/auth/auth.functions";
import {
  CustomerPaymentCreateDialog,
  openCustomerPaymentCreateDialog,
} from "@/features/customer/components/CustomerPaymentCreateDialog";
import { CustomerSearchableInput } from "@/features/customer/components/CustomerSearchableInput";
import { CustomerPaymentRowAction } from "@/features/customer/components/customer-details/CustomerPaymentRowAction";
import { usePermissionCheck } from "@/hooks/use-permission-check";
import { head } from "@/lib/head";
import { orpcTQClient } from "@/oRPC/orpc";
import { formatCurrency } from "@/utils/formatCurrency";

export const Route = createFileRoute(
  "/dashboard/_dashboardLayout/customers/payments"
)({
  beforeLoad: ({ context }) => {
    requirePermissions(
      context.permissions,
      [
        { level: "system", resource: "customer_payment", action: "manage" },
        { level: "system", resource: "customer_payment", action: "list" },
      ],
      context.user.id
    );
  },
  head: ({ match }) =>
    head({
      pathname: match.pathname,
      titleByTemplate: "Customer Payments",
      description: "Manage your customer payments",
    }),
  pendingComponent: LoadingComponent,
  component: RouteComponent,
});

const customerIdAtom = Atom.make<string | undefined>(undefined).pipe(
  Atom.keepAlive
);

function RouteComponent() {
  const [customerId, setCustomerId] = useAtom(customerIdAtom);
  const [customerSearch, setCustomerSearch] = useState("");

  return (
    <DashboardShell
      header={
        <DashboardShellHeader>
          <DashboardShellTitle>Customer Payment Management</DashboardShellTitle>
          <DashboardShellDescription>
            Manage your customer payments
          </DashboardShellDescription>
        </DashboardShellHeader>
      }
    >
      <div className="space-y-4 rounded-xl border bg-popover p-4">
        <CustomerSearchableInput
          defaultOpen
          value={customerSearch}
          onChange={(value) => {
            setCustomerSearch(value);
          }}
          onOptionSelect={(customerData) => setCustomerId(customerData.id)}
        />
        {customerId ? (
          <CustomerPaymentDetails customerId={customerId} />
        ) : (
          <Empty className="min-h-[50dvh]">
            <EmptyHeader>
              <EmptyMedia className="size-10" variant="icon">
                <User className="size-8" strokeWidth={1} />
              </EmptyMedia>
              <EmptyTitle>No customer</EmptyTitle>
              <EmptyDescription>
                First select a customer to see payments
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </DashboardShell>
  );
}

function CustomerPaymentDetails({ customerId }: { customerId: string }) {
  const [page, setPage] = useState(DEFAULT_PAGE_INDEX);
  const setCustomerPaymentCreateDialog = useAtomSet(
    openCustomerPaymentCreateDialog
  );
  const isAllowCreate = usePermissionCheck([
    {
      level: "system",
      resource: "customer_payment",
      action: "create",
    },
  ]);

  const paymentQuery = useQuery(
    orpcTQClient.customer.payment.list.queryOptions({
      input: {
        page,
        limit: DEFAULT_PAGE_SIZE,
        filter: {
          customerId,
        },
      },
      select: (result) => result.data,
    })
  );

  const paymentStatsQuery = useQuery(
    orpcTQClient.customer.payment.stats.queryOptions({
      input: {
        filter: {
          customerId,
        },
      },
      select: (result) => result.data,
    })
  );

  const handleRefresh = () => {
    paymentQuery.refetch();
    paymentStatsQuery.refetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          nativeButton={false}
          render={
            <Link
              to="/dashboard/customers/$customerId"
              params={{ customerId }}
              search={{ tab: "details" }}
            />
          }
        >
          <Eye />
          <span>Customer Details</span>
        </Button>
        <div className="ml-auto flex items-center gap-2">
          {isAllowCreate && (
            <>
              <Button onClick={() => setCustomerPaymentCreateDialog(true)}>
                <Plus />
                <span>Add Payment</span>
              </Button>
              <CustomerPaymentCreateDialog customerId={customerId} />
            </>
          )}
          <RefreshButton isLoading={false} onButtonClick={handleRefresh} />
        </div>
      </div>
      <QueryStateBoundary
        isLoading={paymentStatsQuery.isLoading}
        isError={paymentStatsQuery.isError}
        error={paymentStatsQuery.error}
        data={paymentStatsQuery.data}
        isEmpty={() => false}
        loadingFallback={
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Skeleton key={idx} className="h-28 w-full" />
            ))}
          </div>
        }
      >
        {(stats) => {
          const hasDue = stats.dueAmount > BALANCE_EPSILON;
          const hasAdvance = stats.dueAmount < -BALANCE_EPSILON;

          return (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
              <SummaryStat
                label="Total sales"
                value={formatCurrency(stats.totalSales)}
                icon={<Receipt aria-hidden />}
                color="info"
                trend={`${stats.saleCount} ${stats.saleCount === 1 ? "sale" : "sales"} is selected range`}
                trendDirection="neutral"
              />
              <SummaryStat
                label="Total paid"
                value={formatCurrency(stats.totalPaid)}
                icon={<HandCoins aria-hidden />}
                color="success"
                trend={`${stats.paymentCount} ${stats.paymentCount === 1 ? "payment" : "payments"} is selected range`}
                trendDirection="neutral"
              />
              <SummaryStat
                label={hasAdvance ? "Advance balance" : "Due amount"}
                value={formatCurrency(Math.abs(stats.dueAmount))}
                icon={<Wallet aria-hidden />}
                color={hasDue ? "error" : "success"}
                trend={
                  hasDue
                    ? "Outstanding from customer"
                    : hasAdvance
                      ? "Customer has advance"
                      : "Fully settled"
                }
                trendDirection={hasDue ? "down" : "neutral"}
              />
            </div>
          );
        }}
      </QueryStateBoundary>
      <QueryStateBoundary
        isLoading={paymentQuery.isLoading}
        isError={paymentQuery.isError}
        error={paymentQuery.error}
        data={paymentQuery.data}
        isEmpty={() => false}
        loadingFallback={<DataTableSkeleton rows={3} />}
        emptyFallback={<DataTableEmpty />}
      >
        {(paymentsData) => (
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
                  {paymentsData.data.map((payment) => (
                    <TableRow key={payment.id}>
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
                              {payment.invoiceNo
                                ? `Invoice ${payment.invoiceNo}`
                                : "Sale"}
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
                          <span className="text-muted-foreground">
                            General payment
                          </span>
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
                        {payment.saleId && (
                          <CustomerPaymentRowAction saleId={payment.saleId} />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <MetaPagination meta={paymentsData.meta} onPageChange={setPage} />
          </div>
        )}
      </QueryStateBoundary>
    </div>
  );
}

function LoadingComponent() {
  return (
    <DashboardShellSkeleton
      header={
        <DashboardShellHeader>
          <DashboardShellTitleSkeleton />
          <DashboardShellDescriptionSkeleton />
        </DashboardShellHeader>
      }
    >
      <div className="flex items-center justify-center p-2">
        <Spinner />
      </div>
    </DashboardShellSkeleton>
  );
}
