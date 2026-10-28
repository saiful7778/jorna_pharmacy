import { useState } from "react";

import { ReceiptText } from "lucide-react";

import DataTableRowMenu from "@/components/data-table/data-table-row-menu";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { SaleViewDialog } from "@/features/sale/components/SaleViewDialog";

export function CustomerPaymentRowAction({ saleId }: { saleId: string }) {
  const [openViewDialog, setOpenViewDialog] = useState(false);

  return (
    <>
      <DataTableRowMenu>
        <DropdownMenuItem onClick={() => setOpenViewDialog(true)}>
          <ReceiptText />
          <span>View sale</span>
        </DropdownMenuItem>
      </DataTableRowMenu>

      {openViewDialog && (
        <SaleViewDialog
          open={openViewDialog}
          setOpen={setOpenViewDialog}
          saleId={saleId}
        />
      )}
    </>
  );
}
