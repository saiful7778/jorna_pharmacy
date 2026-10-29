import { useQuery } from "@tanstack/react-query";

import { DataTableEmpty } from "@/components/data-table/data-table-empty";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbarSkeleton } from "@/components/data-table/data-table-toolbar-skeleton";
import { QueryStateBoundary } from "@/components/tanstack-query/query-state-boundary";
import { TimeRangeFilter } from "@/components/time-range-filter";
import { useSearchFilter } from "@/hooks/use-search-filter";
import { orpcTQClient } from "@/oRPC/orpc";
import { buildDateRangeFilter } from "@/utils/buildDateRangeFilter";

import { SaleClosingStats } from "../SaleClosingStats";
import { SaleClosingTable } from "./SaleClosingTable";

export function SaleClosingManagementTable() {
  "use no memo";
  const { filters, setFilters } = useSearchFilter(
    "/dashboard/_dashboardLayout/sale-closings"
  );

  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.saleClosing.list.queryOptions({
      input: {
        page: filters.page,
        limit: filters.limit,
        order: filters.order,
        orderField: filters.orderField,
        filter: {
          periodEnd: buildDateRangeFilter(filters.startTime, filters.endTime),
        },
      },
      select: (result) => result.data,
    })
  );

  return (
    <div className="space-y-3">
      <TimeRangeFilter
        rangeSearch={filters}
        setRangeSearch={({ range, startTime, endTime }) =>
          setFilters({
            range,
            startTime,
            endTime,
            page: 1,
          })
        }
      />
      <SaleClosingStats
        startTime={filters.startTime}
        endTime={filters.endTime}
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
        {(saleClosingsData) => (
          <SaleClosingTable
            data={saleClosingsData}
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
