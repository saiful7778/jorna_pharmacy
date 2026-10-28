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
  useRemoveAllCompanyPurchase,
  useRestoreAllCompanyPurchase,
} from "../../api/companyPurchaseDelete.api.hook";
import type { ListCompanyPurchaseBinContractType } from "../../api/companyPurchaseDelete.contract";
import { purchaseBinTableColumn } from "./purchaseBinTableColumn";

interface PurchaseBinTableProps {
  data: ListCompanyPurchaseBinContractType["output"]["data"];
  filters: FiltersType;
  setFilters: (filters: Omit<FiltersType, "search">) => void;
}

export function PurchaseBinTable({
  data,
  filters,
  setFilters,
}: PurchaseBinTableProps) {
  "use no memo";
  const [openRemoveAllDialog, setOpenRemoveAllDialog] = useState(false);

  const table = useDataTable({
    data: data.data,
    columns: purchaseBinTableColumn,
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

  const selectedPurchaseIds = () =>
    table.getFilteredSelectedRowModel().rows.map((row) => row.original.id);

  const { mutate: restoreAllPurchases, isPending: isRestoringAll } =
    useRestoreAllCompanyPurchase({
      onSuccess: () => {
        table.toggleAllRowsSelected(false);
      },
    });

  const { mutate: removeAllPurchases, isPending: isRemovingAll } =
    useRemoveAllCompanyPurchase({
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
                restoreAllPurchases({ purchaseIds: selectedPurchaseIds() })
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
          removeAllPurchases({ purchaseIds: selectedPurchaseIds() })
        }
      />
    </>
  );
}
