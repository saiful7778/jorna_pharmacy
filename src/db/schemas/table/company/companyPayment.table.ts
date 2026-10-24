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

import { PurchaseTable } from "../purchase";
import { UserTable } from "../user";
import { CompanyTable } from "./company.table";

export const CompanyPaymentTable = sqliteTable(
  "company_payments",
  {
    id: db_id,
    companyId: text("company_id").notNull(),
    purchaseId: text("purchase_id"),
    amount: db_money("amount").notNull(),
    note: text("note"),
    createdBy: text("created_by"),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "companyPayment_company_fkey",
      columns: [table.companyId],
      foreignColumns: [CompanyTable.id],
    }).onDelete("restrict"),
    foreignKey({
      name: "companyPayment_purchase_fkey",
      columns: [table.purchaseId],
      foreignColumns: [PurchaseTable.id],
    }).onDelete("set null"),
    foreignKey({
      name: "companyPayment_createdBy_fkey",
      columns: [table.createdBy],
      foreignColumns: [UserTable.id],
    }).onDelete("set null"),
    check("companyPayment_amount_chk", sql`${table.amount} > 0`),
    index("companyPayment_companyId_idx").on(table.companyId),
    index("companyPayment_createdAt_idx").on(table.createdAt),
    index("companyPayment_createdBy_idx").on(table.createdBy),
  ]
);

export const CompanyPaymentRelations = relations(
  CompanyPaymentTable,
  ({ one }) => ({
    company: one(CompanyTable, {
      fields: [CompanyPaymentTable.companyId],
      references: [CompanyTable.id],
      relationName: "companyPaymentToCompany",
    }),
    createdByUser: one(UserTable, {
      fields: [CompanyPaymentTable.createdBy],
      references: [UserTable.id],
      relationName: "companyPaymentToCreatedBy",
    }),
    purchase: one(PurchaseTable, {
      fields: [CompanyPaymentTable.purchaseId],
      references: [PurchaseTable.id],
      relationName: "companyPaymentToPurchase",
    }),
  })
);

export const insertCompanyPaymentSchema = createInsertSchema(
  CompanyPaymentTable,
  {
    companyId: z.uuid(),
    purchaseId: z.uuid().nullish(),
    createdBy: z.uuid().nullish(),
    amount: z.number().int().positive(),
  }
);
export const selectCompanyPaymentSchema = createSelectSchema(
  CompanyPaymentTable,
  {
    id: z.uuid(),
    companyId: z.uuid(),
    purchaseId: z.uuid().nullable(),
    createdBy: z.uuid().nullable(),
  }
);
export const updateCompanyPaymentSchema = createUpdateSchema(
  CompanyPaymentTable,
  {
    id: z.uuid().optional(),
    companyId: z.uuid().optional(),
    purchaseId: z.uuid().nullish(),
    createdBy: z.uuid().nullish(),
  }
);

export type CompanyPaymentDataModel = typeof CompanyPaymentTable.$inferSelect;
export type InsertCompanyPayment = z.infer<typeof insertCompanyPaymentSchema>;
export type SelectCompanyPayment = z.infer<typeof selectCompanyPaymentSchema>;
export type UpdateCompanyPayment = z.infer<typeof updateCompanyPaymentSchema>;
