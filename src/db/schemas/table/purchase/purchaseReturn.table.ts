import { relations } from "drizzle-orm";
import { foreignKey, index, sqliteTable, text } from "drizzle-orm/sqlite-core";
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

import { CompanyTable } from "../company";
import { UserTable } from "../user";
import { PurchaseTable } from "./purchase.table";
import { PurchaseReturnItemTable } from "./purchaseReturnItem.table";

export const PurchaseReturnTable = sqliteTable(
  "purchase_returns",
  {
    id: db_id,
    companyId: text("compnay_id").notNull(),
    purchaseId: text("purchase_id").notNull(),
    totalAmount: db_money("total_amount").notNull(),
    reason: text("reason"),
    createdBy: text("created_by"),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "purchaseReturn_company_fkey",
      columns: [table.companyId],
      foreignColumns: [CompanyTable.id],
    }).onDelete("restrict"),
    foreignKey({
      name: "purchaseReturn_purchase_fkey",
      columns: [table.purchaseId],
      foreignColumns: [PurchaseTable.id],
    }).onDelete("set null"),
    foreignKey({
      name: "purchaseReturn_createdBy_fkey",
      columns: [table.createdBy],
      foreignColumns: [UserTable.id],
    }).onDelete("set null"),
    index("companyId_idx").on(table.companyId),
    index("purchaseReturn_createdBy_idx").on(table.createdBy),
  ]
);

export const PurchaseReturnRelations = relations(
  PurchaseReturnTable,
  ({ one, many }) => ({
    company: one(CompanyTable, {
      fields: [PurchaseReturnTable.companyId],
      references: [CompanyTable.id],
      relationName: "PurchaseReturnToCompany",
    }),
    purchase: one(PurchaseTable, {
      fields: [PurchaseReturnTable.purchaseId],
      references: [PurchaseTable.id],
      relationName: "PurchaseReturnToPurchase",
    }),
    createdByUser: one(UserTable, {
      fields: [PurchaseReturnTable.createdBy],
      references: [UserTable.id],
      relationName: "PurchaseReturnToCreatedBy",
    }),
    items: many(PurchaseReturnItemTable, {
      relationName: "PurchaseReturnItemToPurchaseReturn",
    }),
  })
);

export const insertPurchaseReturnSchema = createInsertSchema(
  PurchaseReturnTable,
  {
    companyId: z.uuid(),
    purchaseId: z.uuid(),
    createdBy: z.uuid().nullish(),
  }
);
export const selectPurchaseReturnSchema = createSelectSchema(
  PurchaseReturnTable,
  {
    id: z.uuid(),
    companyId: z.uuid(),
    purchaseId: z.uuid(),
    createdBy: z.uuid().nullable(),
  }
);
export const updatePurchaseReturnSchema = createUpdateSchema(
  PurchaseReturnTable,
  {
    id: z.uuid().optional(),
    companyId: z.uuid().optional(),
    purchaseId: z.uuid(),
    createdBy: z.uuid().nullish(),
  }
);

export type PurchaseReturnDataModel = typeof PurchaseReturnTable.$inferSelect;
export type InsertPurchaseReturn = z.infer<typeof insertPurchaseReturnSchema>;
export type SelectPurchaseReturn = z.infer<typeof selectPurchaseReturnSchema>;
export type UpdatePurchaseReturn = z.infer<typeof updatePurchaseReturnSchema>;
