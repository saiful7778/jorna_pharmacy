import { implement } from "@orpc/server";
import { eq, sql } from "drizzle-orm";

import { API_MESSAGES } from "@/constants/apiMessage";
import {
  PermissionTable,
  RolePermissionTable,
  RoleTable,
  UserRoleTable,
} from "@/db/schemas";
import { apiResponse } from "@/lib/apiResponse";
import {
  authMiddleware,
  userPermissionMiddleware,
} from "@/oRPC/middleware/auth.middleware";
import { errorMiddleware } from "@/oRPC/middleware/error.middleware";
import type { ORPCContext } from "@/types/orpc.types";

import { roleContract } from "./role.contract";

export const roleImpl = implement(roleContract)
  .$context<ORPCContext>()
  .use(authMiddleware)
  .use(errorMiddleware);

export const listRoleProcedure = roleImpl.listRole
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "role_permission", action: "list" },
    ])
  )
  .handler(async ({ context }) => {
    const roles = await context.db
      .select({
        id: RoleTable.id,
        roleName: RoleTable.roleName,
        description: RoleTable.description,
        totalUsers: sql<number>`COALESCE(COUNT(DISTINCT ${UserRoleTable.userId}), 0)`,
      })
      .from(RoleTable)
      .leftJoin(UserRoleTable, eq(RoleTable.id, UserRoleTable.roleId))
      .groupBy(RoleTable.id);

    // 2. Permissions per role (flat rows)
    const rolePermissions = await context.db
      .select({
        roleId: RolePermissionTable.roleId,
        id: PermissionTable.id,
        level: PermissionTable.level,
        action: PermissionTable.action,
        resource: PermissionTable.resource,
        description: PermissionTable.description,
      })
      .from(RolePermissionTable)
      .innerJoin(
        PermissionTable,
        eq(RolePermissionTable.permissionId, PermissionTable.id)
      );

    // 3. Group permissions by roleId using a Map
    const permissionsByRole = new Map<
      string,
      Array<Omit<(typeof rolePermissions)[number], "roleId">>
    >();

    for (const rolePermission of rolePermissions) {
      const { roleId, ...permission } = rolePermission;
      const list = permissionsByRole.get(roleId);
      if (list) {
        list.push(permission);
      } else {
        permissionsByRole.set(roleId, [permission]);
      }
    }

    // 4. Join roles with their permissions
    const result = roles.map((role) => ({
      ...role,
      permissions: permissionsByRole.get(role.id) ?? [],
    }));

    return apiResponse(API_MESSAGES.USER.ROLE.GET_ALL, result);
  });
