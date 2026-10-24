import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  Edit,
  HandCoins,
  MapPin,
  NotepadText,
  Phone,
  Receipt,
  ShoppingBag,
  Wallet,
} from "lucide-react";

import { FormatDateCell } from "@/components/FormatDateCell";
import { SummaryStat } from "@/components/SummaryStat";
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
import { usePermissionCheck } from "@/hooks/use-permission-check";
import { orpcTQClient } from "@/oRPC/orpc";
import { formatCurrency } from "@/utils/formatCurrency";

import type { CustomerDetailsContractType } from "../../api/customer.contract";
import { CustomerUpdateDialog } from "../CustomerUpdateDialog";

const BALANCE_EPSILON = 0.005;

export function CustomerDetailsTab({ customerId }: { customerId: string }) {
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const isAllowUpdate = usePermissionCheck([
    { level: "system", resource: "customer", action: "update" },
  ]);

  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.customer.details.queryOptions({
      input: { customerId },
      select: (result) => result.data,
    })
  );

  return (
    <QueryStateBoundary
      isLoading={isLoading}
      isError={isError}
      error={error}
      isEmpty={() => false}
      data={data}
      loadingFallback={<CustomerDetailsSkeleton />}
    >
      {(customer) => (
        <div className="space-y-4">
          <CustomerSummaryStats summary={customer.summary} />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Contact & location</CardTitle>
                <CardDescription>Customer contact info</CardDescription>
                <CardAction>
                  {isAllowUpdate && (
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => setOpenUpdateDialog(true)}
                    >
                      <Edit />
                    </Button>
                  )}
                </CardAction>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-6 sm:grid-cols-2">
                  <DetailsItem
                    icon={<Phone aria-hidden className="size-4" />}
                    title="Phone"
                  >
                    {customer.phone ? (
                      <span className="tabular-nums">{customer.phone}</span>
                    ) : (
                      <EmptyValue />
                    )}
                  </DetailsItem>
                  <DetailsItem
                    icon={<MapPin aria-hidden className="size-4" />}
                    title="Address"
                  >
                    {customer.address ? customer.address : <EmptyValue />}
                  </DetailsItem>
                  <DetailsItem
                    icon={<NotepadText aria-hidden className="size-4" />}
                    title="Note"
                  >
                    {customer.note ? customer.note : <EmptyValue />}
                  </DetailsItem>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Record</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-6">
                  <DetailsItem
                    icon={<ShoppingBag aria-hidden className="size-4" />}
                    title="Last purchase"
                  >
                    {customer.summary.lastPurchaseAt ? (
                      <FormatDateCell
                        format="dd MMM, yyyy hh:mm aa"
                        value={customer.summary.lastPurchaseAt}
                      />
                    ) : (
                      <EmptyValue />
                    )}
                  </DetailsItem>
                  <DetailsItem
                    icon={<CalendarDays aria-hidden className="size-4" />}
                    title="Created at"
                  >
                    <FormatDateCell
                      format="dd MMM, yyyy hh:mm aa"
                      value={customer.createdAt}
                    />
                  </DetailsItem>
                  <DetailsItem
                    icon={<CalendarDays aria-hidden className="size-4" />}
                    title="Last updated"
                  >
                    <FormatDateCell
                      format="dd MMM, yyyy hh:mm aa"
                      value={customer.updatedAt}
                    />
                  </DetailsItem>
                </dl>
              </CardContent>
            </Card>
          </div>

          {isAllowUpdate && (
            <CustomerUpdateDialog
              open={openUpdateDialog}
              setOpen={setOpenUpdateDialog}
              customerId={customerId}
              customerData={{
                name: customer.name,
                phone: customer.phone,
                address: customer.address,
                note: customer.note,
                isActive: customer.isActive,
              }}
            />
          )}
        </div>
      )}
    </QueryStateBoundary>
  );
}

function CustomerSummaryStats({
  summary,
}: {
  summary: CustomerDetailsContractType["output"]["data"]["summary"];
}) {
  const hasDue = summary.dueAmount > BALANCE_EPSILON;
  const hasAdvance = summary.dueAmount < -BALANCE_EPSILON;
  const balanceLabel = hasAdvance ? "Advance balance" : "Due amount";
  const balanceTrend = hasDue
    ? "Outstanding from customer"
    : hasAdvance
      ? "Customer has advance"
      : "Fully settled";

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <SummaryStat
        label="Total purchases"
        value={formatCurrency(summary.totalPurchased)}
        icon={<Receipt aria-hidden />}
        color="info"
        trend={`${summary.purchaseCount} purchase${summary.purchaseCount === 1 ? "" : "s"}`}
        trendDirection="neutral"
      />
      <SummaryStat
        label="Total paid"
        value={formatCurrency(summary.totalPaid)}
        icon={<HandCoins aria-hidden />}
        color="success"
        trend={`${summary.paymentCount} payment${summary.paymentCount === 1 ? "" : "s"}`}
        trendDirection="neutral"
      />
      <SummaryStat
        label={balanceLabel}
        value={formatCurrency(Math.abs(summary.dueAmount))}
        icon={<Wallet aria-hidden />}
        color={hasDue ? "error" : "success"}
        trend={balanceTrend}
        trendDirection={hasDue ? "down" : "neutral"}
      />
    </div>
  );
}

function DetailsItem({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <dt className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        {icon}
        <span>{title}</span>
      </dt>
      <dd className="text-sm break-words">{children}</dd>
    </div>
  );
}

function EmptyValue() {
  return <span className="text-muted-foreground">Not provided</span>;
}

export function CustomerDetailsSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-40 w-full lg:col-span-2" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-28 w-full lg:col-span-3" />
      </div>
    </div>
  );
}
