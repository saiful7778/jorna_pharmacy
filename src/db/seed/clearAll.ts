import type { DatabaseType } from "../clients/drizzle-client";
import * as schema from "../schemas";

export async function clearAll(db: DatabaseType) {
  console.log("🧹 Clearing existing data...");

  // Join tables first so their parent rows can be removed safely
  await db.delete(schema.UserRoleTable);
  await db.delete(schema.RolePermissionTable);

  await db.delete(schema.UserEventTable);
  await db.delete(schema.UserSessionTable);
  await db.delete(schema.UserDeviceTable);
  await db.delete(schema.AccountTable);
  await db.delete(schema.SessionTable);
  await db.delete(schema.VerificationTable);

  await db.delete(schema.CustomerPaymentTable);
  await db.delete(schema.CompanyPaymentTable);
  await db.delete(schema.SaleItemTable);
  await db.delete(schema.SaleTable);
  await db.delete(schema.SaleInvoiceTable);
  await db.delete(schema.PurchaseReturnItemTable);
  await db.delete(schema.PurchaseReturnTable);
  await db.delete(schema.PurchaseItemTable);
  await db.delete(schema.PurchaseTable);
  await db.delete(schema.MedicineTable);
  await db.delete(schema.CustomerTable);
  await db.delete(schema.CompanyTable);

  await db.delete(schema.UserTable);

  await db.delete(schema.RoleTable);
  await db.delete(schema.PermissionTable);

  console.log("🗑️  Cleared existing data \n");
}
