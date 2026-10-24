import { relations } from "drizzle-orm";
import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

import {
  db_bool,
  db_created_at,
  db_id,
  db_updated_at,
} from "@/db/utils/db-utils";

import { SaleTable } from "../sale/sale.table";
import { CustomerPaymentTable } from "./customerPayment.table";

export const CustomerTable = sqliteTable(
  "customers",
  {
    id: db_id,
    name: text("name").notNull(),
    phone: text("phone"),
    address: text("address"),
    note: text("note"),
    isActive: db_bool("is_active").notNull().default(true),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    index("customer_phone_idx").on(table.phone),
    index("customer_name_idx").on(table.name),
  ]
);

export const CustomerRelations = relations(CustomerTable, ({ many }) => ({
  sales: many(SaleTable, { relationName: "SaleToCustomer" }),
  payments: many(CustomerPaymentTable, {
    relationName: "CustomerPaymentToCustomer",
  }),
}));

export const insertCustomerSchema = createInsertSchema(CustomerTable);
export const selectCustomerSchema = createSelectSchema(CustomerTable, {
  id: z.uuid(),
});
export const updateCustomerSchema = createUpdateSchema(CustomerTable, {
  id: z.uuid().optional(),
});

export type CustomerDataModel = typeof CustomerTable.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type SelectCustomer = z.infer<typeof selectCustomerSchema>;
export type UpdateCustomer = z.infer<typeof updateCustomerSchema>;
