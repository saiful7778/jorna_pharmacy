import { relations, sql } from "drizzle-orm";
import {
  check,
  foreignKey,
  index,
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id, db_money } from "@/db/utils/db-utils";

import { PurchaseItemTable } from "./purchaseItem.table";
import { PurchaseReturnTable } from "./purchaseReturn.table";

export const PurchaseReturnItemTable = sqliteTable(
  "purchase_return_items",
  {
    id: db_id,
    purchaseReturnId: text("purchase_return_id").notNull(),
    purchaseItemId: text("purchase_item_id").notNull(),
    qty: integer("qty").notNull(),
    unitCost: db_money("unit_cost").notNull(),
    createdAt: db_created_at,
  },
  (table) => [
    foreignKey({
      name: "purchaseReturnItem_return_fkey",
      columns: [table.purchaseReturnId],
      foreignColumns: [PurchaseReturnTable.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "purchaseReturnItem_purchaseItem_fkey",
      columns: [table.purchaseItemId],
      foreignColumns: [PurchaseItemTable.id],
    }).onDelete("restrict"),
    check("purchaseReturnItem_qty_chk", sql`${table.qty} > 0`),
    index("purchaseReturnItem_returnId_idx").on(table.purchaseReturnId),
  ]
);

export const PurchaseReturnItemRelations = relations(
  PurchaseReturnItemTable,
  ({ one }) => ({
    purchaseReturn: one(PurchaseReturnTable, {
      fields: [PurchaseReturnItemTable.purchaseReturnId],
      references: [PurchaseReturnTable.id],
      relationName: "PurchaseReturnItemToPurchaseReturn",
    }),
    purchaseItem: one(PurchaseItemTable, {
      fields: [PurchaseReturnItemTable.purchaseItemId],
      references: [PurchaseItemTable.id],
      relationName: "PurchaseReturnItemToPurchaseItem",
    }),
  })
);

export const insertPurchaseReturnItemSchema = createInsertSchema(
  PurchaseReturnItemTable,
  {
    purchaseReturnId: z.uuid(),
    purchaseItemId: z.uuid(),
    qty: z.number().int().positive(),
  }
);
export const selectPurchaseReturnItemSchema = createSelectSchema(
  PurchaseReturnItemTable,
  { id: z.uuid(), purchaseReturnId: z.uuid(), purchaseItemId: z.uuid() }
);
export const updatePurchaseReturnItemSchema = createUpdateSchema(
  PurchaseReturnItemTable,
  {
    id: z.uuid().optional(),
    purchaseReturnId: z.uuid().optional(),
    purchaseItemId: z.uuid().optional(),
  }
);

export type PurchaseReturnItemDataModel =
  typeof PurchaseReturnItemTable.$inferSelect;
export type InsertPurchaseReturnItem = z.infer<
  typeof insertPurchaseReturnItemSchema
>;
export type SelectPurchaseReturnItem = z.infer<
  typeof selectPurchaseReturnItemSchema
>;
export type UpdatePurchaseReturnItem = z.infer<
  typeof updatePurchaseReturnItemSchema
>;
