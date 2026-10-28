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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { orpcTQClient } from "@/oRPC/orpc";
import { formatCurrency } from "@/utils/formatCurrency";

import type { SaleDetailsContractType } from "../api/sale.contract";
import { SaleStatusBadge } from "./SaleStatusBadge";

type SaleDetailsType = SaleDetailsContractType["output"]["data"];

export function SaleViewDialog({
  saleId,
  open,
  setOpen,
}: {
  saleId: string;
  open: boolean;
  setOpen: (value: boolean) => void;
}) {
  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.sale.details.queryOptions({
      input: { saleId },
      enabled: open,
      select: (result) => result.data,
    })
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogResponsiveContent className="max-w-full rounded-none sm:max-w-4xl sm:rounded-lg">
        <DialogStickyHeader>
          <DialogTitle>Sale details</DialogTitle>
          <DialogDescription>
            Review the sold medicines, customer and totals
          </DialogDescription>
        </DialogStickyHeader>
        <DialogResponsiveBody>
          <QueryStateBoundary
            isLoading={isLoading}
            isError={isError}
            error={error}
            data={data}
            isEmpty={() => false}
            loadingFallback={<SaleViewSkeleton />}
          >
            {(sale) => <SaleViewContent sale={sale} />}
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

function SaleViewContent({ sale }: { sale: SaleDetailsType }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <InfoItem label="Invoice no" value={sale.invoiceNo} />
        <InfoItem
          label="Sold at"
          value={
            <FormatDateCell
              format="dd MMM, yyyy hh:mm aa"
              value={sale.createdAt}
            />
          }
        />
        <InfoItem
          label="Status"
          value={
            <SaleStatusBadge
              due={sale.dueAmount}
              paidAmount={sale.paidAmount}
            />
          }
        />
        <InfoItem label="Customer" value={sale.customer?.name ?? "Walk-in"} />
        <InfoItem label="Phone" value={sale.customer?.phone ?? "—"} />
        <InfoItem label="Address" value={sale.customer?.address ?? "—"} />
      </div>

      <div className="overflow-x-auto border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Medicine</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Unit price</TableHead>
              <TableHead className="text-right">Line total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sale.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No items in this sale
                </TableCell>
              </TableRow>
            )}
            {sale.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex min-w-0 flex-col">
                    <span className="font-medium">{item.medicine.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {[item.medicine.genericName, item.medicine.strength]
                        .filter(Boolean)
                        .join(" - ") || item.medicine.type}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {item.qty} {item.medicine.baseUnit}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(item.unitPrice)}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatCurrency(item.lineTotal)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="ml-auto w-full max-w-sm border">
        <TotalRow label="Subtotal" value={formatCurrency(sale.subtotal)} />
        <TotalRow label="Discount" value={formatCurrency(sale.discount)} />
        <TotalRow label="Total" value={formatCurrency(sale.totalAmount)} />
        <TotalRow label="Paid" value={formatCurrency(sale.paidAmount)} />
        {sale.dueAmount > 0 && (
          <TotalRow label="Due" value={formatCurrency(sale.dueAmount)} />
        )}
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

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-2 border-b last:border-b-0">
      <div className="border-r p-2">
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="p-2 text-right text-sm">{value}</div>
    </div>
  );
}

function SaleViewSkeleton() {
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
