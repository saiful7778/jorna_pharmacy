import { useQuery } from "@tanstack/react-query";
import { HandCoins, Receipt, TrendingUp, Wallet } from "lucide-react";

import { SummaryStat } from "@/components/SummaryStat";
import { QueryStateBoundary } from "@/components/tanstack-query/query-state-boundary";
import { Skeleton } from "@/components/ui/skeleton";
import { BALANCE_EPSILON } from "@/constants";
import { orpcTQClient } from "@/oRPC/orpc";
import { buildDateRangeFilter } from "@/utils/buildDateRangeFilter";
import { formatCurrency } from "@/utils/formatCurrency";

export function SaleStats({
  startTime,
  endTime,
}: {
  startTime?: string | null;
  endTime?: string | null;
}) {
  const statsQuery = useQuery(
    orpcTQClient.sale.stats.queryOptions({
      input: {
        filter: {
          createdAt: buildDateRangeFilter(startTime, endTime),
        },
      },
      select: (result) => result.data,
    })
  );

  return (
    <QueryStateBoundary
      isLoading={statsQuery.isLoading}
      isError={statsQuery.isError}
      error={statsQuery.error}
      data={statsQuery.data}
      isEmpty={() => false}
      loadingFallback={
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-2 md:gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full" />
          ))}
        </div>
      }
    >
      {(stats) => {
        const hasDue = stats.dueAmount > BALANCE_EPSILON;

        return (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-2 md:gap-4">
            <SummaryStat
              label="Total Sales"
              value={String(stats.saleCount)}
              icon={<Receipt aria-hidden />}
              color="info"
              trend="sales in selected range"
              trendDirection="neutral"
            />
            <SummaryStat
              label="Revenue"
              value={formatCurrency(stats.totalRevenue)}
              icon={<TrendingUp aria-hidden />}
              color="info"
              trend="total billed"
              trendDirection="neutral"
            />
            <SummaryStat
              label="Collected"
              value={formatCurrency(stats.totalPaid)}
              icon={<HandCoins aria-hidden />}
              color="success"
              trend="total received"
              trendDirection="neutral"
            />
            <SummaryStat
              label="Outstanding Due"
              value={formatCurrency(Math.max(stats.dueAmount, 0))}
              icon={<Wallet aria-hidden />}
              color={hasDue ? "error" : "success"}
              trend={hasDue ? "Yet to be collected" : "Fully settled"}
              trendDirection={hasDue ? "down" : "neutral"}
            />
          </div>
        );
      }}
    </QueryStateBoundary>
  );
}
