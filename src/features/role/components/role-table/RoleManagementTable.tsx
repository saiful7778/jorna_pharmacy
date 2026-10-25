import { Fragment, useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { cn } from "cn";
import { ChevronRight } from "lucide-react";

import { DataTableEmpty } from "@/components/data-table/data-table-empty";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbarSkeleton } from "@/components/data-table/data-table-toolbar-skeleton";
import { QueryStateBoundary } from "@/components/tanstack-query/query-state-boundary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ACTION_TYPE } from "@/db/schemas/enums/enum-values";
import type { RoleEnumType } from "@/db/schemas/enums/zod-db-enums";
import { orpcTQClient } from "@/oRPC/orpc";
import { formatEnumValue } from "@/utils/formatEnum";

import type { ListRoleContractType } from "../../api/role.contract";

const ROLE_BADGE_VARIANT: Record<
  RoleEnumType,
  "default" | "secondary" | "outline" | "destructive"
> = {
  SUPER_ADMIN: "destructive",
  ADMIN: "default",
  EMPLOYEE: "secondary",
  USER: "outline",
};

type PermissionType =
  ListRoleContractType["output"]["data"][number]["permissions"][number];

function PermissionMatrix({ permissions }: { permissions: PermissionType[] }) {
  const rows = useMemo(() => {
    const map = new Map<string, Map<string, PermissionType[]>>();
    for (const p of permissions) {
      if (!map.has(p.resource)) map.set(p.resource, new Map());
      const byAction = map.get(p.resource)!;
      byAction.set(p.action, [...(byAction.get(p.action) ?? []), p]);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [permissions]);

  if (rows.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        No permissions assigned to this role.
      </p>
    );
  }

  return (
    <div className="rounded-md border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-48">Resource</TableHead>
            {ACTION_TYPE.map((action) => (
              <TableHead key={action} className="text-center capitalize">
                {action}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(([resource, byAction]) => (
            <TableRow key={resource}>
              <TableCell className="font-medium">
                {formatEnumValue(resource)}
              </TableCell>
              {ACTION_TYPE.map((action) => {
                const perms = byAction.get(action);
                return (
                  <TableCell key={action} className="text-center">
                    {perms ? (
                      <div className="flex flex-wrap items-center justify-center gap-1">
                        {perms.map((p) => (
                          <Badge
                            key={p.id}
                            title={p.description ?? undefined}
                            variant={
                              p.level === "system" ? "default" : "outline"
                            }
                            className="text-[10px] capitalize"
                          >
                            {p.level}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function RoleManagementTable() {
  "use no memo";
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.role.listRole.queryOptions({ select: (result) => result.data })
  );

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <QueryStateBoundary
      isLoading={isLoading}
      isError={isError}
      error={error}
      data={data}
      isEmpty={(d) => d.length === 0}
      loadingFallback={
        <DataTableSkeleton>
          <DataTableToolbarSkeleton />
        </DataTableSkeleton>
      }
      emptyFallback={<DataTableEmpty />}
    >
      {(roleData) => (
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12" />
                <TableHead>Role</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Users</TableHead>
                <TableHead className="text-right">Permissions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roleData.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No roles found.
                  </TableCell>
                </TableRow>
              )}
              {roleData.map((role) => {
                const isOpen = expanded.has(role.id);
                return (
                  <Fragment key={role.id}>
                    <TableRow
                      className="cursor-pointer"
                      data-state={isOpen ? "selected" : undefined}
                      onClick={() => toggle(role.id)}
                    >
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          aria-expanded={isOpen}
                          aria-label={`${isOpen ? "Collapse" : "Expand"} ${formatEnumValue(role.roleName)} permissions`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggle(role.id);
                          }}
                        >
                          <ChevronRight
                            className={cn(
                              "size-4 transition-transform",
                              isOpen && "rotate-90"
                            )}
                          />
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Badge variant={ROLE_BADGE_VARIANT[role.roleName]}>
                          {formatEnumValue(role.roleName)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md truncate text-muted-foreground">
                        {role.description ?? "—"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {role.totalUsers}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {role.permissions.length}
                      </TableCell>
                    </TableRow>

                    {isOpen && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={5} className="bg-muted/40 p-4">
                          <PermissionMatrix permissions={role.permissions} />
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </QueryStateBoundary>
  );
}
