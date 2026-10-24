import z from "zod";

import { emptyStrSchema } from "@/lib/zod-schemas/baseZodSchema";

export const customerCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Customer name is required")
    .max(100, "Name is too long"),
  phone: emptyStrSchema.optional(),
  address: emptyStrSchema.optional(),
  note: emptyStrSchema.optional(),
});
export type CustomerCreateType = z.infer<typeof customerCreateSchema>;
export type CustomerCreateInputType = z.input<typeof customerCreateSchema>;

export const customerUpdateSchema = customerCreateSchema.partial().extend({
  customerId: z.uuid(),
  isActive: z.boolean().optional(),
});

export type CustomerUpdateType = z.infer<typeof customerUpdateSchema>;
export type CustomerUpdateInputType = z.input<typeof customerUpdateSchema>;

export const customerPaymentCreateSchema = z.object({
  customerId: z.uuid("Customer is required"),
  saleId: z.uuid().optional(),
  amount: z
    .string()
    .min(1, "Payment amount is required")
    .refine(
      (value) => Number(value) > 0,
      "Payment amount must be greater than 0"
    )
    .transform((value) => Number(value)),
  note: emptyStrSchema.optional(),
});
export type CustomerPaymentCreateType = z.infer<
  typeof customerPaymentCreateSchema
>;
export type CustomerPaymentCreateInputType = z.input<
  typeof customerPaymentCreateSchema
>;
