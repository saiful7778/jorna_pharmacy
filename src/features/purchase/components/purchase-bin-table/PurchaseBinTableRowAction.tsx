import { useState } from "react";

import { RotateCcw, Trash2 } from "lucide-react";

import { DeleteDialog } from "@/components/DeleteDialog";
import DataTableRowMenu from "@/components/data-table/data-table-row-menu";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { usePermissionCheck } from "@/hooks/use-permission-check";

import {
  useRemovePurchase,
  useRestorePurchase,
} from "../../api/purchaseDelete.api.hook";
import type { ListPurchaseBinContractType } from "../../api/purchaseDelete.contract";

export function PurchaseBinTableRowAction({
  purchaseData,
}: {
  purchaseData: ListPurchaseBinContractType["output"]["data"]["data"][number];
}) {
  const [openRemoveDialog, setOpenRemoveDialog] = useState(false);
  const isAllowDelete = usePermissionCheck([
    { level: "system", resource: "purchase", action: "delete" },
  ]);

  const { mutate: restorePurchase, isPending: isRestoring } =
    useRestorePurchase();
  const { mutate: removePurchase, isPending: isRemoving } = useRemovePurchase({
    onSuccess: () => setOpenRemoveDialog(false),
  });

  return (
    <>
      <DataTableRowMenu>
        {isAllowDelete && (
          <DropdownMenuItem
            disabled={isRestoring}
            onClick={() => restorePurchase({ purchaseId: purchaseData.id })}
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
          onDelete={() => removePurchase({ purchaseId: purchaseData.id })}
        />
      )}
    </>
  );
}
