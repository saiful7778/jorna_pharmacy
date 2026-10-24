import z from "zod";

import { fieldValidatorSchema } from "./fieldValidatorSchema";

export type ExtractObjectKeys<T> =
  T extends z.ZodObject<infer Shape> ? Extract<keyof Shape, string> : never;

export function paginateInputSchema<TModel extends z.ZodObject<z.ZodRawShape>>({
  orderFields,
  filter,
  searchFields,
}: {
  filter?: z.ZodObject<z.ZodRawShape>;
  orderFields?: ReadonlyArray<ExtractObjectKeys<TModel>>;
  searchFields?: ReadonlyArray<ExtractObjectKeys<TModel>>;
}): z.ZodObject<{
  page: z.ZodOptional<z.ZodNullable<z.ZodDefault<z.ZodNumber>>>;
  limit: z.ZodOptional<z.ZodNullable<z.ZodDefault<z.ZodNumber>>>;
  order: z.ZodOptional<z.ZodNullable<z.ZodEnum<{ asc: "asc"; desc: "desc" }>>>;
  orderField: z.ZodOptional<
    z.ZodNullable<
      z.ZodEnum<{
        [K in string]: string;
      }>
    >
  >;
  search: z.ZodOptional<z.ZodNullable<z.ZodString>>;
  searchFields: ReturnType<typeof fieldValidatorSchema>;
  filter:
    | z.ZodOptional<z.ZodObject<z.ZodRawShape>>
    | z.ZodOptional<z.ZodNullable<z.ZodObject<z.ZodRawShape>>>;
}> {
  const base = z.object({
    page: z.number().int().min(1).default(1).nullish(),
    limit: z.number().int().min(1).default(20).nullish(),
    order: z
      .enum(["asc", "desc"] as const)
      .nullable()
      .optional(),
    orderField: z
      .enum(orderFields as unknown as [string, ...string[]])
      .nullable()
      .optional(),
    search: z.string().trim().toLowerCase().nullish(),
    searchFields: fieldValidatorSchema("searchFields", searchFields),
    filter: filter ? filter.optional() : z.object({}).nullish(),
  });

  return base;
}
