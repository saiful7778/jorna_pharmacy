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
import { TimeRangeFilter } from "@/components/time-range-filter";
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
import { useSearchFilter } from "@/hooks/use-search-filter";
import { orpcTQClient } from "@/oRPC/orpc";
import { buildDateRangeFilter } from "@/utils/buildDateRangeFilter";
import { formatCurrency } from "@/utils/formatCurrency";

import { CustomerUpdateDialog } from "../CustomerUpdateDialog";

const BALANCE_EPSILON = 0.005;

export function CustomerDetailsTab({ customerId }: { customerId: string }) {
  const { filters, setFilters } = useSearchFilter(
    "/dashboard/_dashboardLayout/customers/$customerId"
  );
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const isAllowUpdate = usePermissionCheck([
    { level: "system", resource: "customer", action: "update" },
  ]);

  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.customer.details.queryOptions({
      input: {
        customerId,
        createdAt: buildDateRangeFilter(filters.startTime, filters.endTime),
      },
      select: (result) => result.data,
    })
  );

  return (
    <div className="space-y-2">
      <TimeRangeFilter
        rangeSearch={{
          range: filters.range,
          startTime: filters.startTime,
          endTime: filters.endTime,
        }}
        setRangeSearch={(updatedRange) =>
          setFilters({
            range: updatedRange.range,
            startTime: updatedRange.startTime,
            endTime: updatedRange.endTime,
          })
        }
      />
      <QueryStateBoundary
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={() => false}
        data={data}
        loadingFallback={<CustomerDetailsSkeleton />}
      >
        {({ summary, ...customer }) => {
          const hasDue = summary.dueAmount > BALANCE_EPSILON;
          const hasAdvance = summary.dueAmount < -BALANCE_EPSILON;

          return (
            <div className="space-y-4">
              <div className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-4">
                <SummaryStat
                  label="Total sales"
                  value={formatCurrency(summary.totalSales)}
                  icon={<Receipt aria-hidden />}
                  color="info"
                  trend={`${summary.saleCount} ${summary.saleCount === 1 ? "sale" : "sales"}`}
                  trendDirection="neutral"
                />
                <SummaryStat
                  label="Total paid"
                  value={formatCurrency(summary.totalPaid)}
                  icon={<HandCoins aria-hidden />}
                  color="success"
                  trend={`${summary.paymentCount} ${summary.paymentCount === 1 ? "payment" : "payments"}`}
                  trendDirection="neutral"
                />
                <SummaryStat
                  label={hasAdvance ? "Advance balance" : "Due amount"}
                  value={formatCurrency(Math.abs(summary.dueAmount))}
                  icon={<Wallet aria-hidden />}
                  color={hasDue ? "error" : "success"}
                  trend={
                    hasDue
                      ? "Outstanding from customer"
                      : hasAdvance
                        ? "Customer has advance"
                        : "Fully settled"
                  }
                  trendDirection={hasDue ? "down" : "neutral"}
                />
              </div>

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
                        {summary.lastPurchaseAt ? (
                          <FormatDateCell
                            format="dd MMM, yyyy hh:mm aa"
                            value={summary.lastPurchaseAt}
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
          );
        }}
      </QueryStateBoundary>
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
