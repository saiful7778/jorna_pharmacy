import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import type { FiltersType } from "@/types/data-table";

import type { ListCustomerContractType } from "../../api/customer.contract";
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
