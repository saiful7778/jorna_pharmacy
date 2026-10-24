import { relations } from "drizzle-orm";
import {
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

import {
  db_bool,
  db_created_at,
  db_id,
  db_updated_at,
} from "@/db/utils/db-utils";

import { MedicineTypeEnum } from "../../enums/db-enums";
import { CompanyTable } from "../company";
import { PurchaseItemTable } from "../purchase";

export const MedicineTable = sqliteTable(
  "medicines",
  {
    id: db_id,
    name: text("name").notNull(),
    genericName: text("generic_name"),
    strength: text("strength"),
    companyId: text("company_id"),
    type: MedicineTypeEnum("type").notNull(),
    baseUnit: text("base_unit").notNull(),
    rackLocation: text("rack_location"),
    minimumStock: integer("minimum_stock").notNull().default(0),
    isActive: db_bool("is_active").notNull().default(true),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "medicine_company_fkey",
      columns: [table.companyId],
      foreignColumns: [CompanyTable.id],
    }).onDelete("set null"),
    index("medicine_name_idx").on(table.name),
    index("medicine_companyId_idx").on(table.companyId),
  ]
);

export const MedicineRelations = relations(MedicineTable, ({ one, many }) => ({
  company: one(CompanyTable, {
    fields: [MedicineTable.companyId],
    references: [CompanyTable.id],
    relationName: "MedicineToCompany",
  }),
  batches: many(PurchaseItemTable, { relationName: "PurchaseItemToMedicine" }),
}));

export const insertMedicineSchema = createInsertSchema(MedicineTable, {
  companyId: z.uuid().nullish(),
});
export const selectMedicineSchema = createSelectSchema(MedicineTable, {
  id: z.uuid(),
  companyId: z.uuid().nullable(),
});
export const updateMedicineSchema = createUpdateSchema(MedicineTable, {
  id: z.uuid().optional(),
  companyId: z.uuid().nullish(),
});

export type MedicineDataModel = typeof MedicineTable.$inferSelect;
export type InsertMedicine = z.infer<typeof insertMedicineSchema>;
export type SelectMedicine = z.infer<typeof selectMedicineSchema>;
export type UpdateMedicine = z.infer<typeof updateMedicineSchema>;
