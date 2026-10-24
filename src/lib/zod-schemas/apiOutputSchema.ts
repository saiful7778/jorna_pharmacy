import z from "zod";

export function apiOutputSchema<
  T extends z.ZodObject<z.ZodRawShape> | z.ZodNull | z.ZodArray | z.ZodRecord,
>(
  schema: T
): z.ZodObject<{
  message: z.ZodString;
  success: z.ZodBoolean;
  data: T;
}> {
  return z.object({
    message: z.string(),
    success: z.boolean(),
    data: schema,
  });
}
