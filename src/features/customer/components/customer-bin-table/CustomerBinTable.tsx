import { useState } from "react";

import { RotateCcw, Trash2 } from "lucide-react";

import { DeleteDialog } from "@/components/DeleteDialog";
import { DataTable } from "@/components/data-table/data-table";
import {
  DataTableActionBar,
  DataTableActionBarAction,
  DataTableActionBarSelection,
} from "@/components/data-table/data-table-action-bar";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import type { FiltersType } from "@/types/data-table";

import {
  useRemoveAllCustomer,
  useRestoreAllCustomer,
} from "../../api/customerDelete.api.hook";
import type { ListCustomerBinContractType } from "../../api/customerDelete.contract";
import { customerBinTableColumn } from "./customerBinTableColumn";

interface CustomerBinTableProps {
  data: ListCustomerBinContractType["output"]["data"];
  filters: FiltersType;
  setFilters: (filters: Omit<FiltersType, "search">) => void;
}

export function CustomerBinTable({
  data,
  filters,
  setFilters,
}: CustomerBinTableProps) {
  "use no memo";
  const [openRemoveAllDialog, setOpenRemoveAllDialog] = useState(false);

  const table = useDataTable({
    data: data.data,
    columns: customerBinTableColumn,
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

  const selectedCustomerIds = () =>
    table.getFilteredSelectedRowModel().rows.map((row) => row.original.id);

  const { mutate: restoreAllCustomers, isPending: isRestoringAll } =
    useRestoreAllCustomer({
      onSuccess: () => {
        table.toggleAllRowsSelected(false);
      },
    });

  const { mutate: removeAllCustomers, isPending: isRemovingAll } =
    useRemoveAllCustomer({
      onSuccess: () => {
        table.toggleAllRowsSelected(false);
        setOpenRemoveAllDialog(false);
      },
    });

  return (
    <>
      <DataTable
        table={table}
        actionBar={
          <DataTableActionBar table={table}>
            <DataTableActionBarSelection table={table} />
            <DataTableActionBarAction
              isPending={isRestoringAll}
              onClick={() =>
                restoreAllCustomers({ customerIds: selectedCustomerIds() })
              }
            >
              <RotateCcw />
              <span>Restore All</span>
            </DataTableActionBarAction>
            <DataTableActionBarAction
              variant="destructive"
              isPending={isRemovingAll}
              onClick={() => setOpenRemoveAllDialog(true)}
            >
              <Trash2 />
              <span>Delete All</span>
            </DataTableActionBarAction>
          </DataTableActionBar>
        }
      >
        <DataTableToolbar table={table} />
      </DataTable>

      <DeleteDialog
        openDialog={openRemoveAllDialog}
        setOpenDialog={setOpenRemoveAllDialog}
        isDeleteing={isRemovingAll}
        mode="permanent"
        onDelete={() =>
          removeAllCustomers({ customerIds: selectedCustomerIds() })
        }
      />
    </>
  );
}
