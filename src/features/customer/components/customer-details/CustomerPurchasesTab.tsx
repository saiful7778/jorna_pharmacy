import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { FormatDateCell } from "@/components/FormatDateCell";
import { MetaPagination } from "@/components/MetaPagination";
import { QueryStateBoundary } from "@/components/tanstack-query/query-state-boundary";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DEFAULT_PAGE_SIZE } from "@/constants";
import type { ListSaleContractType } from "@/features/sale/api/sale.contract";
import { SaleStatusBadge } from "@/features/sale/components/SaleStatusBadge";
import { orpcTQClient } from "@/oRPC/orpc";
import { formatCurrency } from "@/utils/formatCurrency";

export function CustomerPurchasesTab({ customerId }: { customerId: string }) {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.sale.list.queryOptions({
      input: { customerId, page, limit: DEFAULT_PAGE_SIZE },
      select: (result) => result.data,
    })
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchases</CardTitle>
        <CardDescription>All purchases made by this customer</CardDescription>
      </CardHeader>
      <CardContent>
        <QueryStateBoundary
          isLoading={isLoading}
          isError={isError}
          error={error}
          data={data}
          isEmpty={() => false}
          loadingFallback={<HistorySkeleton />}
        >
          {({ data: purchases, meta }) => (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Invoice</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Paid</TableHead>
                      <TableHead className="text-right">Due</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchases.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="py-8 text-center text-muted-foreground"
                        >
                          No purchases yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      purchases.map((purchase) => (
                        <PurchaseRow key={purchase.id} purchase={purchase} />
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <MetaPagination meta={meta} onPageChange={setPage} />
            </div>
          )}
        </QueryStateBoundary>
      </CardContent>
    </Card>
  );
}

function PurchaseRow({
  purchase,
}: {
  purchase: ListSaleContractType["output"]["data"]["data"][number];
}) {
  const due = purchase.totalAmount - purchase.paidAmount;

  return (
    <TableRow>
      <TableCell className="text-muted-foreground">
        <FormatDateCell format="dd MMM, yyyy" value={purchase.createdAt} />
      </TableCell>
      <TableCell>
        <span className="font-medium">{purchase.invoiceNo}</span>
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {formatCurrency(purchase.totalAmount)}
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {formatCurrency(purchase.paidAmount)}
      </TableCell>
      <TableCell
        className={
          due > 0
            ? "text-right font-medium text-destructive tabular-nums"
            : "text-right tabular-nums"
        }
      >
        {formatCurrency(Math.max(due, 0))}
      </TableCell>
      <TableCell>
        <SaleStatusBadge due={due} paidAmount={purchase.paidAmount} />
      </TableCell>
    </TableRow>
  );
}

function HistorySkeleton() {
  return (
    <div className="space-y-3" aria-busy="true">
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  );
}
