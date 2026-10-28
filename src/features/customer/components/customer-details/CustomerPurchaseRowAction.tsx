import { useState } from "react";

import { ReceiptText, Trash2, Wallet } from "lucide-react";

import DataTableRowMenu from "@/components/data-table/data-table-row-menu";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import type { ListSaleContractType } from "@/features/sale/api/sale.contract";
import { SaleDeleteDialog } from "@/features/sale/components/SaleDeleteDialog";
import { SaleViewDialog } from "@/features/sale/components/SaleViewDialog";
import { usePermissionCheck } from "@/hooks/use-permission-check";

import { CustomerPaymentCreateDialog } from "../CustomerPaymentCreateDialog";

export function CustomerPurchaseRowAction({
  saleData,
}: {
  saleData: ListSaleContractType["output"]["data"]["data"][number];
}) {
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const isAllowDelete = usePermissionCheck([
    { level: "system", resource: "sale", action: "delete" },
  ]);
  const isAllowCreatePayment = usePermissionCheck([
    { level: "system", resource: "customer_payment", action: "create" },
  ]);
  const customerId = saleData.customer?.id;

  return (
    <>
      <DataTableRowMenu>
        <DropdownMenuItem onClick={() => setOpenViewDialog(true)}>
          <ReceiptText />
          <span>View sale</span>
        </DropdownMenuItem>
        {isAllowCreatePayment && customerId && saleData.dueAmount > 0 && (
          <DropdownMenuItem onClick={() => setOpenPaymentDialog(true)}>
            <Wallet />
            <span>New payment</span>
          </DropdownMenuItem>
        )}
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

      {openViewDialog && (
        <SaleViewDialog
          open={openViewDialog}
          setOpen={setOpenViewDialog}
          saleId={saleData.id}
        />
      )}

      {openPaymentDialog && customerId && (
        <CustomerPaymentCreateDialog
          open={openPaymentDialog}
          setOpen={setOpenPaymentDialog}
          customerId={customerId}
          saleId={saleData.id}
        />
      )}

      {isAllowDelete && (
        <SaleDeleteDialog
          open={openDeleteDialog}
          setOpen={setOpenDeleteDialog}
          saleId={saleData.id}
        />
      )}
    </>
  );
}
