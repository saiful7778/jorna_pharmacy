import { useState } from "react";

import { Eye } from "lucide-react";

import DataTableRowMenu from "@/components/data-table/data-table-row-menu";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

import { SaleClosingViewDialog } from "../SaleClosingViewDialog";

export function SaleClosingTableRowAction({
  saleClosingId,
}: {
  saleClosingId: string;
}) {
  const [openViewDialog, setOpenViewDialog] = useState<boolean>(false);

  return (
    <>
      <DataTableRowMenu>
        <DropdownMenuItem onClick={() => setOpenViewDialog(true)}>
          <Eye />
          <span>View closing</span>
        </DropdownMenuItem>
      </DataTableRowMenu>

      {openViewDialog && (
        <SaleClosingViewDialog
          open={openViewDialog}
          setOpen={setOpenViewDialog}
          saleClosingId={saleClosingId}
        />
      )}
    </>
  );
}
