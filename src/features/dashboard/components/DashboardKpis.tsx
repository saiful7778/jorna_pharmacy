import { useQuery } from "@tanstack/react-query";
import { HandCoins, ShoppingCart, TrendingUp, Wallet } from "lucide-react";

import { SummaryStat } from "@/components/SummaryStat";
import { QueryStateBoundary } from "@/components/tanstack-query/query-state-boundary";
import { Skeleton } from "@/components/ui/skeleton";
import { BALANCE_EPSILON } from "@/constants";
import { orpcTQClient } from "@/oRPC/orpc";
import { buildDateRangeFilter } from "@/utils/buildDateRangeFilter";
import { formatCurrency } from "@/utils/formatCurrency";

interface DashboardKpiProps {
  startTime?: string | null;
  endTime?: string | null;
}

export function SalesKpis({ startTime, endTime }: DashboardKpiProps) {
  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.sale.stats.queryOptions({
      input: {
        filter: { createdAt: buildDateRangeFilter(startTime, endTime) },
      },
      select: (result) => result.data,
    })
  );

  return (
    <QueryStateBoundary
      isLoading={isLoading}
      isError={isError}
      error={error}
      data={data}
      isEmpty={() => false}
      loadingFallback={
        <>
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full" />
          ))}
        </>
      }
    >
      {(stats) => {
        const hasDue = stats.dueAmount > BALANCE_EPSILON;

        return (
          <>
            <SummaryStat
              label="Revenue"
              value={formatCurrency(stats.totalRevenue)}
              icon={<TrendingUp aria-hidden />}
              color="info"
              trend={`${stats.saleCount} ${stats.saleCount === 1 ? "sale" : "sales"}`}
              trendDirection="neutral"
            />
            <SummaryStat
              label="Collected"
              value={formatCurrency(stats.totalPaid)}
              icon={<HandCoins aria-hidden />}
              color="success"
              trend="Received from sales"
              trendDirection="neutral"
            />
            <SummaryStat
              label="Outstanding"
              value={formatCurrency(Math.max(stats.dueAmount, 0))}
              icon={<Wallet aria-hidden />}
              color={hasDue ? "error" : "success"}
              trend={hasDue ? "Still to collect" : "All sales settled"}
              trendDirection={hasDue ? "down" : "neutral"}
            />
          </>
        );
      }}
    </QueryStateBoundary>
  );
}

export function PurchaseKpi({ startTime, endTime }: DashboardKpiProps) {
  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.purchase.stats.queryOptions({
      input: {
        filter: { createdAt: buildDateRangeFilter(startTime, endTime) },
      },
      select: (result) => result.data,
    })
  );

  return (
    <QueryStateBoundary
      isLoading={isLoading}
      isError={isError}
      error={error}
      data={data}
      isEmpty={() => false}
      loadingFallback={<Skeleton className="h-28 w-full" />}
    >
      {(stats) => (
        <SummaryStat
          label="Purchases"
          value={formatCurrency(stats.totalPurchases)}
          icon={<ShoppingCart aria-hidden />}
          color="info"
          trend={`${stats.purchaseCount} ${stats.purchaseCount === 1 ? "purchase" : "purchases"}`}
          trendDirection="neutral"
        />
      )}
    </QueryStateBoundary>
  );
}
