import { implement } from "@orpc/server";
import { eq, sql } from "drizzle-orm";

import { API_MESSAGES } from "@/constants/apiMessage";
import {
  PermissionTable,
  RolePermissionTable,
  RoleTable,
  UserRoleTable,
} from "@/db/schemas";
import { jsonGroupArray } from "@/db/utils/sql-helpers";
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
    const result = await context.db
      .select({
        id: RoleTable.id,
        roleName: RoleTable.roleName,
        description: RoleTable.description,
        totalUsers: sql<number>`COALESCE(COUNT(DISTINCT ${UserRoleTable.userId}), 0)`,
        permissions: jsonGroupArray(
          {
            id: PermissionTable.id,
            level: PermissionTable.level,
            action: PermissionTable.action,
            resource: PermissionTable.resource,
            description: PermissionTable.description,
          },
          PermissionTable.id
        ),
      })
      .from(RoleTable)
      .leftJoin(UserRoleTable, eq(RoleTable.id, UserRoleTable.roleId))
      .leftJoin(
        RolePermissionTable,
        eq(RoleTable.id, RolePermissionTable.roleId)
      )
      .leftJoin(
        PermissionTable,
        eq(RolePermissionTable.permissionId, PermissionTable.id)
      )
      .groupBy(RoleTable.id);

    return apiResponse(API_MESSAGES.USER.ROLE.GET_ALL, result);
  });
