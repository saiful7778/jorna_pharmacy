import z from "zod";

export const BULK_ID_LIMIT = 50;

export const bulkIdsSchema = z.array(z.uuid()).min(1).max(BULK_ID_LIMIT);
