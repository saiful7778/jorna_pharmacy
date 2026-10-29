import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { format, parse } from "date-fns";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { QueryStateBoundary } from "@/components/tanstack-query/query-state-boundary";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { orpcTQClient } from "@/oRPC/orpc";
import { buildDateRangeFilter } from "@/utils/buildDateRangeFilter";
import { formatCurrency } from "@/utils/formatCurrency";

interface SalesTrendChartProps {
  startTime?: string | null;
  endTime?: string | null;
}

const chartConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  collected: { label: "Collected", color: "var(--chart-2)" },
} satisfies ChartConfig;

function formatDayLabel(value: unknown) {
  return format(parse(String(value), "yyyy-MM-dd", new Date()), "d MMM");
}

export function SalesTrendChart({ startTime, endTime }: SalesTrendChartProps) {
  const [utcOffsetMinutes] = useState(() => -new Date().getTimezoneOffset());

  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.sale.trend.queryOptions({
      input: {
        filter: { createdAt: buildDateRangeFilter(startTime, endTime) },
        utcOffsetMinutes,
      },
      select: (result) => result.data,
    })
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales by day</CardTitle>
        <CardDescription>Revenue and collected per day</CardDescription>
      </CardHeader>
      <CardContent>
        <QueryStateBoundary
          isLoading={isLoading}
          isError={isError}
          error={error}
          data={data}
          isEmpty={(rows) => rows.length === 0}
          emptyFallback={
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              No sales in the selected range.
            </div>
          }
          loadingFallback={<Skeleton className="h-64 w-full" />}
        >
          {(rows) => (
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-72 w-full"
            >
              <BarChart data={rows} margin={{ left: -20, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={formatDayLabel}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={56}
                  tickFormatter={(value: number) =>
                    value.toLocaleString(undefined, { notation: "compact" })
                  }
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={formatDayLabel}
                      valueFormatter={formatCurrency}
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="revenue"
                  fill="var(--color-revenue)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="collected"
                  fill="var(--color-collected)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          )}
        </QueryStateBoundary>
      </CardContent>
    </Card>
  );
}
