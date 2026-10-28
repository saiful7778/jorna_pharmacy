import z from "zod";

import { MedicineTypeEnumSchema } from "@/db/schemas/enums/zod-db-enums";
import { emptyStrSchema } from "@/lib/zod-schemas/baseZodSchema";

export const purchaseMedicineFormItem = z
  .object({
    isNew: z.boolean(),
    medicineId: z.uuid().optional(),
    medicineName: z.string(),
    medicineType: MedicineTypeEnumSchema.optional(),
    genericName: emptyStrSchema.optional(),
    strength: emptyStrSchema.optional(),
    baseUnit: z.string().optional(),
    qtyPurchased: z.coerce.number().check(z.int(), z.positive()),
    costPerUnit: z.coerce.number().check(z.float32(), z.positive()),
    sellPerUnit: z.coerce.number().check(z.float32(), z.positive()),
    expiryDate: z.date().optional(),
  })
  .refine(
    (v) => (v.isNew ? v.medicineId === undefined : v.medicineId !== undefined),
    {
      message:
        "Existing medicines need a medicineId; new ones must not have one",
      path: ["medicineName"],
    }
  )
  .refine((v) => !v.isNew || (v.medicineType !== undefined && !!v.baseUnit), {
    message: "Medicine type and base unit are required for new medicines",
    path: ["baseUnit"],
  });

export const purchaseCreateFormSchema = z
  .object({
    isNewCompany: z.boolean().default(false),
    companyId: z.uuid().optional(),
    companyName: emptyStrSchema.optional(),
    companyPhone: emptyStrSchema.optional(),
    companyAddress: emptyStrSchema.optional(),
    items: z.array(purchaseMedicineFormItem),
    totalAmount: z.preprocess(
      (v) => (v === "" || v === null || v === undefined ? undefined : v),
      z.coerce.number().check(z.int(), z.nonnegative())
    ),
    paidAmount: z.preprocess(
      (v) => (v === "" || v === null || v === undefined ? undefined : v),
      z.coerce.number().check(z.int(), z.nonnegative())
    ),
  })
  .superRefine((data, ctx) => {
    const totalAmount = data.totalAmount;
    const paidAmount = data.paidAmount;

    if (paidAmount > totalAmount) {
      ctx.addIssue({
        code: "custom",
        path: ["paidAmount"],
        message: "Paid amount cannot exceed the payable amount",
      });
    }
  });

export type PurchaseCreateFormType = z.infer<typeof purchaseCreateFormSchema>;
export type PurchaseCreateFormInputType = z.input<
  typeof purchaseCreateFormSchema
>;

export const purchaseMedicineItem = z
  .object({
    isNew: z.boolean(),
    medicineId: z.uuid().optional(),
    medicineName: z.string(),
    medicineType: MedicineTypeEnumSchema.optional(),
    genericName: z.string().optional(),
    strength: z.string().optional(),
    baseUnit: z.string().optional(),
    qtyPurchased: z.number().check(z.int(), z.positive()),
    costPerUnit: z.number().check(z.float32(), z.positive()),
    sellPerUnit: z.number().check(z.float32(), z.positive()),
    expiryDate: z.date().optional(),
  })
  .refine(
    (v) => (v.isNew ? v.medicineId === undefined : v.medicineId !== undefined),
    {
      message:
        "Existing medicines need a medicineId; new ones must not have one",
      path: ["medicineName"],
    }
  );

export const purchaseCreateSchema = z
  .object({
    companyId: z.uuid().optional(),
    companyName: z.string().max(100, "Company name is too long").optional(),
    companyPhone: z.string().optional(),
    companyAddress: z.string().optional(),
    items: z.array(purchaseMedicineItem),
    totalAmount: z.number().check(z.int(), z.positive()),
    paidAmount: z
      .number()
      .check(z.int(), z.nonnegative())
      .optional()
      .default(0),
  })
  .superRefine((data, ctx) => {
    const totalAmount = data.totalAmount;
    const paidAmount = data.paidAmount;

    if (paidAmount > totalAmount) {
      ctx.addIssue({
        code: "custom",
        path: ["paidAmount"],
        message: "Paid amount cannot exceed the payable amount",
      });
    }
  });

export type PurchaseCreateType = z.infer<typeof purchaseCreateSchema>;
export type PurchaseCreateInputType = z.input<typeof purchaseCreateSchema>;
