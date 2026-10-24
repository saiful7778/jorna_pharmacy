import type { DatabaseType } from "../clients/drizzle-client";
import type {
  PermissionDataModel,
  RoleDataModel,
  RolePermissionDataModel,
} from "../schemas";
import { RolePermissionTable } from "../schemas";
import type { RoleEnumType } from "../schemas/enums/zod-db-enums";
import type { PermissionType } from "./permission.seed";
import { insertChunkedReturning } from "./seed-utils";

/**
 * Regular user: manages their own account only. `self` permissions are scope
 * checked at evaluation time (the user must be the resource owner).
 */
const userPermissions: Array<PermissionType> = [
  { level: "self", resource: "user", action: "read" },
  { level: "self", resource: "user", action: "update" },
];

/**
 * Employee: counter staff. Runs sales and sale returns, keeps customer records
 * up to date, records customer payments, and views their own payslip. Deletes,
 * exports and all purchasing/reporting stay with admins.
 */
const employeePermissions: Array<PermissionType> = [
  // Own profile, own customer account and own payslip
  { level: "self", resource: "user", action: "read" },
  { level: "self", resource: "user", action: "update" },
  { level: "self", resource: "customer", action: "read" },
  { level: "self", resource: "customer", action: "update" },
  { level: "self", resource: "salary", action: "read" },

  // Counter sales
  { level: "system", resource: "sale", action: "create" },
  { level: "system", resource: "sale", action: "read" },
  { level: "system", resource: "sale", action: "list" },

  // Customer management
  { level: "system", resource: "customer", action: "create" },
  { level: "system", resource: "customer", action: "read" },
  { level: "system", resource: "customer", action: "list" },
  { level: "system", resource: "customer", action: "update" },
  { level: "system", resource: "customer_payment", action: "create" },
  { level: "system", resource: "customer_payment", action: "read" },
  { level: "system", resource: "customer_payment", action: "list" },

  // Medicine catalog (view only)
  { level: "system", resource: "medicine", action: "read" },
  { level: "system", resource: "medicine", action: "list" },
];

/**
 * Admin: runs the pharmacy. Full access to every business resource and report
 * (the `manage` action is a wildcard over create/read/list/update/delete/
 * export), plus staff read/update. Full user administration and role/permission
 * management are reserved for super admins.
 */
const adminPermissions: Array<PermissionType> = [
  // Own profile and own payslip
  { level: "self", resource: "user", action: "read" },
  { level: "self", resource: "user", action: "update" },
  { level: "self", resource: "salary", action: "read" },

  // Staff administration (view and edit; create/delete is super admin)
  { level: "system", resource: "user", action: "read" },
  { level: "system", resource: "user", action: "list" },
  { level: "system", resource: "user", action: "update" },

  // Full access to every business resource and report
  { level: "system", resource: "report", action: "manage" },
  { level: "system", resource: "purchase", action: "manage" },
  { level: "system", resource: "purchase_return", action: "manage" },
  { level: "system", resource: "vendor", action: "manage" },
  { level: "system", resource: "vendor_payment", action: "manage" },
  { level: "system", resource: "medicine", action: "manage" },
  { level: "system", resource: "customer", action: "manage" },
  { level: "system", resource: "customer_payment", action: "manage" },
  { level: "system", resource: "sale", action: "manage" },
  { level: "system", resource: "sale_closing", action: "manage" },
  { level: "system", resource: "salary", action: "manage" },
];

/**
 * Super admin: everything an admin can do, plus system-level operations —
 * full user administration (including role assignment) and complete control
 * over roles and permissions.
 */
const superAdminPermissions: Array<PermissionType> = [
  // Everything an admin can do
  ...adminPermissions,

  // System-level operations
  { level: "system", resource: "user", action: "manage" },
  { level: "system", resource: "role_permission", action: "manage" },
];

export const rolesAndPermissionData: Array<{
  roleName: RoleEnumType;
  permissions: Array<PermissionType>;
}> = [
  {
    roleName: "USER",
    permissions: userPermissions,
  },
  {
    roleName: "EMPLOYEE",
    permissions: employeePermissions,
  },
  {
    roleName: "ADMIN",
    permissions: adminPermissions,
  },
  {
    roleName: "SUPER_ADMIN",
    permissions: superAdminPermissions,
  },
];

export async function seedRolePermission(
  db: DatabaseType,
  roles: Array<RoleDataModel>,
  permissions: Array<PermissionDataModel>
): Promise<Array<RolePermissionDataModel>> {
  console.log("🌱 Seeding role permissions...");

  const rolePermissionRows = rolesAndPermissionData.flatMap((r) => {
    const role = roles.find(({ roleName }) => roleName === r.roleName);

    if (!role) return [];

    const permissionsForRole = permissions
      .filter((permission) =>
        r.permissions.some(
          (rp) =>
            rp.level === permission.level &&
            rp.resource === permission.resource &&
            rp.action === permission.action
        )
      )
      .map(({ id }) => ({
        roleId: role.id,
        permissionId: id,
      }));

    console.log(
      `📝 Assigning ${permissionsForRole.length} permissions to ${r.roleName}`
    );

    return permissionsForRole;
  });

  const rolesAndPermissions = await insertChunkedReturning(
    rolePermissionRows,
    (chunk) => db.insert(RolePermissionTable).values(chunk).returning()
  );

  console.log(`✅ ${rolesAndPermissions.length} Role permissions seeded`);
  return rolesAndPermissions;
}
