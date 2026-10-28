import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";

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
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from "@/constants";
import { usePermissionCheck } from "@/hooks/use-permission-check";
import { orpcTQClient } from "@/oRPC/orpc";

import { CompanyPaymentCreateDialog } from "../CompanyPaymentCreateDialog";
import { CompanyPaymentsTable } from "../CompanyPaymentsTable";

export function CompanyPaymentsTab({ companyId }: { companyId: string }) {
  const [page, setPage] = useState<number>(DEFAULT_PAGE_INDEX);
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const isAllowCreatePayment = usePermissionCheck([
    {
      level: "system",
      resource: "company_payment",
      action: "create",
    },
  ]);

  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.company.payment.list.queryOptions({
      input: {
        page,
        limit: DEFAULT_PAGE_SIZE,
        filter: {
          companyId,
        },
      },
      select: (result) => result.data,
    })
  );

  return (
    <div className="space-y-2">
      <Card>
        <CardHeader>
          <CardTitle>Payments</CardTitle>
          <CardDescription>All payments made to this company</CardDescription>
          {isAllowCreatePayment && (
            <>
              <CardAction>
                <Button size="sm" onClick={() => setOpenDialog(true)}>
                  <Plus />
                  New payment
                </Button>
              </CardAction>
              <CompanyPaymentCreateDialog
                open={openDialog}
                setOpen={setOpenDialog}
                companyId={companyId}
              />
            </>
          )}
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
            {(paymentsData) => (
              <CompanyPaymentsTable
                paymentsData={paymentsData}
                onPageChange={setPage}
              />
            )}
          </QueryStateBoundary>
        </CardContent>
      </Card>
    </div>
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
