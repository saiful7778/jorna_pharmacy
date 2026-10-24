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

import { MedicineTable } from "../medicine/medicine.table";
import { PurchaseReturnTable, PurchaseTable } from "../purchase";
import { CompanyPaymentTable } from "./companyPayment.table";

export const CompanyTable = sqliteTable(
  "companies",
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
  (table) => [index("company_name_idx").on(table.name)]
);

export const CompanyRelations = relations(CompanyTable, ({ many }) => ({
  medicines: many(MedicineTable, { relationName: "MedicineToCompany" }),
  purchases: many(PurchaseTable, { relationName: "PurchaseToCompany" }),
  payments: many(CompanyPaymentTable, {
    relationName: "companyPaymentToCompany",
  }),
  returns: many(PurchaseReturnTable, {
    relationName: "PurchaseReturnToCompany",
  }),
}));

export const insertCompanySchema = createInsertSchema(CompanyTable);
export const selectCompanySchema = createSelectSchema(CompanyTable, {
  id: z.uuid(),
});
export const updateCompanySchema = createUpdateSchema(CompanyTable, {
  id: z.uuid().optional(),
});

export type CompanyDataModel = typeof CompanyTable.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type SelectCompany = z.infer<typeof selectCompanySchema>;
export type UpdateCompany = z.infer<typeof updateCompanySchema>;
