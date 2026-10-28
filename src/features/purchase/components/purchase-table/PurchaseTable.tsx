import { Trash } from "lucide-react";

import { DataTable } from "@/components/data-table/data-table";
import {
  DataTableActionBar,
  DataTableActionBarAction,
  DataTableActionBarSelection,
} from "@/components/data-table/data-table-action-bar";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { usePermissionCheck } from "@/hooks/use-permission-check";
import type { FiltersType } from "@/types/data-table";

import type { ListPurchaseContractType } from "../../api/purchase.contract";
import { useDeleteAllPurchase } from "../../api/purchaseDelete.api.hook";
import { purchaseTableColumn } from "./purchaseTableColumn";

interface PurchaseTableProps {
  data: ListPurchaseContractType["output"]["data"];
  filters: FiltersType;
  setFilters: (filters: Omit<FiltersType, "search">) => void;
}

export function PurchaseTable({
  data,
  filters,
  setFilters,
}: PurchaseTableProps) {
  "use no memo";
  const isAllowDelete = usePermissionCheck([
    { level: "system", resource: "purchase", action: "delete" },
  ]);

  const table = useDataTable({
    data: data.data,
    columns: purchaseTableColumn,
    pageCount: data.meta.pageCount,
    getRowId: (row) => row.id,
    filters,
    setFilters,
    meta: {
      queryKeys: {
        searchText: filters.search ?? undefined,
      },
    },
  });

  const { mutate: deleteAllPurchases, isPending: isDeletingAll } =
    useDeleteAllPurchase({
      onSuccess: () => {
        table.toggleAllRowsSelected(false);
      },
    });

  return (
    <DataTable
      table={table}
      actionBar={
        isAllowDelete && (
          <DataTableActionBar table={table}>
            <DataTableActionBarSelection table={table} />
            <DataTableActionBarAction
              variant="destructive"
              isPending={isDeletingAll}
              onClick={() =>
                deleteAllPurchases({
                  purchaseIds: table
                    .getFilteredSelectedRowModel()
                    .rows.map((row) => row.original.id),
                })
              }
            >
              <Trash />
              <span>Delete All</span>
            </DataTableActionBarAction>
          </DataTableActionBar>
        )
      }
    >
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
