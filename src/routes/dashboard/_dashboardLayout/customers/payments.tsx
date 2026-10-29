import { useState } from "react";

import { Atom, useAtom, useAtomSet } from "@effect-atom/atom-react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, HandCoins, Plus, Receipt, User, Wallet } from "lucide-react";

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
  BALANCE_EPSILON,
  DEFAULT_PAGE_INDEX,
  DEFAULT_PAGE_SIZE,
} from "@/constants";
import { requirePermissions } from "@/features/auth/auth.functions";
import {
  CustomerPaymentCreateDialog,
  openCustomerPaymentCreateDialog,
} from "@/features/customer/components/CustomerPaymentCreateDialog";
import { CustomerPaymentsTable } from "@/features/customer/components/CustomerPaymentsTable";
import { CustomerSearchableInput } from "@/features/customer/components/CustomerSearchableInput";
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
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2 md:gap-4">
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
            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2 md:gap-4">
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
          <CustomerPaymentsTable
            paymentsData={paymentsData}
            onPageChange={setPage}
          />
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
