import { useState } from "react";

import { RotateCcw, Trash2 } from "lucide-react";

import { DeleteDialog } from "@/components/DeleteDialog";
import DataTableRowMenu from "@/components/data-table/data-table-row-menu";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { usePermissionCheck } from "@/hooks/use-permission-check";

import {
  useRemoveCompanyPurchase,
  useRestoreCompanyPurchase,
} from "../../api/companyPurchaseDelete.api.hook";
import type { ListCompanyPurchaseBinContractType } from "../../api/companyPurchaseDelete.contract";

export function PurchaseBinTableRowAction({
  purchaseData,
}: {
  purchaseData: ListCompanyPurchaseBinContractType["output"]["data"]["data"][number];
}) {
  const [openRemoveDialog, setOpenRemoveDialog] = useState(false);
  const isAllowDelete = usePermissionCheck([
    { level: "system", resource: "purchase", action: "delete" },
  ]);

  const { mutate: restorePurchase, isPending: isRestoring } =
    useRestoreCompanyPurchase();
  const { mutate: removePurchase, isPending: isRemoving } =
    useRemoveCompanyPurchase({
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
