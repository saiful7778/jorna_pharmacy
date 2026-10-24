import type { DatabaseType } from "../clients/drizzle-client";
import type { PermissionDataModel } from "../schemas";
import { PermissionTable } from "../schemas";
import type {
  ActionTypeEnumType,
  PermissionLevelEnumType,
  ResourceTypeEnumType,
} from "../schemas/enums/zod-db-enums";
import { insertChunkedReturning } from "./seed-utils";

export type PermissionType = Pick<
  PermissionDataModel,
  "level" | "resource" | "action"
>;

type CreatePermissionType = {
  level: PermissionLevelEnumType;
  resource: ResourceTypeEnumType;
  action: ActionTypeEnumType;
  description?: string | null | undefined;
};

const selfPermissions: CreatePermissionType[] = [
  // User
  {
    level: "self",
    resource: "user",
    action: "read",
    description: "View own profile information",
  },
  {
    level: "self",
    resource: "user",
    action: "update",
    description: "Edit own profile details",
  },

  // Customer
  {
    level: "self",
    resource: "customer",
    action: "read",
    description: "View own customer account and purchase history",
  },
  {
    level: "self",
    resource: "customer",
    action: "update",
    description: "Edit own customer account details",
  },

  // Salary
  {
    level: "self",
    resource: "salary",
    action: "read",
    description: "View own salary slips and payment history",
  },
];

