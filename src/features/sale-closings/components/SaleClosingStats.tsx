import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, Receipt, Scale, Wallet } from "lucide-react";

import { SummaryStat } from "@/components/SummaryStat";
import { QueryStateBoundary } from "@/components/tanstack-query/query-state-boundary";
import { Skeleton } from "@/components/ui/skeleton";
import { BALANCE_EPSILON } from "@/constants";
import { orpcTQClient } from "@/oRPC/orpc";
import { buildDateRangeFilter } from "@/utils/buildDateRangeFilter";
import { formatCurrency } from "@/utils/formatCurrency";

interface SaleClosingStatsProps {
  startTime?: string | null;
  endTime?: string | null;
}

export function SaleClosingStats({
  startTime,
  endTime,
}: SaleClosingStatsProps) {
  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.saleClosing.stats.queryOptions({
      input: {
        filter: {
          periodEnd: buildDateRangeFilter(startTime, endTime),
        },
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
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full" />
          ))}
        </div>
      }
    >
      {(stats) => {
        const isShort = stats.netVariance < -BALANCE_EPSILON;
        const isOver = stats.netVariance > BALANCE_EPSILON;
        const varianceAmount = formatCurrency(Math.abs(stats.netVariance));

        return (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
            <SummaryStat
              label="Closings"
              value={String(stats.closingCount)}
              icon={<CalendarCheck aria-hidden />}
              color="info"
              trend={`${stats.uncountedCount} ${stats.uncountedCount === 1 ? "closing" : "closings"} not counted`}
              trendDirection="neutral"
            />
            <SummaryStat
              label="Total sales"
              value={formatCurrency(stats.totalSales)}
              icon={<Receipt aria-hidden />}
              color="success"
              trend="Sales in selected range"
              trendDirection="neutral"
            />
            <SummaryStat
              label="Cash received"
              value={formatCurrency(stats.cashReceived)}
              icon={<Wallet aria-hidden />}
              color="success"
              trend="Cash collected in selected range"
              trendDirection="neutral"
            />
            <SummaryStat
              label="Net variance"
              value={
                isShort
                  ? `-${varianceAmount}`
                  : isOver
                    ? `+${varianceAmount}`
                    : formatCurrency(0)
              }
              icon={<Scale aria-hidden />}
              color={isShort ? "error" : "success"}
              trend={
                isShort
                  ? "Net short across counted closings"
                  : isOver
                    ? "Net over across counted closings"
                    : "Counted closings balance overall"
              }
              trendDirection={isShort ? "down" : "neutral"}
            />
          </div>
        );
      }}
    </QueryStateBoundary>
  );
}
