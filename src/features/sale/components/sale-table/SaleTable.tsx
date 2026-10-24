import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import type { FiltersType } from "@/types/data-table";

import type { ListSaleContractType } from "../../api/sale.contract";
import { saleTableColumn } from "./saleTableColumn";

interface SaleTableProps {
  data: ListSaleContractType["output"]["data"];
  filters: FiltersType;
  setFilters: (filters: Omit<FiltersType, "search">) => void;
}

export function SaleTable({ data, filters, setFilters }: SaleTableProps) {
  "use no memo";
  const table = useDataTable({
    data: data.data,
    columns: saleTableColumn,
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
