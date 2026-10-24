import { useState } from "react";

import { Link } from "@tanstack/react-router";
import { Edit, Eye } from "lucide-react";

import DataTableRowMenu from "@/components/data-table/data-table-row-menu";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { usePermissionCheck } from "@/hooks/use-permission-check";

import type { ListCustomerContractType } from "../../api/customer.contract";
import { CustomerUpdateDialog } from "../CustomerUpdateDialog";

export function CustomerTableRowAction({
  customerData,
}: {
  customerData: ListCustomerContractType["output"]["data"]["data"][number];
}) {
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const isAllowUpdate = usePermissionCheck([
    { level: "system", resource: "customer", action: "update" },
  ]);

  return (
    <>
      <DataTableRowMenu>
        <DropdownMenuItem
          nativeButton={false}
          render={
            <Link
              to="/dashboard/customers/$customerId"
              params={{ customerId: customerData.id }}
              search={{ tab: "details" }}
            />
          }
        >
          <Eye />
          <span>Details</span>
        </DropdownMenuItem>
        {isAllowUpdate && (
          <DropdownMenuItem onClick={() => setOpenUpdateDialog(true)}>
            <Edit />
            <span>Update</span>
          </DropdownMenuItem>
        )}
      </DataTableRowMenu>

      {isAllowUpdate && (
        <CustomerUpdateDialog
          open={openUpdateDialog}
          setOpen={setOpenUpdateDialog}
          customerId={customerData.id}
          customerData={customerData}
        />
      )}
    </>
  );
}
