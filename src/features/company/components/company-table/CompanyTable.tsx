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

import type { ListCompanyContractType } from "../../api/company.contract";
import { useCompanyDeleteAll } from "../../api/companyDelete.api.hook";
import { companyTableColumn } from "./companyTableColumn";

interface CompanyTableProps {
  data: ListCompanyContractType["output"]["data"];
  filters: FiltersType;
  setFilters: (filters: Omit<FiltersType, "search">) => void;
}

export function CompanyTable({ data, filters, setFilters }: CompanyTableProps) {
  "use no memo";
  const table = useDataTable({
    data: data.data,
    columns: companyTableColumn,
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

  const { mutate: deleteAllCompanies, isPending: isDeletingAll } =
    useCompanyDeleteAll({
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
              deleteAllCompanies({
                companyIds: table
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
