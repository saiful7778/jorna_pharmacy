import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import { DataTableEmpty } from "@/components/data-table/data-table-empty";
import { DataTableGlobalSearch } from "@/components/data-table/data-table-global-search";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbarSkeleton } from "@/components/data-table/data-table-toolbar-skeleton";
import { QueryStateBoundary } from "@/components/tanstack-query/query-state-boundary";
import { TimeRangeFilter } from "@/components/time-range-filter";
import { Button } from "@/components/ui/button";
import { usePermissionCheck } from "@/hooks/use-permission-check";
import { useSearchFilter } from "@/hooks/use-search-filter";
import { orpcTQClient } from "@/oRPC/orpc";
import { buildDateRangeFilter } from "@/utils/buildDateRangeFilter";

import { SaleCreateDialog } from "../SaleCreateDialog";
import { SaleStats } from "../SaleStats";
import { SaleTable } from "./SaleTable";

export function SaleManagementTable({
  searchFields,
}: {
  searchFields: string[];
}) {
  const isAllowSaleCreate = usePermissionCheck([
    { level: "system", resource: "sale", action: "manage" },
    { level: "system", resource: "sale", action: "create" },
  ]);
  const { filters, setFilters, setSearchFilter } = useSearchFilter(
    "/dashboard/_dashboardLayout/sales/"
  );

  const { data, isLoading, isError, error, refetch } = useQuery(
    orpcTQClient.sale.list.queryOptions({
      input: {
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        searchFields,
        order: filters.order,
        orderField: filters.orderField,
        filter: {
          createdAt: buildDateRangeFilter(filters.startTime, filters.endTime),
        },
      },
      select: (result) => result.data,
    })
  );

  return (
    <div className="space-y-3">
      <TimeRangeFilter
        rangeSearch={{
          range: filters.range,
          startTime: filters.startTime,
          endTime: filters.endTime,
        }}
        setRangeSearch={(updatedRange) =>
          setFilters({
            range: updatedRange.range,
            startTime: updatedRange.startTime,
            endTime: updatedRange.endTime,
          })
        }
      />
      <SaleStats startTime={filters.startTime} endTime={filters.endTime} />
      <DataTableGlobalSearch
        searchValue={filters.search}
        setSearchValue={setSearchFilter}
        refresh={refetch}
      >
        {isAllowSaleCreate && (
          <>
            <Button
              onClick={() =>
                setFilters((prev) => ({ ...prev, saleCreateDialog: true }))
              }
            >
              <Plus />
              <span>New Sale</span>
            </Button>
            <SaleCreateDialog />
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
        {(salesData) => (
          <SaleTable
            data={salesData}
            filters={{
              page: filters.page,
              limit: filters.limit,
              search: filters.search,
              order: filters.order,
              orderField: filters.orderField,
            }}
            setFilters={(updatedFilters) =>
              setFilters({
                page: updatedFilters.page,
                limit: updatedFilters.limit,
                order: updatedFilters.order ?? undefined,
                orderField: updatedFilters.orderField ?? undefined,
              })
            }
          />
        )}
      </QueryStateBoundary>
    </div>
  );
}
