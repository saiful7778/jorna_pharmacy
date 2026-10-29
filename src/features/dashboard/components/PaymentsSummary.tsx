import type { ReactNode } from "react";

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { QueryStateBoundary } from "@/components/tanstack-query/query-state-boundary";
import { Button } from "@/components/ui/button";
import {
  Card,
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
    <Card>
      <CardHeader>
        <CardTitle>Payments</CardTitle>
        <CardDescription>
          Money in and out in the selected range
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        {showCustomers && (
          <CustomerColumn startTime={startTime} endTime={endTime} />
        )}
        {showCompanies && (
          <CompanyColumn startTime={startTime} endTime={endTime} />
        )}
      </CardContent>
    </Card>
  );
}

function CustomerColumn({
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
    <PaymentColumn
      title="Customers"
      link={{ to: "/dashboard/customers/payments", label: "Customer payments" }}
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
    </PaymentColumn>
  );
}

function CompanyColumn({
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
    <PaymentColumn
      title="Companies"
      link={{ to: "/dashboard/companies/payments", label: "Company payments" }}
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
    </PaymentColumn>
  );
}

function PaymentColumn({
  title,
  link,
  children,
}: {
  title: string;
  link: {
    to: "/dashboard/customers/payments" | "/dashboard/companies/payments";
    label: string;
  };
  children: ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {children}
      <Button
        variant="outline"
        size="sm"
        nativeButton={false}
        render={<Link to={link.to} />}
      >
        {link.label}
      </Button>
    </div>
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
