import { useState } from "react";

import { Link } from "@tanstack/react-router";
import { Copy, Eye, ReceiptText, Trash2, Wallet } from "lucide-react";
import toast from "react-hot-toast";

import DataTableRowMenu from "@/components/data-table/data-table-row-menu";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { CustomerPaymentCreateDialog } from "@/features/customer/components/CustomerPaymentCreateDialog";
import { usePermissionCheck } from "@/hooks/use-permission-check";

import type { ListSaleContractType } from "../../api/sale.contract";
import { SaleDeleteDialog } from "../SaleDeleteDialog";
import { SaleViewDialog } from "../SaleViewDialog";

type SaleTableRowDataType =
  ListSaleContractType["output"]["data"]["data"][number];

export function SaleTableRowAction({
  saleData,
}: {
  saleData: SaleTableRowDataType;
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
  const customer = saleData.customer;

  const handleCopyInvoiceNo = async () => {
    try {
      await navigator.clipboard.writeText(saleData.invoiceNo);
      toast.success(`Invoice ${saleData.invoiceNo} copied`);
    } catch {
      toast.error("Could not copy invoice number");
    }
  };

  return (
    <>
      <DataTableRowMenu>
        <DropdownMenuItem onClick={() => setOpenViewDialog(true)}>
          <ReceiptText />
          <span>View sale</span>
        </DropdownMenuItem>
        {isAllowCreatePayment && customer && saleData.dueAmount > 0 && (
          <DropdownMenuItem onClick={() => setOpenPaymentDialog(true)}>
            <Wallet />
            <span>New payment</span>
          </DropdownMenuItem>
        )}
        {customer && (
          <DropdownMenuItem
            nativeButton={false}
            render={
              <Link
                to="/dashboard/customers/$customerId"
                params={{ customerId: customer.id }}
                search={{ tab: "details" }}
              />
            }
          >
            <Eye />
            <span>Customer details</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => {
            void handleCopyInvoiceNo();
          }}
        >
          <Copy />
          <span>Copy invoice no</span>
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

      {openViewDialog && (
        <SaleViewDialog
          open={openViewDialog}
          setOpen={setOpenViewDialog}
          saleId={saleData.id}
        />
      )}

      {openPaymentDialog && customer && (
        <CustomerPaymentCreateDialog
          open={openPaymentDialog}
          setOpen={setOpenPaymentDialog}
          customerId={customer.id}
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
