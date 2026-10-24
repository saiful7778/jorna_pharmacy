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

import { MedicineTable } from "../medicine";
import { PurchaseItemTable } from "../purchase";
import { SaleTable } from "./sale.table";

export const SaleItemTable = sqliteTable(
  "sale_items",
  {
    id: db_id,
    saleId: text("sale_id").notNull(),
    medicineId: text("medicine_id").notNull(),
    purchaseItemId: text("purchase_item_id").notNull(),
    qty: integer("qty").notNull(),
    unitPrice: db_money("unit_price").notNull(),
    unitCost: db_money("unit_cost").notNull(),
    lineTotal: db_money("line_total").notNull(),
    createdAt: db_created_at,
  },
  (table) => [
    foreignKey({
      name: "saleItem_sale_fkey",
      columns: [table.saleId],
      foreignColumns: [SaleTable.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "saleItem_medicine_fkey",
      columns: [table.medicineId],
      foreignColumns: [MedicineTable.id],
    }).onDelete("restrict"),
    foreignKey({
      name: "saleItem_purchaseItem_fkey",
      columns: [table.purchaseItemId],
      foreignColumns: [PurchaseItemTable.id],
    }).onDelete("restrict"),
    check("saleItem_qty_chk", sql`${table.qty} > 0`),
    index("saleItem_saleId_idx").on(table.saleId),
    index("saleItem_medicineId_idx").on(table.medicineId),
    index("saleItem_purchaseItemId_idx").on(table.purchaseItemId),
  ]
);

export const SaleItemRelations = relations(SaleItemTable, ({ one }) => ({
  sale: one(SaleTable, {
    fields: [SaleItemTable.saleId],
    references: [SaleTable.id],
    relationName: "SaleItemToSale",
  }),
  medicine: one(MedicineTable, {
    fields: [SaleItemTable.medicineId],
    references: [MedicineTable.id],
    relationName: "SaleItemToMedicine",
  }),
  batch: one(PurchaseItemTable, {
    fields: [SaleItemTable.purchaseItemId],
    references: [PurchaseItemTable.id],
    relationName: "SaleItemToPurchaseItem",
  }),
}));

export const insertSaleItemSchema = createInsertSchema(SaleItemTable, {
  saleId: z.uuid(),
  medicineId: z.uuid(),
  purchaseItemId: z.uuid(),
  qty: z.number().int().positive(),
});
export const selectSaleItemSchema = createSelectSchema(SaleItemTable, {
  id: z.uuid(),
  saleId: z.uuid(),
  medicineId: z.uuid(),
  purchaseItemId: z.uuid(),
});
export const updateSaleItemSchema = createUpdateSchema(SaleItemTable, {
  id: z.uuid().optional(),
  saleId: z.uuid().nullable(),
  medicineId: z.uuid().optional(),
  purchaseItemId: z.uuid().optional(),
});

export type SaleItemDataModel = typeof SaleItemTable.$inferSelect;
export type InsertSaleItem = z.infer<typeof insertSaleItemSchema>;
export type SelectSaleItem = z.infer<typeof selectSaleItemSchema>;
export type UpdateSaleItem = z.infer<typeof updateSaleItemSchema>;
