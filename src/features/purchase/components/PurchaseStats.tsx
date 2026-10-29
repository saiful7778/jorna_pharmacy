import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, Wallet } from "lucide-react";

import { SummaryStat } from "@/components/SummaryStat";
import { QueryStateBoundary } from "@/components/tanstack-query/query-state-boundary";
import { Skeleton } from "@/components/ui/skeleton";
import { BALANCE_EPSILON } from "@/constants";
import { orpcTQClient } from "@/oRPC/orpc";
import { buildDateRangeFilter } from "@/utils/buildDateRangeFilter";
import { formatCurrency } from "@/utils/formatCurrency";

interface PurchaseStatsProps {
  startTime?: string | null;
  endTime?: string | null;
}

export function PurchaseStats({ startTime, endTime }: PurchaseStatsProps) {
  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.purchase.stats.queryOptions({
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
      isLoading={isLoading}
      isError={isError}
      error={error}
      data={data}
      isEmpty={() => false}
      loadingFallback={
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2 md:gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full" />
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
              label="Total purchases"
              value={formatCurrency(stats.totalPurchases)}
              icon={<ShoppingCart aria-hidden />}
              color="success"
              trend={`${stats.purchaseCount} ${stats.purchaseCount === 1 ? "purchase" : "purchases"} is selected range`}
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
  );
}
