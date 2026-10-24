import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

import {
  db_created_at,
  db_id,
  db_money,
  db_updated_at,
} from "@/db/utils/db-utils";

import { CompanyTable, CompanyPaymentTable } from "../company";
import { UserTable } from "../user";
import { PurchaseItemTable } from "./purchaseItem.table";
import { PurchaseReturnTable } from "./purchaseReturn.table";

export const PurchaseTable = sqliteTable(
  "purchases",
  {
    id: db_id,
    companyId: text("company_id").notNull(),
    companyInvoiceNo: text("company_invoice_no"),
    subtotal: db_money("subtotal").notNull(),
    discount: db_money("discount").notNull().default(1),
    totalAmount: db_money("total_amount").notNull(),
    paidAmount: db_money("paid_amount").notNull().default(0),
    note: text("note"),
    createdBy: text("created_by"),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "purchase_company_fkey",
      columns: [table.companyId],
      foreignColumns: [CompanyTable.id],
    }).onDelete("restrict"),
    foreignKey({
      name: "purchase_createdBy_fkey",
      columns: [table.createdBy],
      foreignColumns: [UserTable.id],
    }).onDelete("set null"),
    uniqueIndex("purchase_companyInvoice_idx").on(
      table.companyId,
      table.companyInvoiceNo
    ),
    index("purchase_companyId_idx").on(table.companyId),
    index("purchase_createdAt_idx").on(table.createdAt),
  ]
);

export const PurchaseRelations = relations(PurchaseTable, ({ one, many }) => ({
  company: one(CompanyTable, {
    fields: [PurchaseTable.companyId],
    references: [CompanyTable.id],
    relationName: "PurchaseToCompany",
  }),
  items: many(PurchaseItemTable, { relationName: "PurchaseItemToPurchase" }),
  payments: many(CompanyPaymentTable, {
    relationName: "CompanyPaymentToPurchase",
  }),
  createdByUser: one(UserTable, {
    fields: [PurchaseTable.createdBy],
    references: [UserTable.id],
    relationName: "PurchaseToCreatedBy",
  }),
  returns: many(PurchaseReturnTable, {
    relationName: "PurchaseReturnToPurchase",
  }),
}));

export const insertPurchaseSchema = createInsertSchema(PurchaseTable, {
  companyId: z.uuid(),
  createdBy: z.uuid().nullish(),
});
export const selectPurchaseSchema = createSelectSchema(PurchaseTable, {
  id: z.uuid(),
  companyId: z.uuid(),
  createdBy: z.uuid().nullable(),
});
export const updatePurchaseSchema = createUpdateSchema(PurchaseTable, {
  id: z.uuid().optional(),
  companyId: z.uuid().optional(),
  createdBy: z.uuid().nullish(),
});

export type PurchaseDataModel = typeof PurchaseTable.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type SelectPurchase = z.infer<typeof selectPurchaseSchema>;
export type UpdatePurchase = z.infer<typeof updatePurchaseSchema>;
