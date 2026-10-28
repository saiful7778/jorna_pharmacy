import { useState } from "react";

import { RotateCcw, Trash2 } from "lucide-react";

import { DeleteDialog } from "@/components/DeleteDialog";
import DataTableRowMenu from "@/components/data-table/data-table-row-menu";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { usePermissionCheck } from "@/hooks/use-permission-check";

import {
  useCompanyRemove,
  useCompanyRestore,
} from "../../api/companyDelete.api.hook";
import type { ListCompanyBinContractType } from "../../api/companyDelete.contract";

export function CompanyBinTableRowAction({
  companyData,
}: {
  companyData: ListCompanyBinContractType["output"]["data"]["data"][number];
}) {
  const [openRemoveDialog, setOpenRemoveDialog] = useState(false);
  const isAllowDelete = usePermissionCheck([
    { level: "system", resource: "company", action: "delete" },
  ]);

  const { mutate: restoreCompany, isPending: isRestoring } =
    useCompanyRestore();
  const { mutate: removeCompany, isPending: isRemoving } = useCompanyRemove({
    onSuccess: () => setOpenRemoveDialog(false),
  });

  return (
    <>
      <DataTableRowMenu>
        {isAllowDelete && (
          <DropdownMenuItem
            disabled={isRestoring}
            onClick={() => restoreCompany({ companyId: companyData.id })}
          >
            <RotateCcw />
            <span>Restore</span>
          </DropdownMenuItem>
        )}
        {isAllowDelete && (
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setOpenRemoveDialog(true)}
          >
            <Trash2 />
            <span>Delete permanently</span>
          </DropdownMenuItem>
        )}
      </DataTableRowMenu>

      {isAllowDelete && (
        <DeleteDialog
          openDialog={openRemoveDialog}
          setOpenDialog={setOpenRemoveDialog}
          isDeleteing={isRemoving}
          mode="permanent"
          onDelete={() => removeCompany({ companyId: companyData.id })}
        />
      )}
    </>
  );
}
