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

import { CustomerPaymentTable, CustomerTable } from "../customer";
import { UserTable } from "../user";
import { SaleInvoiceTable } from "./saleInvoice.table";
import { SaleItemTable } from "./saleItem.table";

export const SaleTable = sqliteTable(
  "sales",
  {
    id: db_id,
    invoiceId: text("invoice_id").notNull(),
    customerId: text("customer_id"),
    subtotal: db_money("subtotal").notNull(),
    discount: db_money("discount").notNull().default(0),
    totalAmount: db_money("total_amount").notNull(),
    paidAmount: db_money("paid_amount").notNull().default(0),
    createdBy: text("created_by"),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "sale_customer_fkey",
      columns: [table.customerId],
      foreignColumns: [CustomerTable.id],
    }).onDelete("restrict"),
    foreignKey({
      name: "sale_invoice_fkey",
      columns: [table.invoiceId],
      foreignColumns: [SaleInvoiceTable.id],
    }).onDelete("restrict"),
    foreignKey({
      name: "sale_createdBy_fkey",
      columns: [table.createdBy],
      foreignColumns: [UserTable.id],
    }).onDelete("set null"),
    uniqueIndex("sale_invoiceId_idx").on(table.invoiceId),
    index("sale_customerId_idx").on(table.customerId),
    index("sale_createdAt_idx").on(table.createdAt),
    index("sale_createdBy_idx").on(table.createdBy),
  ]
);

export const SaleRelations = relations(SaleTable, ({ one, many }) => ({
  invoice: one(SaleInvoiceTable, {
    fields: [SaleTable.invoiceId],
    references: [SaleInvoiceTable.id],
    relationName: "SaleToInvoice",
  }),
  customer: one(CustomerTable, {
    fields: [SaleTable.customerId],
    references: [CustomerTable.id],
    relationName: "SaleToCustomer",
  }),
  createdByUser: one(UserTable, {
    fields: [SaleTable.createdBy],
    references: [UserTable.id],
    relationName: "SaleToCreatedBy",
  }),
  items: many(SaleItemTable, { relationName: "SaleItemToSale" }),
  payments: many(CustomerPaymentTable, {
    relationName: "CustomerPaymentToSale",
  }),
}));

export const insertSaleSchema = createInsertSchema(SaleTable, {
  customerId: z.uuid().nullish(),
  createdBy: z.uuid().nullish(),
});
export const selectSaleSchema = createSelectSchema(SaleTable, {
  id: z.uuid(),
  customerId: z.uuid().nullable(),
  createdBy: z.uuid().nullable(),
});
export const updateSaleSchema = createUpdateSchema(SaleTable, {
  id: z.uuid().optional(),
  customerId: z.uuid().nullish(),
  createdBy: z.uuid().nullish(),
});

export type SaleDataModel = typeof SaleTable.$inferSelect;
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type SelectSale = z.infer<typeof selectSaleSchema>;
export type UpdateSale = z.infer<typeof updateSaleSchema>;
