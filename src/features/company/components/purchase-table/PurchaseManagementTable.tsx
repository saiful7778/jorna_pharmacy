import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import { DataTableEmpty } from "@/components/data-table/data-table-empty";
import { DataTableGlobalSearch } from "@/components/data-table/data-table-global-search";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbarSkeleton } from "@/components/data-table/data-table-toolbar-skeleton";
import { QueryStateBoundary } from "@/components/tanstack-query/query-state-boundary";
import { TimeRangeFilter } from "@/components/time-range-filter";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { usePermissionCheck } from "@/hooks/use-permission-check";
import { useSearchFilter } from "@/hooks/use-search-filter";
import { orpcTQClient } from "@/oRPC/orpc";
import { buildDateRangeFilter } from "@/utils/buildDateRangeFilter";

import { PurchaseCreateDialog } from "../PurchaseCreateDialog";
import { PurchaseStats } from "../PurchaseStats";
import { PurchaseTable } from "./PurchaseTable";

export function PurchaseManagementTable({
  searchFields,
}: {
  searchFields: string[];
}) {
  "use no memo";
  const { filters, setFilters, setSearchFilter } = useSearchFilter(
    "/dashboard/_dashboardLayout/companies/purchases/"
  );
  const isAllowCreate = usePermissionCheck([
    { level: "system", resource: "purchase", action: "manage" },
    { level: "system", resource: "purchase", action: "create" },
  ]);

  const { data, isLoading, isError, error, refetch } = useQuery(
    orpcTQClient.company.purchase.list.queryOptions({
      input: {
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        searchFields,
        order: filters.order,
        orderField: filters.orderField,
        unpaidOnly: filters.unpaidOnly,
        filter: {
          createdAt: buildDateRangeFilter(filters.startTime, filters.endTime),
        },
      },
      select: (result) => result.data,
    })
  );

  const handleOpenDialog = (value: boolean) => {
    setFilters((prev) => ({
      ...prev,
      purchaseCreateDialog: value,
    }));
  };

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
      <PurchaseStats startTime={filters.startTime} endTime={filters.endTime} />
      <DataTableGlobalSearch
        searchValue={filters.search}
        setSearchValue={setSearchFilter}
        refresh={refetch}
      >
        <Toggle
          variant="outline"
          pressed={!!filters.unpaidOnly}
          onPressedChange={(pressed) =>
            setFilters({ unpaidOnly: pressed ? true : undefined, page: 1 })
          }
        >
          Unpaid only
        </Toggle>
        {isAllowCreate && (
          <>
            <Button onClick={() => handleOpenDialog(true)}>
              <Plus />
              <span>Add new</span>
            </Button>
            <PurchaseCreateDialog
              defaultOpen={filters.purchaseCreateDialog}
              open={filters.purchaseCreateDialog}
              setOpen={handleOpenDialog}
            />
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
        {(purchasesData) => (
          <PurchaseTable
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
