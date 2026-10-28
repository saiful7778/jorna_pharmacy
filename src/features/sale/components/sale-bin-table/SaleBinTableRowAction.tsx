import { useState } from "react";

import { RotateCcw, Trash2 } from "lucide-react";

import { DeleteDialog } from "@/components/DeleteDialog";
import DataTableRowMenu from "@/components/data-table/data-table-row-menu";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { usePermissionCheck } from "@/hooks/use-permission-check";

import { useRemoveSale, useRestoreSale } from "../../api/sale.api.hook";
import type { ListSaleBinContractType } from "../../api/saleDelete.contract";

export function SaleBinTableRowAction({
  saleData,
}: {
  saleData: ListSaleBinContractType["output"]["data"]["data"][number];
}) {
  const [openRemoveDialog, setOpenRemoveDialog] = useState(false);
  const isAllowDelete = usePermissionCheck([
    { level: "system", resource: "sale", action: "delete" },
  ]);

  const { mutate: restoreSale, isPending: isRestoring } = useRestoreSale();
  const { mutate: removeSale, isPending: isRemoving } = useRemoveSale({
    onSuccess: () => setOpenRemoveDialog(false),
  });

  return (
    <>
      <DataTableRowMenu>
        {isAllowDelete && (
          <DropdownMenuItem
            disabled={isRestoring}
            onClick={() => restoreSale({ saleId: saleData.id })}
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
          onDelete={() => removeSale({ saleId: saleData.id })}
        />
      )}
    </>
  );
}
