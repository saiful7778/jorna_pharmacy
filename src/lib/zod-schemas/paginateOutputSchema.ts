import z from "zod";

export function paginateOutputSchema<T extends z.ZodObject<z.ZodRawShape>>(
  zodSchema: T
): z.ZodObject<
  {
    meta: z.ZodObject<{
      isFirstPage: z.ZodBoolean;
      isLastPage: z.ZodBoolean;
      currentPage: z.ZodNumber;
      previousPage: z.ZodNullable<z.ZodNumber>;
      nextPage: z.ZodNullable<z.ZodNumber>;
      pageCount: z.ZodNumber;
      totalCount: z.ZodNumber;
      queryCount: z.ZodNumber;
    }>;
    data: z.ZodArray<T>;
  },
  z.core.$strip
> {
  return z.object({
    meta: z.object({
      isFirstPage: z.boolean(),
      isLastPage: z.boolean(),
      currentPage: z.number(),
      previousPage: z.number().nullable(),
      nextPage: z.number().nullable(),
      pageCount: z.number(),
      totalCount: z.number(),
      queryCount: z.number(),
    }),
    data: z.array(zodSchema),
  });
}
