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

import type { CompanyPurchaseDetailsContractType } from "../api/companyPurchase.contract";
import { PurchaseStatusBadge } from "./PurchaseStatusBadge";

type PurchaseDetailsType = CompanyPurchaseDetailsContractType["output"]["data"];

export function PurchaseViewDialog({
  purchaseId,
  open,
  setOpen,
}: {
  purchaseId: string;
  open: boolean;
  setOpen: (value: boolean) => void;
}) {
  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.company.purchase.details.queryOptions({
      input: { purchaseId },
      enabled: open,
      select: (result) => result.data,
    })
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogResponsiveContent className="max-w-full rounded-none sm:max-w-4xl sm:rounded-lg">
        <DialogStickyHeader>
          <DialogTitle>Purchase details</DialogTitle>
          <DialogDescription>
            Review the purchase, its medicine batches and totals
          </DialogDescription>
        </DialogStickyHeader>
        <DialogResponsiveBody>
          <QueryStateBoundary
            isLoading={isLoading}
            isError={isError}
            error={error}
            data={data}
            isEmpty={() => false}
            loadingFallback={<PurchaseViewSkeleton />}
          >
            {(purchase) => <PurchaseViewContent purchase={purchase} />}
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

function PurchaseViewContent({ purchase }: { purchase: PurchaseDetailsType }) {
  const dueAmount = purchase.totalAmount - purchase.paidAmount;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <InfoItem label="Company" value={purchase.company.name} />
        <InfoItem label="Phone" value={purchase.company.phone ?? "—"} />
        <InfoItem label="Address" value={purchase.company.address ?? "—"} />
        <InfoItem label="Invoice no" value={purchase.companyInvoiceNo ?? "—"} />
        <InfoItem
          label="Purchased at"
          value={
            <FormatDateCell
              format="dd MMM, yyyy hh:mm aa"
              value={purchase.createdAt}
            />
          }
        />
        <InfoItem
          label="Status"
          value={
            <PurchaseStatusBadge
              due={dueAmount}
              paidAmount={purchase.paidAmount}
            />
          }
        />
      </div>

      {purchase.note && <InfoItem label="Note" value={purchase.note} />}

      <div className="overflow-x-auto border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Medicine</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Remaining</TableHead>
              <TableHead className="text-right">Cost / unit</TableHead>
              <TableHead className="text-right">Sell / unit</TableHead>
              <TableHead>Expiry</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchase.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No items in this purchase
                </TableCell>
              </TableRow>
            )}
            {purchase.items.map((item) => (
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
                <TableCell>{item.batchNo ?? "—"}</TableCell>
                <TableCell className="text-right">
                  {item.qtyPurchased} {item.medicine.baseUnit}
                </TableCell>
                <TableCell className="text-right">
                  {item.qtyRemaining}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(item.costPerUnit)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(item.sellPerUnit)}
                </TableCell>
                <TableCell>
                  {item.expiryDate ? (
                    <FormatDateCell
                      format="dd MMM, yyyy"
                      value={item.expiryDate}
                    />
                  ) : (
                    "—"
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="ml-auto w-full max-w-sm border">
        <TotalRow label="Subtotal" value={formatCurrency(purchase.subtotal)} />
        <TotalRow label="Discount" value={formatCurrency(purchase.discount)} />
        <TotalRow label="Total" value={formatCurrency(purchase.totalAmount)} />
        <TotalRow label="Paid" value={formatCurrency(purchase.paidAmount)} />
        {dueAmount > 0 && (
          <TotalRow label="Due" value={formatCurrency(dueAmount)} />
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

function PurchaseViewSkeleton() {
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
