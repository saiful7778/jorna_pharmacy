import { createAccessControl } from "better-auth/plugins";
import { defaultStatements } from "better-auth/plugins/admin/access";

import { RoleEnumSchema } from "@/db/schemas/enums/zod-db-enums";

const statement = {
  ...defaultStatements,
} as const;

export const systemAc = createAccessControl(statement);

export const systemRoles = {
  [RoleEnumSchema.enum.USER]: systemAc.newRole({
    user: ["get", "update"],
    session: ["list", "revoke"],
  }),
  [RoleEnumSchema.enum.EMPLOYEE]: systemAc.newRole({
    user: [
      "create",
      "list",
      "set-role",
      "ban",
      "impersonate",
      "impersonate-admins",
      "set-password",
      "get",
    ],
    session: ["list", "revoke"],
  }),
  [RoleEnumSchema.enum.ADMIN]: systemAc.newRole({
    user: [
      "create",
      "list",
      "set-role",
      "ban",
      "impersonate",
      "impersonate-admins",
      "set-password",
      "get",
      "update",
    ],
    session: ["list", "revoke"],
  }),
  [RoleEnumSchema.enum.SUPER_ADMIN]: systemAc.newRole({
    user: [
      "create",
      "list",
      "set-role",
      "ban",
      "impersonate",
      "impersonate-admins",
      "delete",
      "set-password",
      "get",
      "update",
    ],
    session: ["list", "revoke", "delete"],
  }),
};

export type SystemPermissionStatement = typeof statement;
export type SystemResource = keyof SystemPermissionStatement;
export type SystemAction<T extends SystemResource> =
  SystemPermissionStatement[T][number];
