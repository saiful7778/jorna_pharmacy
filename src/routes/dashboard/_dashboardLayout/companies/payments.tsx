import { useState } from "react";

import { Atom, useAtom } from "@effect-atom/atom-react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BuildingComplex,
  Eye,
  HandCoins,
  Plus,
  Receipt,
  Wallet,
} from "lucide-react";

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
import { CompanyPaymentCreateDialog } from "@/features/company/components/CompanyPaymentCreateDialog";
import { CompanyPaymentsTable } from "@/features/company/components/CompanyPaymentsTable";
import { CompanySearchableInput } from "@/features/company/components/CompanySearchableInput";
import { usePermissionCheck } from "@/hooks/use-permission-check";
import { head } from "@/lib/head";
import { orpcTQClient } from "@/oRPC/orpc";
import { formatCurrency } from "@/utils/formatCurrency";

export const Route = createFileRoute(
  "/dashboard/_dashboardLayout/companies/payments"
)({
  beforeLoad: ({ context }) => {
    requirePermissions(
      context.permissions,
      [
        { level: "system", resource: "company_payment", action: "manage" },
        { level: "system", resource: "company_payment", action: "list" },
      ],
      context.user.id
    );
  },
  head: ({ match }) =>
    head({
      pathname: match.pathname,
      titleByTemplate: "Company Payments",
      description: "Manage your company payments",
    }),
  pendingComponent: LoadingComponent,
  component: RouteComponent,
});

const companyIdAtom = Atom.make<string | undefined>(undefined).pipe(
  Atom.keepAlive
);

function RouteComponent() {
  const [companyId, setCompanyId] = useAtom(companyIdAtom);
  const [companySearch, setCompanySearch] = useState("");

  return (
    <DashboardShell
      header={
        <DashboardShellHeader>
          <DashboardShellTitle>Company Payment Management</DashboardShellTitle>
          <DashboardShellDescription>
            Manage your company payments
          </DashboardShellDescription>
        </DashboardShellHeader>
      }
    >
      <div className="space-y-4 rounded-xl border bg-popover p-4">
        <CompanySearchableInput
          defaultOpen
          onReset={() => {
            setCompanyId(undefined);
          }}
          value={companySearch}
          onChange={(value) => {
            setCompanySearch(value);
          }}
          onOptionSelect={(companyData) => setCompanyId(companyData.id)}
        />
        {companyId ? (
          <CompanyPaymentDetails companyId={companyId} />
        ) : (
          <Empty className="min-h-[50dvh]">
            <EmptyHeader>
              <EmptyMedia className="size-10" variant="icon">
                <BuildingComplex className="size-8" strokeWidth={1} />
              </EmptyMedia>
              <EmptyTitle>No companies</EmptyTitle>
              <EmptyDescription>
                First select a company to see payments
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </DashboardShell>
  );
}

function CompanyPaymentDetails({ companyId }: { companyId: string }) {
  const [page, setPage] = useState(DEFAULT_PAGE_INDEX);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const isAllowCreate = usePermissionCheck([
    {
      level: "system",
      resource: "company_payment",
      action: "create",
    },
  ]);

  const paymentQuery = useQuery(
    orpcTQClient.company.payment.list.queryOptions({
      input: {
        page: page,
        limit: DEFAULT_PAGE_SIZE,
        filter: {
          companyId,
        },
      },
      select: (result) => result.data,
    })
  );

  const paymentStatsQuery = useQuery(
    orpcTQClient.company.payment.stats.queryOptions({
      input: {
        filter: {
          companyId,
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
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          nativeButton={false}
          render={
            <Link
              to="/dashboard/companies/$companyId"
              params={{ companyId }}
              search={{ tab: "details" }}
            />
          }
        >
          <Eye />
          <span>Company Details</span>
        </Button>
        <div className="flex items-center gap-2">
          {isAllowCreate && (
            <>
              <Button onClick={() => setOpenDialog(true)}>
                <Plus />
                <span>Add Payment</span>
              </Button>
              <CompanyPaymentCreateDialog
                open={openDialog}
                setOpen={setOpenDialog}
                companyId={companyId}
              />
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
                label="Total purchases"
                value={formatCurrency(stats.totalPurchases)}
                icon={<Receipt aria-hidden />}
                color="info"
                trend={`${stats.purchaseCount} ${stats.purchaseCount === 1 ? "purchase" : "purchases"} is selected range`}
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
                    ? "Payment pending"
                    : hasAdvance
                      ? "Advance payment received"
                      : "Account settled"
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
          <CompanyPaymentsTable
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
