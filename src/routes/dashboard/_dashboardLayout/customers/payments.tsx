import { useAtomSet } from "@effect-atom/atom-react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Banknote, HandCoins, Plus, ReceiptText, Wallet } from "lucide-react";
import z from "zod";

import { FormatDateCell } from "@/components/FormatDateCell";
import { MetaPagination } from "@/components/MetaPagination";
import { DataTableEmpty } from "@/components/data-table/data-table-empty";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbarSkeleton } from "@/components/data-table/data-table-toolbar-skeleton";
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
import { TimeRangeFilter } from "@/components/time-range-filter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  Stat,
  StatIndicator,
  StatLabel,
  StatTrend,
  StatValue,
} from "@/components/ui/stat";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requirePermissions } from "@/features/auth/auth.functions";
import {
  CustomerPaymentCreateDialog,
  openCustomerPaymentCreateDialog,
} from "@/features/customer/components/CustomerPaymentCreateDialog";
import { CustomerSidebar } from "@/features/customer/components/CustomerSidebar";
import { usePermissionCheck } from "@/hooks/use-permission-check";
import { head } from "@/lib/head";
import { querySearchSchema, rangeFilterSchema } from "@/lib/querySearchSchema";
import { orpcTQClient } from "@/oRPC/orpc";
import { buildDateRangeFilter } from "@/utils/buildDateRangeFilter";
import { formatCurrency } from "@/utils/formatCurrency";

const searchFields = ["invoiceNo"];

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
  validateSearch: querySearchSchema
    .extend(rangeFilterSchema.shape)
    .extend({ customerId: z.uuid().optional() }),
  loaderDeps: ({ search }) => search,
  head: ({ match }) =>
    head({
      pathname: match.pathname,
      titleByTemplate: "Customer Payments",
      description: "Manage your customer payments",
    }),
  loader: async ({ context: { queryClient }, deps }) => {
    await queryClient.query(
      orpcTQClient.customer.payment.list.queryOptions({
        input: {
          page: deps.page,
          limit: deps.limit,
          search: deps.search,
          searchFields,
          order: deps.order,
          orderField: deps.orderField,
          customerId: deps.customerId,
        },
      })
    );
    await queryClient.query(
      orpcTQClient.customer.payment.stats.queryOptions({
        input: {
          customerId: deps.customerId,
          filter: {
            createdAt: buildDateRangeFilter(deps.startTime, deps.endTime),
          },
        },
      })
    );
  },
  pendingComponent: LoadingComponent,
  component: RouteComponent,
});

function RouteComponent() {
  "use no memo";
  const setCustomerPaymentCreateDialog = useAtomSet(
    openCustomerPaymentCreateDialog
  );
  const navigate = Route.useNavigate();
  const search = Route.useSearch();
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
        page: search.page,
        limit: search.limit,
        search: search.search,
        searchFields,
        order: search.order,
        orderField: search.orderField,
        customerId: search.customerId,
      },
      select: (result) => result.data,
    })
  );
  const paymentStatsQuery = useQuery(
    orpcTQClient.customer.payment.stats.queryOptions({
      input: {
        customerId: search.customerId,
        filter: {
          createdAt: buildDateRangeFilter(search.startTime, search.endTime),
        },
      },
      select: (result) => result.data,
    })
  );

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
      <div className="grid gap-3 lg:grid-cols-3">
        <CustomerSidebar
          value={search.customerId}
          onSelect={(selectedCustomerId) =>
            navigate({ search: { customerId: selectedCustomerId } })
          }
        />
        <div className="overflow-auto rounded-xl bg-popover p-4 text-popover-foreground lg:col-span-2">
          {search.customerId ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <TimeRangeFilter
                  rangeSearch={{
                    range: search.range,
                    startTime: search.startTime,
                    endTime: search.endTime,
                  }}
                  setRangeSearch={(updatedValue) =>
                    navigate({
                      search: {
                        ...(updatedValue.range && {
                          range: updatedValue.range,
                        }),
                        ...(updatedValue.startTime && {
                          startTime: updatedValue.startTime,
                        }),
                        ...(updatedValue.endTime && {
                          endTime: updatedValue.endTime,
                        }),
                      },
                    })
                  }
                />
                <div className="flex items-center gap-2">
                  {isAllowCreate && (
                    <>
                      <Button
                        onClick={() => setCustomerPaymentCreateDialog(true)}
                      >
                        <Plus />
                        <span>Add Payment</span>
                      </Button>
                      <CustomerPaymentCreateDialog
                        customerId={search.customerId}
                      />
                    </>
                  )}
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
                    {Array.from({ length: 3 }).map((_, index) => (
                      <Skeleton key={index} className="h-28 w-full" />
                    ))}
                  </div>
                }
              >
                {(stats) => (
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-4">
                    <Stat>
                      <StatLabel>Total Sales</StatLabel>
                      <StatIndicator variant="icon" color="info">
                        <Banknote aria-hidden />
                      </StatIndicator>
                      <StatValue>{formatCurrency(stats.totalSales)}</StatValue>
                      <StatTrend trend="neutral">in selected range</StatTrend>
                    </Stat>
                    <Stat>
                      <StatLabel>Total Paid</StatLabel>
                      <StatIndicator variant="icon" color="success">
                        <Wallet aria-hidden />
                      </StatIndicator>
                      <StatValue>{formatCurrency(stats.totalPaid)}</StatValue>
                      <StatTrend trend="neutral">in selected range</StatTrend>
                    </Stat>
                    <Stat>
                      <StatLabel>Due Payment</StatLabel>
                      <StatIndicator variant="icon" color="error">
                        <HandCoins aria-hidden />
                      </StatIndicator>
                      <StatValue>{formatCurrency(stats.dueAmount)}</StatValue>
                      <StatTrend trend="neutral">
                        across all purchases
                      </StatTrend>
                    </Stat>
                    <Stat>
                      <StatLabel>Payments</StatLabel>
                      <StatIndicator variant="icon" color="info">
                        <ReceiptText aria-hidden />
                      </StatIndicator>
                      <StatValue>{stats.paymentCount}</StatValue>
                      <StatTrend trend="neutral">in selected range</StatTrend>
                    </Stat>
                  </div>
                )}
              </QueryStateBoundary>
              <QueryStateBoundary
                isLoading={paymentQuery.isLoading}
                isError={paymentQuery.isError}
                error={paymentQuery.error}
                data={paymentQuery.data}
                isEmpty={() => false}
                loadingFallback={
                  <DataTableSkeleton>
                    <DataTableToolbarSkeleton />
                  </DataTableSkeleton>
                }
                emptyFallback={<DataTableEmpty />}
              >
                {(paymentsData) => (
                  <div className="flex flex-col gap-2">
                    <div className="overflow-hidden rounded-md border">
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
                          {paymentsData.data.map((payment) => (
                            <TableRow key={payment.id}>
                              <TableCell className="text-muted-foreground">
                                <FormatDateCell
                                  format="dd MMM, yyyy"
                                  value={payment.createdAt}
                                />
                              </TableCell>
                              <TableCell>
                                {payment.invoiceNo ? (
                                  <span className="font-medium">
                                    {payment.invoiceNo}
                                  </span>
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
                                  <span
                                    className="line-clamp-1"
                                    title={payment.note}
                                  >
                                    {payment.note}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">
                                    —
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <MetaPagination
                      meta={paymentsData.meta}
                      onPageChange={(page) => {
                        navigate({ search: { page } });
                      }}
                    />
                  </div>
                )}
              </QueryStateBoundary>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
              First select a customer
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
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
