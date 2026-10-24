import z from "zod";

import {
  RoleTable,
  selectRoleSchema,
  selectUserSchema,
  UserTable,
} from "@/db/schemas";
import { RoleEnumSchema } from "@/db/schemas/enums/zod-db-enums";
import { jsonGroupArray } from "@/db/utils/sql-helpers";

export const roleColumnSql = jsonGroupArray(
  {
    id: RoleTable.id,
    roleName: RoleTable.roleName,
  },
  RoleTable.id
).as("roles");

export const userProfileColumns = {
  id: UserTable.id,
  name: UserTable.name,
  email: UserTable.email,
  image: UserTable.image,
  roles: roleColumnSql,
};

export const roleSqlSchema = selectRoleSchema
  .pick({
    id: true,
  })
  .extend({
    roleName: RoleEnumSchema,
  });

export const userProfileSchema = selectUserSchema
  .pick({
    id: true,
    name: true,
    email: true,
    image: true,
  })
  .extend({
    roles: z.array(roleSqlSchema),
  });
export type UserProfileType = z.infer<typeof userProfileSchema>;
