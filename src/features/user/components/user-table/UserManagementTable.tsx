import { useQuery } from "@tanstack/react-query";

import { DataTableEmpty } from "@/components/data-table/data-table-empty";
import { DataTableGlobalSearch } from "@/components/data-table/data-table-global-search";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbarSkeleton } from "@/components/data-table/data-table-toolbar-skeleton";
import { QueryStateBoundary } from "@/components/tanstack-query/query-state-boundary";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { useQuerySearch } from "@/hooks/use-query-search";
import { orpcTQClient } from "@/oRPC/orpc";

import { UsersTable } from "./UsersTable";

export function UserManagementTable({
  searchFields,
}: {
  searchFields: string[];
}) {
  "use no memo";
  const { filters, setFilters, setSearchFilter } = useQuerySearch(
    "/dashboard/_dashboardLayout/users/"
  );

  const { data, isLoading, isError, error, refetch } = useQuery(
    orpcTQClient.user.list.queryOptions({
      input: {
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        searchFields,
        order: filters.order,
        orderField: filters.orderField,
      },
    })
  );

  const globalSearch = useDebouncedCallback(
    (searchValue: string | undefined) => setSearchFilter(searchValue),
    500
  );

  return (
    <div className="space-y-3">
      <DataTableGlobalSearch
        searchValue={filters.search}
        setSearchValue={globalSearch}
        refresh={refetch}
      />
      <QueryStateBoundary
        isLoading={isLoading}
        isError={isError}
        error={error}
        data={data?.data}
        isEmpty={() => false}
        loadingFallback={
          <DataTableSkeleton>
            <DataTableToolbarSkeleton />
          </DataTableSkeleton>
        }
        emptyFallback={<DataTableEmpty />}
      >
        {(usersData) => (
          <UsersTable
            data={usersData}
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
                order: updatedFilters.order,
                orderField: updatedFilters.orderField,
              });
            }}
          />
        )}
      </QueryStateBoundary>
    </div>
  );
}
