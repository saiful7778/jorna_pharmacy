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
  useCompanyRemoveAll,
  useCompanyRestoreAll,
} from "../../api/companyDelete.api.hook";
import type { ListCompanyBinContractType } from "../../api/companyDelete.contract";
import { companyBinTableColumn } from "./companyBinTableColumn";

interface CompanyBinTableProps {
  data: ListCompanyBinContractType["output"]["data"];
  filters: FiltersType;
  setFilters: (filters: Omit<FiltersType, "search">) => void;
}

export function CompanyBinTable({
  data,
  filters,
  setFilters,
}: CompanyBinTableProps) {
  "use no memo";
  const [openRemoveAllDialog, setOpenRemoveAllDialog] = useState(false);

  const table = useDataTable({
    data: data.data,
    columns: companyBinTableColumn,
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

  const selectedCompanyIds = () =>
    table.getFilteredSelectedRowModel().rows.map((row) => row.original.id);

  const { mutate: restoreAllCompanies, isPending: isRestoringAll } =
    useCompanyRestoreAll({
      onSuccess: () => {
        table.toggleAllRowsSelected(false);
      },
    });

  const { mutate: removeAllCompanies, isPending: isRemovingAll } =
    useCompanyRemoveAll({
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
                restoreAllCompanies({ companyIds: selectedCompanyIds() })
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
          removeAllCompanies({ companyIds: selectedCompanyIds() })
        }
      />
    </>
  );
}
