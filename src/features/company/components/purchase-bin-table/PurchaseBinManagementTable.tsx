import { useQuery } from "@tanstack/react-query";

import { DataTableEmpty } from "@/components/data-table/data-table-empty";
import { DataTableGlobalSearch } from "@/components/data-table/data-table-global-search";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbarSkeleton } from "@/components/data-table/data-table-toolbar-skeleton";
import { QueryStateBoundary } from "@/components/tanstack-query/query-state-boundary";
import { useSearchFilter } from "@/hooks/use-search-filter";
import { orpcTQClient } from "@/oRPC/orpc";

import { PurchaseBinTable } from "./PurchaseBinTable";

export function PurchaseBinManagementTable({
  searchFields,
}: {
  searchFields: string[];
}) {
  const { filters, setFilters, setSearchFilter } = useSearchFilter(
    "/dashboard/_dashboardLayout/companies/purchases/"
  );

  const { data, isLoading, isError, error, refetch } = useQuery(
    orpcTQClient.company.purchase.listBin.queryOptions({
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

  return (
    <div className="space-y-3">
      <DataTableGlobalSearch
        searchValue={filters.search}
        setSearchValue={setSearchFilter}
        refresh={refetch}
      />
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
        {(purchasesData) => (
          <PurchaseBinTable
            data={purchasesData}
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
