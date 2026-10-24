import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type {
  ActionTypeEnumType,
  ResourceTypeEnumType,
} from "@/db/schemas/enums/zod-db-enums";
import { formatEnumValue } from "@/utils/formatEnum";

import type { ListRoleContractType } from "../../api/role.contract";

type Permission =
  ListRoleContractType["output"]["data"][number]["permissions"][number];

function PermissionBadge({
  resource,
  action,
  description,
}: {
  resource: ResourceTypeEnumType;
  action: ActionTypeEnumType;
  description: string | null;
}) {
  const label = `${formatEnumValue(resource)} - ${action}`;

  if (description) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={<Badge variant="secondary" className="capitalize" />}
        >
          {label}
        </TooltipTrigger>
        <TooltipContent>
          <p>{description}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Badge variant="secondary" className="capitalize">
      {label}
    </Badge>
  );
}

const MAX_VISIBLE = 4;

export function PermissionsCell({
  permissions,
}: {
  permissions: Permission[];
}) {
  if (permissions.length === 0) {
    return <Badge variant="secondary">Empty</Badge>;
  }

  if (permissions.length <= MAX_VISIBLE) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {permissions.map((perm) => (
          <PermissionBadge
            key={perm.id}
            resource={perm.resource}
            description={perm.description}
            action={perm.action}
          />
        ))}
      </div>
    );
  }

  const visiblePerm = permissions.slice(0, MAX_VISIBLE);
  const hiddenPerm = permissions.slice(MAX_VISIBLE);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {visiblePerm.map((perm) => (
        <PermissionBadge
          key={perm.id}
          resource={perm.resource}
          description={perm.description}
          action={perm.action}
        />
      ))}
      <Popover>
        <PopoverTrigger render={<Button variant="secondary" size="sm" />}>
          {`+${hiddenPerm.length} more`}
        </PopoverTrigger>
        <PopoverContent
          className="max-h-75 w-full max-w-lg overflow-y-auto"
          align="end"
        >
          <div className="flex flex-wrap items-center gap-2">
            {hiddenPerm.map((perm) => (
              <PermissionBadge
                key={perm.id}
                resource={perm.resource}
                description={perm.description}
                action={perm.action}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
