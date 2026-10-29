import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import type { FiltersType } from "@/types/data-table";

import type { ListSaleClosingContractType } from "../../api/saleClosing.contract";
import { saleClosingTableColumn } from "./saleClosingTableColumn";

interface SaleClosingTableProps {
  data: ListSaleClosingContractType["output"]["data"];
  filters: FiltersType;
  setFilters: (filters: Omit<FiltersType, "search">) => void;
}

export function SaleClosingTable({
  data,
  filters,
  setFilters,
}: SaleClosingTableProps) {
  "use no memo";

  const table = useDataTable({
    data: data.data,
    columns: saleClosingTableColumn,
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

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
