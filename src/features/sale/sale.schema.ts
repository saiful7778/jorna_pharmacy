import z from "zod";

import { emptyStrSchema } from "@/lib/zod-schemas/baseZodSchema";

export const saleMedicineFormItem = z.object({
  medicineId: z.uuid(),
  medicineName: z.string(),
  price: z.number(),
  quantity: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce.number().check(z.int(), z.positive())
  ),
});

export const saleCreateFormSchema = z
  .object({
    isNewCustomer: z.boolean().default(false),
    customerId: z.uuid().optional(),
    customerName: z
      .string()
      .min(1, "Customer name is required")
      .max(100, "Customer name is too long"),
    customerPhone: emptyStrSchema.optional(),
    customerAddress: emptyStrSchema.optional(),
    items: z.array(saleMedicineFormItem),
    discountAmount: z.preprocess(
      (v) => (v === "" || v === null || v === undefined ? undefined : v),
      z.coerce.number().check(z.int(), z.nonnegative()).optional()
    ),
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
    if (!data.isNewCustomer && !data.customerId) {
      ctx.addIssue({
        code: "custom",
        path: ["customerName"],
        message: "Please select an existing customer",
      });
    }

    const discountAmount = data.discountAmount;
    const totalAmount = data.totalAmount;
    const paidAmount = data.paidAmount;

    if (discountAmount && discountAmount > totalAmount) {
      ctx.addIssue({
        code: "custom",
        path: ["discountAmount"],
        message: "Discount cannot exceed total amount",
      });
    }

    if (discountAmount && paidAmount > totalAmount - discountAmount) {
      ctx.addIssue({
        code: "custom",
        path: ["paidAmount"],
        message: "Paid amount cannot exceed the payable amount",
      });
    }
  });

export type SaleCreateFormType = z.infer<typeof saleCreateFormSchema>;
export type SaleCreateFormInputType = z.input<typeof saleCreateFormSchema>;

export const saleMedicineItem = z.object({
  medicineId: z.uuid(),
  quantity: z.number().check(z.int(), z.positive()),
});

export const saleCreateSchema = z
  .object({
    customerId: z.uuid().optional(),
    customerName: z
      .string()
      .min(1, "Customer name is required")
      .max(100, "Customer name is too long"),
    customerPhone: z.string().optional(),
    customerAddress: z.string().optional(),
    items: z.array(saleMedicineItem),
    totalAmount: z.number().check(z.int(), z.positive()),
    discountAmount: z.number().check(z.int(), z.nonnegative()).optional(),
    paidAmount: z.number().check(z.int(), z.nonnegative()).optional(),
  })
  .superRefine((data, ctx) => {
    const discountAmount = data.discountAmount;
    const totalAmount = data.totalAmount;
    const paidAmount = data.paidAmount;

    if (discountAmount && discountAmount > totalAmount) {
      ctx.addIssue({
        code: "custom",
        path: ["discountAmount"],
        message: "Discount cannot exceed total amount",
      });
    }

    if (
      discountAmount &&
      paidAmount &&
      paidAmount > totalAmount - discountAmount
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["paidAmount"],
        message: "Paid amount cannot exceed the payable amount",
      });
    }
  });

export type SaleCreateType = z.infer<typeof saleCreateSchema>;
export type SaleCreateInputType = z.input<typeof saleCreateSchema>;
