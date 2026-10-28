import { useState } from "react";

import { RotateCcw, Trash2 } from "lucide-react";

import { DeleteDialog } from "@/components/DeleteDialog";
import DataTableRowMenu from "@/components/data-table/data-table-row-menu";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { usePermissionCheck } from "@/hooks/use-permission-check";

import {
  useRemoveCustomer,
  useRestoreCustomer,
} from "../../api/customerDelete.api.hook";
import type { ListCustomerBinContractType } from "../../api/customerDelete.contract";

export function CustomerBinTableRowAction({
  customerData,
}: {
  customerData: ListCustomerBinContractType["output"]["data"]["data"][number];
}) {
  const [openRemoveDialog, setOpenRemoveDialog] = useState(false);
  const isAllowDelete = usePermissionCheck([
    { level: "system", resource: "customer", action: "delete" },
  ]);

  const { mutate: restoreCustomer, isPending: isRestoring } =
    useRestoreCustomer();
  const { mutate: removeCustomer, isPending: isRemoving } = useRemoveCustomer({
    onSuccess: () => setOpenRemoveDialog(false),
  });

  return (
    <>
      <DataTableRowMenu>
        {isAllowDelete && (
          <DropdownMenuItem
            disabled={isRestoring}
            onClick={() => restoreCustomer({ customerId: customerData.id })}
          >
            <RotateCcw />
            <span>Restore</span>
          </DropdownMenuItem>
        )}
        {isAllowDelete && (
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setOpenRemoveDialog(true)}
          >
            <Trash2 />
            <span>Delete permanently</span>
          </DropdownMenuItem>
        )}
      </DataTableRowMenu>

      {isAllowDelete && (
        <DeleteDialog
          openDialog={openRemoveDialog}
          setOpenDialog={setOpenRemoveDialog}
          isDeleteing={isRemoving}
          mode="permanent"
          onDelete={() => removeCustomer({ customerId: customerData.id })}
        />
      )}
    </>
  );
}
