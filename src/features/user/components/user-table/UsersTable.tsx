import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import type { FiltersType } from "@/types/data-table";

import type { ListUserContractType } from "../../api/user.contract";
import { userTableColumn } from "./userTableColumn";

interface UsersTableProps {
  data: ListUserContractType["output"]["data"];
  filters: FiltersType;
  setFilters: (filters: Omit<FiltersType, "search">) => void;
}

export function UsersTable({ data, filters, setFilters }: UsersTableProps) {
  "use no memo";
  const table = useDataTable({
    data: data.data,
    columns: userTableColumn,
    pageCount: data.meta.pageCount,
    filters,
    setFilters,
    meta: {
      queryKeys: {
        searchText: filters.search ?? undefined,
      },
    },
  });

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
