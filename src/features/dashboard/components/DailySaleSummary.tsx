import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { QueryStateBoundary } from "@/components/tanstack-query/query-state-boundary";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { orpcTQClient } from "@/oRPC/orpc";
import { buildDateRangeFilter } from "@/utils/buildDateRangeFilter";
import { formatCurrency } from "@/utils/formatCurrency";

interface DailySaleSummaryProps {
  startTime?: string | null;
  endTime?: string | null;
}

export function DailySaleSummary({
  startTime,
  endTime,
}: DailySaleSummaryProps) {
  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.saleClosing.stats.queryOptions({
      input: {
        filter: { periodEnd: buildDateRangeFilter(startTime, endTime) },
      },
      select: (result) => result.data,
    })
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily sale</CardTitle>
        <CardDescription>Cash closings in the selected range</CardDescription>
      </CardHeader>
      <CardContent>
        <QueryStateBoundary
          isLoading={isLoading}
          isError={isError}
          error={error}
          data={data}
          isEmpty={() => false}
          loadingFallback={<Skeleton className="h-40 w-full" />}
        >
          {(stats) => (
            <dl className="divide-y text-sm">
              <SummaryRow
                label="Closings"
                value={String(stats.closingCount)}
                hint={
                  stats.uncountedCount > 0
                    ? `${stats.uncountedCount} not counted`
                    : undefined
                }
              />
              <SummaryRow
                label="Total Sale"
                value={formatCurrency(stats.totalSales)}
              />
            </dl>
          )}
        </QueryStateBoundary>
      </CardContent>
      <CardFooter className="mt-auto">
        <Button
          variant="outline"
          className="w-full"
          nativeButton={false}
          render={<Link to="/dashboard/sale-closings" />}
        >
          Open daily sale
        </Button>
      </CardFooter>
    </Card>
  );
}

function SummaryRow({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "error" | "warning" | "success";
}) {
  const toneClass = {
    error: "text-destructive",
    warning: "text-orange-600 dark:text-orange-400",
    success: "text-green-600 dark:text-green-400",
  } as const;

  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right">
        <span
          className={`font-semibold tabular-nums ${tone ? toneClass[tone] : "text-foreground"}`}
        >
          {value}
        </span>
        {hint && (
          <span className="block text-xs text-muted-foreground">{hint}</span>
        )}
      </dd>
    </div>
  );
}
