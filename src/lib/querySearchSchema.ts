import { endOfMonth, startOfMonth } from "date-fns";
import { z } from "zod";

import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from "@/constants";

import { RangeSearchEnumSchema } from "./zod-schemas/baseZodSchema";

export const querySearchSchema = z.object({
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE_INDEX),
  limit: z.coerce.number().int().min(1).default(DEFAULT_PAGE_SIZE),
  search: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional(),
  orderField: z.string().optional(),
});

export const rangeFilterSchema = z.object({
  range: RangeSearchEnumSchema.optional().default("THIS_MONTH"),
  startTime: z.iso
    .datetime()
    .optional()
    .default(() => startOfMonth(new Date()).toISOString()),
  endTime: z.iso
    .datetime()
    .optional()
    .default(() => endOfMonth(new Date()).toISOString()),
});
