import z from "zod";

const requiredAmountSchema = (label: string) =>
  z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce
      .number({ error: `${label} is required` })
      .nonnegative(`${label} cannot be negative`)
  );

export const saleClosingCreateSchema = z.object({
  totalSales: requiredAmountSchema("Total sales"),
  totalSalary: requiredAmountSchema("Total salary"),
});

export type SaleClosingCreateType = z.infer<typeof saleClosingCreateSchema>;
export type SaleClosingCreateInputType = z.input<
  typeof saleClosingCreateSchema
>;
