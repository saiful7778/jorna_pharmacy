import { Trash } from "lucide-react";

import { DataTable } from "@/components/data-table/data-table";
import {
  DataTableActionBar,
  DataTableActionBarAction,
  DataTableActionBarSelection,
} from "@/components/data-table/data-table-action-bar";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import type { FiltersType } from "@/types/data-table";

import type { ListCustomerContractType } from "../../api/customer.contract";
import { useDeleteAllCustomer } from "../../api/customerDelete.api.hook";
import { customerTableColumn } from "./customerTableColumn";

interface CustomerTableProps {
  data: ListCustomerContractType["output"]["data"];
  filters: FiltersType;
  setFilters: (filters: Omit<FiltersType, "search">) => void;
}

export function CustomerTable({
  data,
  filters,
  setFilters,
}: CustomerTableProps) {
  "use no memo";
  const table = useDataTable({
    data: data.data,
    columns: customerTableColumn,
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

  const { mutate: deleteAllCustomers, isPending: isDeletingAll } =
    useDeleteAllCustomer({
      onSuccess: () => {
        table.toggleAllRowsSelected(false);
      },
    });

  return (
    <DataTable
      table={table}
      actionBar={
        <DataTableActionBar table={table}>
          <DataTableActionBarSelection table={table} />
          <DataTableActionBarAction
            variant="destructive"
            isPending={isDeletingAll}
            onClick={() =>
              deleteAllCustomers({
                customerIds: table
                  .getFilteredSelectedRowModel()
                  .rows.map((row) => row.original.id),
              })
            }
          >
            <Trash />
            <span>Delete All</span>
          </DataTableActionBarAction>
        </DataTableActionBar>
      }
    >
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