const systemPermissions: CreatePermissionType[] = [
  // User
  {
    level: "system",
    resource: "user",
    action: "create",
    description: "Create new user accounts",
  },
  {
    level: "system",
    resource: "user",
    action: "read",
    description: "View any user's profile information",
  },
  {
    level: "system",
    resource: "user",
    action: "list",
    description: "List all users with filters and pagination",
  },
  {
    level: "system",
    resource: "user",
    action: "update",
    description: "Edit any user's profile details",
  },
  {
    level: "system",
    resource: "user",
    action: "delete",
    description: "Deactivate or remove any user account",
  },
  {
    level: "system",
    resource: "user",
    action: "manage",
    description: "Full user administration including role assignments",
  },

  // Role Permission
  {
    level: "system",
    resource: "role_permission",
    action: "create",
    description: "Create new roles and permissions",
  },
  {
    level: "system",
    resource: "role_permission",
    action: "read",
    description: "View role and permission configurations",
  },
  {
    level: "system",
    resource: "role_permission",
    action: "list",
    description: "List all roles and their assigned permissions",
  },
  {
    level: "system",
    resource: "role_permission",
    action: "update",
    description: "Modify role details and permission assignments",
  },
  {
    level: "system",
    resource: "role_permission",
    action: "delete",
    description: "Remove roles from the system",
  },
  {
    level: "system",
    resource: "role_permission",
    action: "manage",
    description: "Full access to configure roles and permissions",
  },

  // Report
  {
    level: "system",
    resource: "report",
    action: "read",
    description: "View a specific report and its figures",
  },
  {
    level: "system",
    resource: "report",
    action: "list",
    description: "List available reports and saved report runs",
  },
  {
    level: "system",
    resource: "report",
    action: "export",
    description: "Export report data to CSV or PDF",
  },
  {
    level: "system",
    resource: "report",
    action: "manage",
    description: "Full access to build and manage reports",
  },

  // Purchase
  {
    level: "system",
    resource: "purchase",
    action: "create",
    description: "Create purchase orders to vendors",
  },
  {
    level: "system",
    resource: "purchase",
    action: "read",
    description: "View purchase order details",
  },
  {
    level: "system",
    resource: "purchase",
    action: "list",
    description: "List purchase orders with filters and pagination",
  },
  {
    level: "system",
    resource: "purchase",
    action: "update",
    description: "Edit draft purchase orders and line items",
  },
  {
    level: "system",
    resource: "purchase",
    action: "delete",
    description: "Cancel or delete purchase orders",
  },
  {
    level: "system",
    resource: "purchase",
    action: "manage",
    description: "Full access to purchase order management",
  },
  {
    level: "system",
    resource: "purchase",
    action: "export",
    description: "Export purchase order records",
  },

  // Purchase Return
  {
    level: "system",
    resource: "purchase_return",
    action: "create",
    description: "Create purchase returns to vendors",
  },
  {
    level: "system",
    resource: "purchase_return",
    action: "read",
    description: "View purchase return details",
  },
  {
    level: "system",
    resource: "purchase_return",
    action: "list",
    description: "List purchase returns with filters and pagination",
  },
  {
    level: "system",
    resource: "purchase_return",
    action: "update",
    description: "Edit draft purchase returns",
  },
  {
    level: "system",
    resource: "purchase_return",
    action: "delete",
    description: "Cancel or delete purchase returns",
  },
  {
    level: "system",
    resource: "purchase_return",
    action: "manage",
    description: "Full access to purchase return management",
  },
  {
    level: "system",
    resource: "purchase_return",
    action: "export",
    description: "Export purchase return records",
  },

  // Medicine
  {
    level: "system",
    resource: "medicine",
    action: "create",
    description: "Add new medicines to the catalog",
  },
  {
    level: "system",
    resource: "medicine",
    action: "read",
    description: "View medicine details",
  },
  {
    level: "system",
    resource: "medicine",
    action: "list",
    description: "List medicines with filters and pagination",
  },
  {
    level: "system",
    resource: "medicine",
    action: "update",
    description: "Edit medicine details",
  },
  {
    level: "system",
    resource: "medicine",
    action: "delete",
    description: "Deactivate or remove medicines",
  },
  {
    level: "system",
    resource: "medicine",
    action: "manage",
    description: "Full access to medicine management",
  },
  {
    level: "system",
    resource: "medicine",
    action: "export",
    description: "Export medicine records",
  },

  // Vendor
  {
    level: "system",
    resource: "vendor",
    action: "create",
    description: "Add new vendors and suppliers",
  },
  {
    level: "system",
    resource: "vendor",
    action: "read",
    description: "View vendor details and outstanding balances",
  },
  {
    level: "system",
    resource: "vendor",
    action: "list",
    description: "List vendors with filters and pagination",
  },
  {
    level: "system",
    resource: "vendor",
    action: "update",
    description: "Edit vendor details",
  },
  {
    level: "system",
    resource: "vendor",
    action: "delete",
    description: "Deactivate or remove vendors",
  },
  {
    level: "system",
    resource: "vendor",
    action: "manage",
    description: "Full access to vendor management",
  },
  {
    level: "system",
    resource: "vendor",
    action: "export",
    description: "Export vendor records",
  },

  // Vendor Payment
  {
    level: "system",
    resource: "vendor_payment",
    action: "create",
    description: "Record payments made to vendors",
  },
  {
    level: "system",
    resource: "vendor_payment",
    action: "read",
    description: "View vendor payment details",
  },
  {
    level: "system",
    resource: "vendor_payment",
    action: "list",
    description: "List vendor payments with filters and pagination",
  },
  {
    level: "system",
    resource: "vendor_payment",
    action: "update",
    description: "Edit pending vendor payments",
  },
  {
    level: "system",
    resource: "vendor_payment",
    action: "delete",
    description: "Cancel or delete vendor payments",
  },
  {
    level: "system",
    resource: "vendor_payment",
    action: "manage",
    description: "Full access to vendor payment management",
  },
  {
    level: "system",
    resource: "vendor_payment",
    action: "export",
    description: "Export vendor payment records",
  },

  // Customer
  {
    level: "system",
    resource: "customer",
    action: "create",
    description: "Add new customers",
  },
  {
    level: "system",
    resource: "customer",
    action: "read",
    description: "View customer details and purchase history",
  },
  {
    level: "system",
    resource: "customer",
    action: "list",
    description: "List customers with filters and pagination",
  },
  {
    level: "system",
    resource: "customer",
    action: "update",
    description: "Edit customer details",
  },
  {
    level: "system",
    resource: "customer",
    action: "delete",
    description: "Deactivate or remove customers",
  },
  {
    level: "system",
    resource: "customer",
    action: "manage",
    description: "Full access to customer management",
  },
  {
    level: "system",
    resource: "customer",
    action: "export",
    description: "Export customer records",
  },

  // Customer Payment
  {
    level: "system",
    resource: "customer_payment",
    action: "create",
    description: "Record payments received from customers",
  },
  {
    level: "system",
    resource: "customer_payment",
    action: "read",
    description: "View customer payment details",
  },
  {
    level: "system",
    resource: "customer_payment",
    action: "list",
    description: "List customer payments with filters and pagination",
  },
  {
    level: "system",
    resource: "customer_payment",
    action: "update",
    description: "Edit pending customer payments",
  },
  {
    level: "system",
    resource: "customer_payment",
    action: "delete",
    description: "Cancel or delete customer payments",
  },
  {
    level: "system",
    resource: "customer_payment",
    action: "manage",
    description: "Full access to customer payment management",
  },
  {
    level: "system",
    resource: "customer_payment",
    action: "export",
    description: "Export customer payment records",
  },

  // Sale
  {
    level: "system",
    resource: "sale",
    action: "create",
    description: "Create new sales invoices",
  },
  {
    level: "system",
    resource: "sale",
    action: "read",
    description: "View sale invoice details",
  },
  {
    level: "system",
    resource: "sale",
    action: "list",
    description: "List sales with filters and pagination",
  },
  {
    level: "system",
    resource: "sale",
    action: "update",
    description: "Edit or void sale invoices",
  },
  {
    level: "system",
    resource: "sale",
    action: "delete",
    description: "Delete sale invoices",
  },
  {
    level: "system",
    resource: "sale",
    action: "manage",
    description: "Full access to sales management",
  },
  {
    level: "system",
    resource: "sale",
    action: "export",
    description: "Export sales records",
  },

  // Sale Return
  {
    level: "system",
    resource: "sale_closing",
    action: "create",
    description: "Process sale closing",
  },
  {
    level: "system",
    resource: "sale_closing",
    action: "read",
    description: "View sale closing details",
  },
  {
    level: "system",
    resource: "sale_closing",
    action: "list",
    description: "List sale clsing with filters and pagination",
  },
  {
    level: "system",
    resource: "sale_closing",
    action: "update",
    description: "Edit sale closing",
  },
  {
    level: "system",
    resource: "sale_closing",
    action: "manage",
    description: "Full access to sale closing management",
  },
  {
    level: "system",
    resource: "sale_closing",
    action: "export",
    description: "Export sale clsing records",
  },

  // Salary
  {
    level: "system",
    resource: "salary",
    action: "create",
    description: "Create salary records and payroll runs",
  },
  {
    level: "system",
    resource: "salary",
    action: "read",
    description: "View salary records and payslips",
  },
  {
    level: "system",
    resource: "salary",
    action: "list",
    description: "List salary payments with filters and pagination",
  },
  {
    level: "system",
    resource: "salary",
    action: "update",
    description: "Edit salary records before payout",
  },
  {
    level: "system",
    resource: "salary",
    action: "delete",
    description: "Delete salary records",
  },
  {
    level: "system",
    resource: "salary",
    action: "manage",
    description: "Full access to payroll and salary management",
  },
  {
    level: "system",
    resource: "salary",
    action: "export",
    description: "Export salary records",
  },
];

export const permissionsData: CreatePermissionType[] = [
  ...selfPermissions,
  ...systemPermissions,
];

export async function seedPermission(
  db: DatabaseType
): Promise<Array<PermissionDataModel>> {
  console.log("🌱 Seeding permissions...");

  const permissions = await insertChunkedReturning(
    permissionsData.map((p) => ({
      ...p,
      level: p.level,
      resource: p.resource,
      action: p.action,
    })),
    (chunk) => db.insert(PermissionTable).values(chunk).returning()
  );

  console.log(`✅ ${permissions.length} Permissions seeded`);
  return permissions;
}
