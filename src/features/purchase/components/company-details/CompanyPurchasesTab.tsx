import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { FormatDateCell } from "@/components/FormatDateCell";
import { MetaPagination } from "@/components/MetaPagination";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from "@/constants";
import { usePermissionCheck } from "@/hooks/use-permission-check";
import { useSearchNavigate } from "@/hooks/use-search-navigate";
import { orpcTQClient } from "@/oRPC/orpc";
import { formatCurrency } from "@/utils/formatCurrency";

import type { ListPurchaseContractType } from "../../api/purchase.contract";
import { PurchaseCreateDialog } from "../PurchaseCreateDialog";
import { PurchaseStatusBadge } from "../PurchaseStatusBadge";
import { CompanyPurchaseRowAction } from "./CompanyPurchaseRowAction";

export function CompanyPurchasesTab({ companyId }: { companyId: string }) {
  const searchValue = useSearch({
    from: "/dashboard/_dashboardLayout/companies/$companyId",
  });
  const searchNavigate = useSearchNavigate("/dashboard/companies/$companyId");
  const [page, setPage] = useState(DEFAULT_PAGE_INDEX);
  const isAllowCreate = usePermissionCheck([
    { level: "system", resource: "purchase", action: "manage" },
    { level: "system", resource: "purchase", action: "create" },
  ]);

  const handleOpenDialog = (value: boolean) => {
    searchNavigate((prev) => ({
      ...prev,
      purchaseCreateDialog: value,
    }));
  };

  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.purchase.list.queryOptions({
      input: {
        companyId,
        page,
        limit: DEFAULT_PAGE_SIZE,
      },
      select: (result) => result.data,
    })
  );

  return (
    <div className="space-y-2">
      <Card>
        <CardHeader>
          <CardTitle>Purchases</CardTitle>
          <CardDescription>
            All purchases made from this company
          </CardDescription>
          <CardAction>
            {isAllowCreate && (
              <>
                <Button onClick={() => handleOpenDialog(true)}>
                  <Plus />
                  <span>Add new</span>
                </Button>
                <PurchaseCreateDialog
                  companyId={companyId}
                  defaultOpen={searchValue.purchaseCreateDialog}
                  open={searchValue.purchaseCreateDialog}
                  setOpen={handleOpenDialog}
                />
              </>
            )}
          </CardAction>
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
                        <TableHead>Date & invoice</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Paid</TableHead>
                        <TableHead className="text-right">Due</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-0">
                          <span className="sr-only">Actions</span>
                        </TableHead>
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
    </div>
  );
}

function PurchaseRow({
  purchase,
}: {
  purchase: ListPurchaseContractType["output"]["data"]["data"][number];
}) {
  return (
    <TableRow>
      <TableCell>
        <FormatDateCell
          format="dd MMM, yyyy"
          value={purchase.createdAt}
          className="block whitespace-nowrap"
        />
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {purchase.companyInvoiceNo
            ? `Invoice ${purchase.companyInvoiceNo}`
            : "No invoice no"}
        </span>
      </TableCell>
      <TableCell className="text-right font-medium tabular-nums">
        {formatCurrency(purchase.totalAmount)}
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {formatCurrency(purchase.paidAmount)}
      </TableCell>
      <TableCell
        className={
          purchase.dueAmount > 0
            ? "text-right font-semibold text-destructive tabular-nums"
            : "text-right text-muted-foreground tabular-nums"
        }
      >
        {formatCurrency(purchase.dueAmount)}
      </TableCell>
      <TableCell>
        <PurchaseStatusBadge
          due={purchase.dueAmount}
          paidAmount={purchase.paidAmount}
        />
      </TableCell>
      <TableCell>
        <CompanyPurchaseRowAction purchaseId={purchase.id} />
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
