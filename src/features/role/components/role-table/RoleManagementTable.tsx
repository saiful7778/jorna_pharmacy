import { useQuery } from "@tanstack/react-query";

import { DataTableEmpty } from "@/components/data-table/data-table-empty";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbarSkeleton } from "@/components/data-table/data-table-toolbar-skeleton";
import { QueryStateBoundary } from "@/components/tanstack-query/query-state-boundary";
import { useQuerySearch } from "@/hooks/use-query-search";
import { orpcTQClient } from "@/oRPC/orpc";

import { RoleTable } from "./RoleTable";

export function RoleManagementTable() {
  "use no memo";
  const { filters, setFilters } = useQuerySearch(
    "/dashboard/_dashboardLayout/roles"
  );

  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.role.listRole.queryOptions()
  );

  return (
    <QueryStateBoundary
      isLoading={isLoading}
      isError={isError}
      error={error}
      data={data?.data}
      isEmpty={(d) => d.length === 0}
      loadingFallback={
        <DataTableSkeleton>
          <DataTableToolbarSkeleton />
        </DataTableSkeleton>
      }
      emptyFallback={<DataTableEmpty />}
    >
      {(roleData) => (
        <RoleTable
          data={roleData}
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
  );
}
