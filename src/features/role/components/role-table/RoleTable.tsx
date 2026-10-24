import { DataTable } from "@/components/data-table/data-table";
import { useDataTable } from "@/hooks/use-data-table";
import type { FiltersType } from "@/types/data-table";

import type { ListRoleContractType } from "../../api/role.contract";
import { roleTableColumn } from "./roleTableColumn";

interface RoleTableProps {
  data: ListRoleContractType["output"]["data"];
  filters: FiltersType;
  setFilters: (filters: Omit<FiltersType, "search">) => void;
}

export function RoleTable({ data, filters, setFilters }: RoleTableProps) {
  "use no memo";

  const table = useDataTable({
    data: data,
    columns: roleTableColumn,
    pageCount: 1,
    filters,
    setFilters,
    meta: {
      queryKeys: {
        searchText: filters.search ?? undefined,
      },
    },
  });

  return <DataTable table={table} showPagination={false} />;
}
