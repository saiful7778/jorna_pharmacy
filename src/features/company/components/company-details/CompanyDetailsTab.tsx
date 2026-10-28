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
import { BALANCE_EPSILON } from "@/constants";
import { usePermissionCheck } from "@/hooks/use-permission-check";
import { orpcTQClient } from "@/oRPC/orpc";
import { formatCurrency } from "@/utils/formatCurrency";

import type { CompanyDetailsContractType } from "../../api/company.contract";
import { CompanyUpdateDialog } from "../CompanyUpdateDialog";

export function CompanyDetailsTab({ companyId }: { companyId: string }) {
  const isAllowUpdate = usePermissionCheck([
    { level: "system", resource: "company", action: "update" },
  ]);
  const [openUpdateDialog, setOpenUpdateDialog] = useState<boolean>(false);

  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.company.details.queryOptions({
      input: {
        companyId,
      },
      select: (result) => result.data,
    })
  );

  return (
    <div className="space-y-2">
      <QueryStateBoundary
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={() => false}
        data={data}
        loadingFallback={<CompanyDetailsSkeleton />}
      >
        {(company) => (
          <div className="space-y-4">
            <CompanySummaryStats summary={company.summary} />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Contact & location</CardTitle>
                  <CardDescription>Company contact info</CardDescription>
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
                      {company.phone ? (
                        <span className="tabular-nums">{company.phone}</span>
                      ) : (
                        <EmptyValue />
                      )}
                    </DetailsItem>
                    <DetailsItem
                      icon={<MapPin aria-hidden className="size-4" />}
                      title="Address"
                    >
                      {company.address ? company.address : <EmptyValue />}
                    </DetailsItem>
                    <DetailsItem
                      icon={<NotepadText aria-hidden className="size-4" />}
                      title="Note"
                    >
                      {company.note ? company.note : <EmptyValue />}
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
                      icon={<CalendarDays aria-hidden className="size-4" />}
                      title="Created at"
                    >
                      <FormatDateCell
                        format="dd MMM, yyyy hh:mm aa"
                        value={company.createdAt}
                      />
                    </DetailsItem>
                    <DetailsItem
                      icon={<CalendarDays aria-hidden className="size-4" />}
                      title="Last updated"
                    >
                      <FormatDateCell
                        format="dd MMM, yyyy hh:mm aa"
                        value={company.updatedAt}
                      />
                    </DetailsItem>
                  </dl>
                </CardContent>
              </Card>
            </div>

            {isAllowUpdate && (
              <CompanyUpdateDialog
                open={openUpdateDialog}
                setOpen={setOpenUpdateDialog}
                companyId={companyId}
                companyData={{
                  name: company.name,
                  isActive: company.isActive,
                  address: company.address,
                  note: company.note,
                  phone: company.phone,
                }}
              />
            )}
          </div>
        )}
      </QueryStateBoundary>
    </div>
  );
}

function CompanySummaryStats({
  summary,
}: {
  summary: CompanyDetailsContractType["output"]["data"]["summary"];
}) {
  const hasDue = summary.dueAmount > BALANCE_EPSILON;
  const hasAdvance = summary.dueAmount < -BALANCE_EPSILON;

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-4">
      <SummaryStat
        label="Total purchases"
        value={formatCurrency(summary.totalPurchases)}
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
        label={hasAdvance ? "Advance balance" : "Due amount"}
        value={formatCurrency(Math.abs(summary.dueAmount))}
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

export function CompanyDetailsSkeleton() {
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
