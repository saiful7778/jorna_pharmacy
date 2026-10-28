import { useState } from "react";

import { Link } from "@tanstack/react-router";
import { Edit, Eye, Trash2 } from "lucide-react";

import DataTableRowMenu from "@/components/data-table/data-table-row-menu";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { usePermissionCheck } from "@/hooks/use-permission-check";

import type { ListCompanyContractType } from "../../api/company.contract";
import { CompanyDeleteDialog } from "../CompanyDeleteDialog";
import { CompanyUpdateDialog } from "../CompanyUpdateDialog";

export function CompanyTableRowAction({
  companyData,
}: {
  companyData: ListCompanyContractType["output"]["data"]["data"][number];
}) {
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const isAllowUpdate = usePermissionCheck([
    { level: "system", resource: "company", action: "update" },
  ]);
  const isAllowDelete = usePermissionCheck([
    { level: "system", resource: "company", action: "delete" },
  ]);

  return (
    <>
      <DataTableRowMenu>
        <DropdownMenuItem
          nativeButton={false}
          render={
            <Link
              to="/dashboard/companies/$companyId"
              params={{ companyId: companyData.id }}
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
        <CompanyUpdateDialog
          open={openUpdateDialog}
          setOpen={setOpenUpdateDialog}
          companyId={companyData.id}
          companyData={companyData}
        />
      )}
      {isAllowDelete && (
        <CompanyDeleteDialog
          open={openDeleteDialog}
          setOpen={setOpenDeleteDialog}
          companyId={companyData.id}
        />
      )}
    </>
  );
}
