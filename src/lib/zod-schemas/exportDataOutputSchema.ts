import z from "zod";

export function exportDataOutputSchema<
  TInput extends z.ZodObject<z.ZodRawShape>,
>(inputSchema: TInput) {
  return z.object({
    data: z.array(inputSchema).or(z.string()),
    filename: z.string(),
    contentType: z.string(),
  });
}
