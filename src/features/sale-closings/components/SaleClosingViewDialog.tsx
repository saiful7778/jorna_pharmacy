import type { ReactNode } from "react";

import { useQuery } from "@tanstack/react-query";

import { FormatDateCell } from "@/components/FormatDateCell";
import { QueryStateBoundary } from "@/components/tanstack-query/query-state-boundary";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogResponsiveBody,
  DialogResponsiveContent,
  DialogStickyFooter,
  DialogStickyHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { orpcTQClient } from "@/oRPC/orpc";
import { formatCurrency } from "@/utils/formatCurrency";

import type { SaleClosingDetailsContractType } from "../api/saleClosing.contract";

type SaleClosingDetailsType = SaleClosingDetailsContractType["output"]["data"];

export function SaleClosingViewDialog({
  saleClosingId,
  open,
  setOpen,
}: {
  saleClosingId: string;
  open: boolean;
  setOpen: (value: boolean) => void;
}) {
  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.saleClosing.details.queryOptions({
      input: { saleClosingId },
      enabled: open,
      select: (result) => result.data,
    })
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogResponsiveContent className="max-w-full rounded-none sm:max-w-3xl sm:rounded-lg">
        <DialogStickyHeader>
          <DialogTitle>Sale closing details</DialogTitle>
          <DialogDescription>
            Review the sales, cash movement and cash count for this period
          </DialogDescription>
        </DialogStickyHeader>
        <DialogResponsiveBody>
          <QueryStateBoundary
            isLoading={isLoading}
            isError={isError}
            error={error}
            data={data}
            isEmpty={() => false}
            loadingFallback={<SaleClosingViewSkeleton />}
          >
            {(saleClosing) => (
              <SaleClosingViewContent saleClosing={saleClosing} />
            )}
          </QueryStateBoundary>
        </DialogResponsiveBody>
        <DialogStickyFooter>
          <DialogClose render={<Button variant="secondary" />}>
            Close
          </DialogClose>
        </DialogStickyFooter>
      </DialogResponsiveContent>
    </Dialog>
  );
}

function SaleClosingViewContent({
  saleClosing,
}: {
  saleClosing: SaleClosingDetailsType;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <InfoItem
          label="Period"
          value={
            <span className="flex items-center gap-1.5">
              <FormatDateCell
                format="dd MMM, yyyy"
                value={saleClosing.periodStart}
              />
              <span aria-hidden className="text-muted-foreground">
                –
              </span>
              <FormatDateCell
                format="dd MMM, yyyy"
                value={saleClosing.periodEnd}
              />
            </span>
          }
        />
        <InfoItem
          label="Closed by"
          value={saleClosing.closedByUser?.name ?? "—"}
        />
        <InfoItem
          label="Closed on"
          value={
            <FormatDateCell
              format="dd MMM, yyyy hh:mm aa"
              value={saleClosing.createdAt}
            />
          }
        />
      </div>

      {saleClosing.note && <InfoItem label="Note" value={saleClosing.note} />}

      <div className="border">
        <SectionTitle>Sales</SectionTitle>
        <TotalRow
          label="Total sales"
          value={formatCurrency(saleClosing.totalSales)}
        />
        <TotalRow
          label="Cash received"
          value={formatCurrency(saleClosing.cashReceived)}
        />
      </div>
      <div className="border">
        <SectionTitle>Cash outflow</SectionTitle>
        <TotalRow
          label="Expenses"
          value={formatCurrency(saleClosing.totalExpenses)}
        />
        <TotalRow
          label="Salary"
          value={formatCurrency(saleClosing.totalSalary)}
        />
        <TotalRow
          label="Company paid"
          value={formatCurrency(saleClosing.companyPaid ?? 0)}
        />
      </div>

      <div className="border">
        <SectionTitle>Cash reconciliation</SectionTitle>
        <TotalRow
          label="Opening cash"
          value={formatCurrency(saleClosing.openingCash ?? 0)}
        />
        <TotalRow
          label="Expected cash"
          value={formatCurrency(saleClosing.expectedCash)}
          emphasized
        />
        <TotalRow
          label="Counted cash"
          value={
            saleClosing.countedCash === null
              ? "Not counted"
              : formatCurrency(saleClosing.countedCash)
          }
        />
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <p className="border-b px-2 py-1.5 text-xs font-medium text-muted-foreground">
      {children}
    </p>
  );
}

function TotalRow({
  label,
  value,
  emphasized = false,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 border-b last:border-b-0">
      <div className="border-r p-2">
        <span
          className={
            emphasized ? "text-sm font-medium" : "text-sm text-muted-foreground"
          }
        >
          {label}
        </span>
      </div>
      <div
        className={
          emphasized
            ? "p-2 text-right text-sm font-semibold tabular-nums"
            : "p-2 text-right text-sm tabular-nums"
        }
      >
        {value}
      </div>
    </div>
  );
}

function SaleClosingViewSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
      <Skeleton className="h-40 w-full" />
    </div>
  );
}
