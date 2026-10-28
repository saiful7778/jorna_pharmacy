import { useState } from "react";

import { ReceiptText, Trash2 } from "lucide-react";

import DataTableRowMenu from "@/components/data-table/data-table-row-menu";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { usePermissionCheck } from "@/hooks/use-permission-check";

import { PurchaseDeleteDialog } from "../PurchaseDeleteDialog";
import { PurchaseViewDialog } from "../PurchaseViewDialog";

export function CompanyPurchaseRowAction({
  purchaseId,
}: {
  purchaseId: string;
}) {
  const isAllowDelete = usePermissionCheck([
    { level: "system", resource: "purchase", action: "delete" },
  ]);
  const [openViewDialog, setOpenViewDialog] = useState<boolean>(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);

  return (
    <>
      <DataTableRowMenu>
        <DropdownMenuItem onClick={() => setOpenViewDialog(true)}>
          <ReceiptText />
          <span>View purchase</span>
        </DropdownMenuItem>
        {isAllowDelete && (
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setOpenDeleteDialog(true)}
          >
            <Trash2 />
            <span>Delete</span>
          </DropdownMenuItem>
        )}
      </DataTableRowMenu>

      {isAllowDelete && (
        <PurchaseDeleteDialog
          open={openDeleteDialog}
          setOpen={setOpenDeleteDialog}
          purchaseId={purchaseId}
        />
      )}

      {openViewDialog && (
        <PurchaseViewDialog
          open={openViewDialog}
          setOpen={setOpenViewDialog}
          purchaseId={purchaseId}
        />
      )}
    </>
  );
}
