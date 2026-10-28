import { useState } from "react";

import { Link } from "@tanstack/react-router";
import { BanknoteCheck, Eye, ReceiptText, Trash2 } from "lucide-react";

import DataTableRowMenu from "@/components/data-table/data-table-row-menu";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { CompanyPaymentCreateDialog } from "@/features/company/components/CompanyPaymentCreateDialog";
import { usePermissionCheck } from "@/hooks/use-permission-check";

import type { ListPurchaseContractType } from "../../api/purchase.contract";
import { PurchaseDeleteDialog } from "../PurchaseDeleteDialog";
import { PurchaseViewDialog } from "../PurchaseViewDialog";

export function PurchaseTableRowAction({
  purchaseData,
}: {
  purchaseData: ListPurchaseContractType["output"]["data"]["data"][number];
}) {
  const isAllowCreatePayment = usePermissionCheck([
    { level: "system", resource: "company_payment", action: "create" },
  ]);
  const isAllowDelete = usePermissionCheck([
    { level: "system", resource: "purchase", action: "delete" },
  ]);
  const [openPaymentDialog, setOpenPaymentDialog] = useState<boolean>(false);
  const [openViewDialog, setOpenViewDialog] = useState<boolean>(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);

  const isDue = purchaseData.totalAmount > purchaseData.paidAmount;

  return (
    <>
      <DataTableRowMenu>
        <DropdownMenuItem onClick={() => setOpenViewDialog(true)}>
          <ReceiptText />
          <span>View purchase</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          nativeButton={false}
          render={
            <Link
              to="/dashboard/companies/$companyId"
              params={{ companyId: purchaseData.company.id }}
              search={{ tab: "purchase" }}
            />
          }
        >
          <Eye />
          <span>View company</span>
        </DropdownMenuItem>
        {isAllowCreatePayment && isDue && (
          <DropdownMenuItem onClick={() => setOpenPaymentDialog(true)}>
            <BanknoteCheck />
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

      {isAllowDelete && (
        <PurchaseDeleteDialog
          open={openDeleteDialog}
          setOpen={setOpenDeleteDialog}
          purchaseId={purchaseData.id}
        />
      )}

      {openViewDialog && (
        <PurchaseViewDialog
          open={openViewDialog}
          setOpen={setOpenViewDialog}
          purchaseId={purchaseData.id}
        />
      )}

      {openPaymentDialog && (
        <CompanyPaymentCreateDialog
          open={openPaymentDialog}
          setOpen={setOpenPaymentDialog}
          companyId={purchaseData.company.id}
          purchaseId={purchaseData.id}
        />
      )}
    </>
  );
}
