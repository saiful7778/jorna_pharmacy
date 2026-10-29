import type { ReactNode } from "react";

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { QueryStateBoundary } from "@/components/tanstack-query/query-state-boundary";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BALANCE_EPSILON } from "@/constants";
import { orpcTQClient } from "@/oRPC/orpc";
import { buildDateRangeFilter } from "@/utils/buildDateRangeFilter";
import { formatCurrency } from "@/utils/formatCurrency";

interface PaymentsSummaryProps {
  startTime?: string | null;
  endTime?: string | null;
  showCustomers: boolean;
  showCompanies: boolean;
}

export function PaymentsSummary({
  startTime,
  endTime,
  showCustomers,
  showCompanies,
}: PaymentsSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-6">
      {showCustomers && (
        <CustomerPaymentsCard startTime={startTime} endTime={endTime} />
      )}
      {showCompanies && (
        <CompanyPaymentsCard startTime={startTime} endTime={endTime} />
      )}
    </div>
  );
}

function CustomerPaymentsCard({
  startTime,
  endTime,
}: {
  startTime?: string | null;
  endTime?: string | null;
}) {
  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.customer.payment.stats.queryOptions({
      input: {
        filter: { createdAt: buildDateRangeFilter(startTime, endTime) },
      },
      select: (result) => result.data,
    })
  );

  return (
    <PaymentCard
      title="Customer payments"
      action={
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link to="/dashboard/companies/payments" />}
        >
          <span>Payments</span>
        </Button>
      }
    >
      <div className="space-y-4">
        <QueryStateBoundary
          isLoading={isLoading}
          isError={isError}
          error={error}
          data={data}
          isEmpty={() => false}
          loadingFallback={<Skeleton className="h-20 w-full" />}
        >
          {(stats) => (
            <PaymentRows
              received={{ label: "Received", value: stats.totalPaid }}
              balance={{
                label: "Net due",
                amount: stats.dueAmount,
                owedLabel: "Still owed by customers",
                advanceLabel: "Customers paid ahead",
              }}
            />
          )}
        </QueryStateBoundary>
      </div>
    </PaymentCard>
  );
}

function CompanyPaymentsCard({
  startTime,
  endTime,
}: {
  startTime?: string | null;
  endTime?: string | null;
}) {
  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.company.payment.stats.queryOptions({
      input: {
        filter: { createdAt: buildDateRangeFilter(startTime, endTime) },
      },
      select: (result) => result.data,
    })
  );

  return (
    <PaymentCard
      title="Company payments"
      action={
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link to="/dashboard/companies/payments" />}
        >
          <span>Payments</span>
        </Button>
      }
    >
      <QueryStateBoundary
        isLoading={isLoading}
        isError={isError}
        error={error}
        data={data}
        isEmpty={() => false}
        loadingFallback={<Skeleton className="h-20 w-full" />}
      >
        {(stats) => (
          <PaymentRows
            received={{ label: "Paid", value: stats.totalPaid }}
            balance={{
              label: "Net payable",
              amount: stats.dueAmount,
              owedLabel: "Still owed to companies",
              advanceLabel: "Paid ahead of purchases",
            }}
          />
        )}
      </QueryStateBoundary>
    </PaymentCard>
  );
}

function PaymentCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Money in and out in the selected range
        </CardDescription>
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function PaymentRows({
  received,
  balance,
}: {
  received: { label: string; value: number };
  balance: {
    label: string;
    amount: number;
    owedLabel: string;
    advanceLabel: string;
  };
}) {
  const hasOpen = balance.amount > BALANCE_EPSILON;
  const hasAdvance = balance.amount < -BALANCE_EPSILON;

  return (
    <dl className="divide-y text-sm">
      <div className="flex items-center justify-between py-2">
        <dt className="text-muted-foreground">{received.label}</dt>
        <dd className="font-semibold tabular-nums">
          {formatCurrency(received.value)}
        </dd>
      </div>
      <div className="flex items-center justify-between py-2">
        <dt className="text-muted-foreground">
          {hasAdvance ? "Advance" : balance.label}
        </dt>
        <dd className="text-right">
          <span
            className={`font-semibold tabular-nums ${hasOpen ? "text-destructive" : "text-foreground"}`}
          >
            {formatCurrency(Math.abs(balance.amount))}
          </span>
          <span className="block text-xs text-muted-foreground">
            {hasOpen
              ? balance.owedLabel
              : hasAdvance
                ? balance.advanceLabel
                : "Settled"}
          </span>
        </dd>
      </div>
    </dl>
  );
}
