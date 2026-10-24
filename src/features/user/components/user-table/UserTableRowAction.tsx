import { Link } from "@tanstack/react-router";
import { Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePermissionCheck } from "@/hooks/use-permission-check";

import type { ListUserContractType } from "../../api/user.contract";
import { UserUpdateDialog } from "../UserUpdateDialog";

export function UserTableRowAction({
  userData,
}: {
  userData: ListUserContractType["output"]["data"]["data"][number];
}) {
  const isAllowUpdate = usePermissionCheck([
    { level: "self", resource: "user", action: "manage" },
    { level: "self", resource: "user", action: "update" },
    { level: "system", resource: "user", action: "manage" },
    { level: "system", resource: "user", action: "update" },
  ]);

  return (
    <div className="flex items-center gap-2">
      {isAllowUpdate && <UserUpdateDialog userData={userData} />}
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              size="icon"
              variant="outline"
              nativeButton={false}
              render={
                <Link
                  to="/dashboard/users/$userId"
                  params={{
                    userId: userData.id,
                  }}
                  search={{
                    tab: "details",
                  }}
                />
              }
            />
          }
        >
          <Eye />
        </TooltipTrigger>
        <TooltipContent>
          <p>View details</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
