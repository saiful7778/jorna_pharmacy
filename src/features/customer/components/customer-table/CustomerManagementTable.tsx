import { useAtomSet } from "@effect-atom/atom-react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import { DataTableEmpty } from "@/components/data-table/data-table-empty";
import { DataTableGlobalSearch } from "@/components/data-table/data-table-global-search";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbarSkeleton } from "@/components/data-table/data-table-toolbar-skeleton";
import { QueryStateBoundary } from "@/components/tanstack-query/query-state-boundary";
import { Button } from "@/components/ui/button";
import { usePermissionCheck } from "@/hooks/use-permission-check";
import { useSearchFilter } from "@/hooks/use-search-filter";
import { orpcTQClient } from "@/oRPC/orpc";

import {
  CustomerCreateDialog,
  openCustomerCreateDialog,
} from "../CustomerCreateDialog";
import { CustomerTable } from "./CustomerTable";

export function CustomerManagementTable({
  searchFields,
}: {
  searchFields: string[];
}) {
  const setOpenCustomerCreateDialog = useAtomSet(openCustomerCreateDialog);
  const { filters, setFilters, setSearchFilter } = useSearchFilter(
    "/dashboard/_dashboardLayout/customers/"
  );

  const { data, isLoading, isError, error, refetch } = useQuery(
    orpcTQClient.customer.list.queryOptions({
      input: {
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        searchFields,
        order: filters.order,
        orderField: filters.orderField,
      },
      select: (result) => result.data,
    })
  );

  const isAllowCreate = usePermissionCheck([
    {
      level: "system",
      resource: "customer",
      action: "create",
    },
  ]);

  return (
    <div className="space-y-3">
      <DataTableGlobalSearch
        searchValue={filters.search}
        setSearchValue={setSearchFilter}
        refresh={refetch}
      >
        {isAllowCreate && (
          <>
            <Button onClick={() => setOpenCustomerCreateDialog(true)}>
              <Plus />
              <span>Create customer</span>
            </Button>
            <CustomerCreateDialog />
          </>
        )}
      </DataTableGlobalSearch>
      <QueryStateBoundary
        isLoading={isLoading}
        isError={isError}
        error={error}
        data={data}
        isEmpty={() => false}
        loadingFallback={
          <DataTableSkeleton>
            <DataTableToolbarSkeleton />
          </DataTableSkeleton>
        }
        emptyFallback={<DataTableEmpty />}
      >
        {(customersData) => (
          <CustomerTable
            data={customersData}
            filters={{
              page: filters.page,
              limit: filters.limit,
              search: filters.search,
              order: filters.order,
              orderField: filters.orderField,
            }}
            setFilters={(updatedFilters) => {
              setFilters({
                page: updatedFilters.page,
                limit: updatedFilters.limit,
                order: updatedFilters.order ?? undefined,
                orderField: updatedFilters.orderField ?? undefined,
              });
            }}
          />
        )}
      </QueryStateBoundary>
    </div>
  );
}
