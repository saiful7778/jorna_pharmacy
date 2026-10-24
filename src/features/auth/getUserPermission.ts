import { eq, inArray } from "drizzle-orm";

import type { DatabaseType } from "@/db/clients/drizzle-client";
import {
  PermissionTable,
  RolePermissionTable,
  RoleTable,
  UserRoleTable,
} from "@/db/schemas";
import type { PermissionType, RoleType } from "@/types";

export async function getUserRolesAndPermission(
  userId: string,
  database: DatabaseType
): Promise<{
  roles: RoleType[];
  permissions: PermissionType[];
}> {
  const systemRoles = await database
    .select({
      id: RoleTable.id,
      roleName: RoleTable.roleName,
    })
    .from(RoleTable)
    .innerJoin(UserRoleTable, eq(RoleTable.id, UserRoleTable.roleId))
    .where(eq(UserRoleTable.userId, userId));

  const systemRolePermissions = await database
    .select({
      level: PermissionTable.level,
      resource: PermissionTable.resource,
      action: PermissionTable.action,
    })
    .from(PermissionTable)
    .innerJoin(
      RolePermissionTable,
      eq(PermissionTable.id, RolePermissionTable.permissionId)
    )
    .where(
      inArray(
        RolePermissionTable.roleId,
        systemRoles.map(({ id }) => id)
      )
    );

  const roleMap = new Map<string, RoleType>();

  systemRoles.forEach((systemRole) => {
    roleMap.set(systemRole.roleName, {
      roleName: systemRole.roleName,
    });
  });

  return {
    roles: Array.from(roleMap.values()),
    permissions: systemRolePermissions,
  };
}
