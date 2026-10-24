import { Link } from "@tanstack/react-router";
import { Copy, Eye } from "lucide-react";
import toast from "react-hot-toast";

import DataTableRowMenu from "@/components/data-table/data-table-row-menu";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

import type { ListSaleContractType } from "../../api/sale.contract";

type SaleTableRowDataType =
  ListSaleContractType["output"]["data"]["data"][number];

export function SaleTableRowAction({
  saleData,
}: {
  saleData: SaleTableRowDataType;
}) {
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
    <DataTableRowMenu>
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
    </DataTableRowMenu>
  );
}
