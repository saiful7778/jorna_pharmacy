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
  db_bool,
  db_created_at,
  db_date,
  db_id,
  db_updated_at,
} from "@/db/utils/db-utils";

import { SaleTable } from ".";
import { UserTable } from "../user";

export const SaleInvoiceTable = sqliteTable(
  "sale_invoices",
  {
    id: db_id,
    number: text("number").notNull(),
    isLinked: db_bool("is_linked").notNull().default(false),
    reservedBy: text("reserved_by"),
    reservedUntil: db_date("reserved_until"),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "sale_invoice_reservedBy_fkey",
      columns: [table.reservedBy],
      foreignColumns: [UserTable.id],
    }).onDelete("set null"),
    uniqueIndex("sale_invoice_number_idx").on(table.number),
    index("sale_invoice_reservation_idx").on(
      table.isLinked,
      table.reservedUntil
    ),
  ]
);

export const saleInvoiceRelations = relations(SaleInvoiceTable, ({ one }) => ({
  sale: one(SaleTable, {
    fields: [SaleInvoiceTable.id],
    references: [SaleTable.invoiceId],
    relationName: "SaleToInvoice",
  }),
  reservedByUser: one(UserTable, {
    fields: [SaleInvoiceTable.reservedBy],
    references: [UserTable.id],
    relationName: "saleInvoiceToReservedBy",
  }),
}));

export const insertSaleInvoiceSchema = createInsertSchema(SaleInvoiceTable, {
  reservedBy: z.uuid().nullish(),
});
export const selectSaleInvoiceSchema = createSelectSchema(SaleInvoiceTable, {
  reservedBy: z.uuid().nullish(),
});
export const updateSaleInvoiceSchema = createUpdateSchema(SaleInvoiceTable, {
  reservedBy: z.uuid().nullish(),
});

export type SaleInvoiceDataModel = typeof SaleInvoiceTable.$inferSelect;
export type InsertSaleInvoice = z.infer<typeof insertSaleInvoiceSchema>;
export type SelectSaleInvoice = z.infer<typeof selectSaleInvoiceSchema>;
export type UpdateSaleInvoice = z.infer<typeof updateSaleInvoiceSchema>;
