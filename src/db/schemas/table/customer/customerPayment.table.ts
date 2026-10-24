import { relations, sql } from "drizzle-orm";
import {
  check,
  foreignKey,
  index,
  sqliteTable,
  text,
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

import { SaleTable } from "../sale/sale.table";
import { UserTable } from "../user";
import { CustomerTable } from "./customer.table";

export const CustomerPaymentTable = sqliteTable(
  "customer_payments",
  {
    id: db_id,
    customerId: text("customer_id").notNull(),
    saleId: text("sale_id"), // null = general due collection
    amount: db_money("amount").notNull(),
    note: text("note"),
    createdBy: text("created_by"),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "customerPayment_customer_fkey",
      columns: [table.customerId],
      foreignColumns: [CustomerTable.id],
    }).onDelete("restrict"),
    foreignKey({
      name: "customerPayment_sale_fkey",
      columns: [table.saleId],
      foreignColumns: [SaleTable.id],
    }).onDelete("set null"),
    foreignKey({
      name: "customerPayment_createdBy_fkey",
      columns: [table.createdBy],
      foreignColumns: [UserTable.id],
    }).onDelete("set null"),
    check("customerPayment_amount_chk", sql`${table.amount} > 0`),
    index("customerPayment_customerId_idx").on(table.customerId),
    index("customerPayment_saleId_idx").on(table.saleId),
    index("customerPayment_createdAt_idx").on(table.createdAt),
  ]
);

export const CustomerPaymentRelations = relations(
  CustomerPaymentTable,
  ({ one }) => ({
    customer: one(CustomerTable, {
      fields: [CustomerPaymentTable.customerId],
      references: [CustomerTable.id],
      relationName: "CustomerPaymentToCustomer",
    }),
    sale: one(SaleTable, {
      fields: [CustomerPaymentTable.saleId],
      references: [SaleTable.id],
      relationName: "CustomerPaymentToSale",
    }),
    createdByUser: one(UserTable, {
      fields: [CustomerPaymentTable.createdBy],
      references: [UserTable.id],
      relationName: "CustomerPaymentToCreatedBy",
    }),
  })
);

export const insertCustomerPaymentSchema = createInsertSchema(
  CustomerPaymentTable,
  {
    customerId: z.uuid(),
    saleId: z.uuid().nullish(),
    amount: z.number().int().positive(),
    createdBy: z.uuid().nullable(),
  }
);
export const selectCustomerPaymentSchema = createSelectSchema(
  CustomerPaymentTable,
  {
    id: z.uuid(),
    customerId: z.uuid(),
    saleId: z.uuid().nullable(),
    createdBy: z.uuid().nullable(),
  }
);
export const updateCustomerPaymentSchema = createUpdateSchema(
  CustomerPaymentTable,
  {
    id: z.uuid().optional(),
    customerId: z.uuid().nullish(),
    saleId: z.uuid().nullish(),
    createdBy: z.uuid().nullable(),
  }
);

export type CustomerPaymentDataModel = typeof CustomerPaymentTable.$inferSelect;
export type InsertCustomerPayment = z.infer<typeof insertCustomerPaymentSchema>;
export type SelectCustomerPayment = z.infer<typeof selectCustomerPaymentSchema>;
export type UpdateCustomerPayment = z.infer<typeof updateCustomerPaymentSchema>;
