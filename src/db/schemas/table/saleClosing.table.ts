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
  db_date,
  db_id,
  db_money,
  db_updated_at,
} from "@/db/utils/db-utils";

import { UserTable } from "./user";

export const SaleClosingTable = sqliteTable(
  "sale_closings",
  {
    id: db_id,
    periodStart: db_date("period_start").notNull(),
    periodEnd: db_date("period_end").notNull(),
    companyPaid: db_money("company_paid").default(0),
    totalSales: db_money("total_sales").notNull(),
    openingCash: db_money("opening_cash").default(0),
    cashReceived: db_money("cash_received").notNull(),
    totalExpenses: db_money("total_expenses").notNull().default(0),
    totalSalary: db_money("total_salary").notNull(),
    countedCash: db_money("counted_cash"), // physically counted in drawer
    closedBy: text("closed_by"),
    note: text("note"),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "saleClosing_closedBy_fkey",
      columns: [table.closedBy],
      foreignColumns: [UserTable.id],
    }).onDelete("set null"),
    check(
      "saleClosing_period_chk",
      sql`${table.periodEnd} > ${table.periodStart}`
    ),
    index("saleClosing_closedBy_idx").on(table.closedBy),
    index("saleClosing_periodStart_idx").on(table.periodStart),
  ]
);

export const SaleClosingRelations = relations(SaleClosingTable, ({ one }) => ({
  closedByUser: one(UserTable, {
    fields: [SaleClosingTable.closedBy],
    references: [UserTable.id],
    relationName: "SaleClosingToClosedBy",
  }),
}));

export const insertSaleClosingSchema = createInsertSchema(SaleClosingTable, {
  closedBy: z.uuid().nullish(),
}).omit({ id: true, createdAt: true, updatedAt: true });
export const selectSaleClosingSchema = createSelectSchema(SaleClosingTable, {
  id: z.uuid(),
  closedBy: z.uuid().nullable(),
});
export const updateSaleClosingSchema = createUpdateSchema(SaleClosingTable, {
  id: z.uuid().optional(),
  closedBy: z.uuid().nullish(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export type SaleClosingDataModel = typeof SaleClosingTable.$inferSelect;
export type InsertSaleClosing = z.infer<typeof insertSaleClosingSchema>;
export type SelectSaleClosing = z.infer<typeof selectSaleClosingSchema>;
export type UpdateSaleClosing = z.infer<typeof updateSaleClosingSchema>;
