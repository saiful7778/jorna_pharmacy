import z from "zod";

import { emptyStrSchema } from "@/lib/zod-schemas/baseZodSchema";

export const companyCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Company name is required")
    .max(100, "Name is too long"),
  phone: emptyStrSchema.optional(),
  address: emptyStrSchema.optional(),
  note: emptyStrSchema.optional(),
});
export type CompanyCreateType = z.infer<typeof companyCreateSchema>;
export type CompanyCreateInputType = z.input<typeof companyCreateSchema>;

export const companyUpdateSchema = companyCreateSchema.partial().extend({
  companyId: z.uuid(),
  isActive: z.boolean().optional(),
});

export type CompanyUpdateType = z.infer<typeof companyUpdateSchema>;
export type CompanyUpdateInputType = z.input<typeof companyUpdateSchema>;

export const companyPaymentCreateSchema = z.object({
  companyId: z.uuid("Company is required"),
  purchaseId: z.uuid().optional(),
  amount: z.coerce
    .number()
    .min(1, "Payment amount is required")
    .positive("Payment amount must be greater than 0"),
  note: emptyStrSchema.optional(),
});
export type CompanyPaymentCreateType = z.infer<
  typeof companyPaymentCreateSchema
>;
export type CompanyPaymentCreateInputType = z.input<
  typeof companyPaymentCreateSchema
>;
