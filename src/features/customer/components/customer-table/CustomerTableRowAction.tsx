import { useState } from "react";

import { Link } from "@tanstack/react-router";
import { Edit, Eye, Trash2 } from "lucide-react";

import DataTableRowMenu from "@/components/data-table/data-table-row-menu";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { usePermissionCheck } from "@/hooks/use-permission-check";

import type { ListCustomerContractType } from "../../api/customer.contract";
import { CustomerDeleteDialog } from "../CustomerDeleteDialog";
import { CustomerUpdateDialog } from "../CustomerUpdateDialog";

export function CustomerTableRowAction({
  customerData,
}: {
  customerData: ListCustomerContractType["output"]["data"]["data"][number];
}) {
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const isAllowUpdate = usePermissionCheck([
    { level: "system", resource: "customer", action: "update" },
  ]);
  const isAllowDelete = usePermissionCheck([
    { level: "system", resource: "customer", action: "delete" },
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

      {isAllowUpdate && (
        <CustomerUpdateDialog
          open={openUpdateDialog}
          setOpen={setOpenUpdateDialog}
          customerId={customerData.id}
          customerData={customerData}
        />
      )}
      {isAllowDelete && (
        <CustomerDeleteDialog
          open={openDeleteDialog}
          setOpen={setOpenDeleteDialog}
          customerId={customerData.id}
        />
      )}
    </>
  );
}
