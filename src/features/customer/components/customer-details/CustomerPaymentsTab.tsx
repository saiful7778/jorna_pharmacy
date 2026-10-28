import { useState } from "react";

import { useAtomSet } from "@effect-atom/atom-react";
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

import {
  CustomerPaymentCreateDialog,
  openCustomerPaymentCreateDialog,
} from "../CustomerPaymentCreateDialog";
import { CustomerPaymentsTable } from "../CustomerPaymentsTable";

export function CustomerPaymentsTab({ customerId }: { customerId: string }) {
  const [page, setPage] = useState(DEFAULT_PAGE_INDEX);
  const setOpenCustomerPaymentDialog = useAtomSet(
    openCustomerPaymentCreateDialog
  );

  const isAllowCreatePayment = usePermissionCheck([
    {
      level: "system",
      resource: "customer_payment",
      action: "create",
    },
  ]);

  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.customer.payment.list.queryOptions({
      input: {
        page,
        limit: DEFAULT_PAGE_SIZE,
        filter: {
          customerId,
        },
      },
      select: (result) => result.data,
    })
  );

  return (
    <>
      <div className="space-y-2">
        <Card>
          <CardHeader>
            <CardTitle>Payments</CardTitle>
            <CardDescription>
              All payments received from this customer
            </CardDescription>
            {isAllowCreatePayment && (
              <CardAction>
                <Button
                  size="sm"
                  onClick={() => setOpenCustomerPaymentDialog(true)}
                >
                  <Plus />
                  New payment
                </Button>
              </CardAction>
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
                <CustomerPaymentsTable
                  paymentsData={paymentsData}
                  onPageChange={setPage}
                />
              )}
            </QueryStateBoundary>
          </CardContent>
        </Card>
      </div>

      {isAllowCreatePayment && (
        <CustomerPaymentCreateDialog customerId={customerId} />
      )}
    </>
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
