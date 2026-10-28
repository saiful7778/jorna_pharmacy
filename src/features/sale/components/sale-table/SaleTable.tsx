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

import { useDeleteAllSale } from "../../api/sale.api.hook";
import type { ListSaleContractType } from "../../api/sale.contract";
import { saleTableColumn } from "./saleTableColumn";

interface SaleTableProps {
  data: ListSaleContractType["output"]["data"];
  filters: FiltersType;
  setFilters: (filters: Omit<FiltersType, "search">) => void;
}

export function SaleTable({ data, filters, setFilters }: SaleTableProps) {
  "use no memo";
  const isAllowDelete = usePermissionCheck([
    { level: "system", resource: "sale", action: "delete" },
  ]);

  const table = useDataTable({
    data: data.data,
    columns: saleTableColumn,
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

  const { mutate: deleteAllSales, isPending: isDeletingAll } = useDeleteAllSale(
    {
      onSuccess: () => {
        table.toggleAllRowsSelected(false);
      },
    }
  );

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
                deleteAllSales({
                  saleIds: table
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
