import { useState } from "react";

import { ReceiptText } from "lucide-react";

import DataTableRowMenu from "@/components/data-table/data-table-row-menu";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { PurchaseViewDialog } from "@/features/purchase/components/PurchaseViewDialog";

export function CompanyPaymentRowAction({
  purchaseId,
}: {
  purchaseId: string;
}) {
  const [openViewDialog, setOpenViewDialog] = useState<boolean>(false);

  return (
    <>
      <DataTableRowMenu>
        <DropdownMenuItem onClick={() => setOpenViewDialog(true)}>
          <ReceiptText />
          <span>View purchase</span>
        </DropdownMenuItem>
      </DataTableRowMenu>

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
