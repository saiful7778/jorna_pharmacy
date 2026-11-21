import { useMemo } from "react";

import { DataTable } from "@/components/data-table/data-table";
import { useDataTable } from "@/hooks/use-data-table";
import type { FiltersType } from "@/types/data-table";

import type { ListCustomerPaymentsContractType } from "../../api/customerPayment.contract";
import { customerPaymentsTableColumn } from "./customerPaymentsTableColumn";

interface CustomerPaymentsTableProps {
  data: ListCustomerPaymentsContractType["output"]["data"];
  filters: FiltersType;
  setFilters: (filters: Omit<FiltersType, "search">) => void;
  showCustomer?: boolean;
}

export function CustomerPaymentsTable({
  data,
  filters,
  setFilters,
  showCustomer = false,
}: CustomerPaymentsTableProps) {
  "use no memo";

  const columns = useMemo(
    () => customerPaymentsTableColumn({ showCustomer }),
    [showCustomer]
  );

  const table = useDataTable({
    data: data.data,
    columns,
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

  return <DataTable table={table} emptyMessage="No payments yet" />;
}
