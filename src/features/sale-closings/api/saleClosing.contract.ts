import z from "zod";

import { API_MESSAGES } from "@/constants/apiMessage";
import { selectSaleClosingSchema } from "@/db/schemas";
import { userProfileSchema } from "@/features/user/user.api-schema";
import { apiOutputSchema } from "@/lib/zod-schemas/apiOutputSchema";
import { paginateInputSchema } from "@/lib/zod-schemas/paginateInputSchema";
import { paginateOutputSchema } from "@/lib/zod-schemas/paginateOutputSchema";
import { baseContract } from "@/oRPC/orpc.contract-base";
import type { InferContractRouterType } from "@/types/orpc.types";

import { saleClosingCreateSchema } from "../saleClosing.schema";

const saleClosingBaseContract = baseContract.errors({
  NOT_FOUND: { status: 404, message: API_MESSAGES.SALE_CLOSING.NOT_FOUND },
  ALREADY_CLOSED_TODAY: {
    status: 409,
    message: API_MESSAGES.SALE_CLOSING.ALREADY_CLOSED_TODAY,
  },
});

const tags = ["Finance", "Sale Closings"] as const;

const cashSummarySchema = z.object({
  expectedCash: z
    .number()
    .describe(
      "Opening cash + cash received - expenses - salary - company paid"
    ),
});

const listSaleClosingContract = saleClosingBaseContract
  .route({
    method: "POST",
    path: "/finance/sale-closings/list",
    description: "List of sale closings",
    tags,
  })
  .input(
    paginateInputSchema({
      searchFields: [],
      orderFields: ["totalSales"],
      filter: z.object({
        periodEnd: z
          .object({
            from: z.coerce.date().describe("Period end from date").optional(),
            to: z.coerce.date().describe("Period end to date").optional(),
          })
          .optional(),
      }),
    })
  )
  .output(
    apiOutputSchema(
      paginateOutputSchema(
        selectSaleClosingSchema
          .pick({
            id: true,
            periodStart: true,
            totalSalary: true,
            periodEnd: true,
            totalSales: true,
            cashReceived: true,
            countedCash: true,
            createdAt: true,
          })
          .extend({
            closedByUser: userProfileSchema.nullable(),
          })
          .extend(cashSummarySchema.shape)
      )
    )
  );
export type ListSaleClosingContractType = InferContractRouterType<
  typeof listSaleClosingContract
>;

const saleClosingStatsContract = saleClosingBaseContract
  .route({
    method: "GET",
    path: "/finance/sale-closings/stats",
    description: "Get sale closing stats for the selected period",
    tags,
  })
  .input(
    z.object({
      filter: z
        .object({
          periodEnd: z
            .object({
              from: z.coerce.date().describe("Period end from date").optional(),
              to: z.coerce.date().describe("Period end to date").optional(),
            })
            .optional(),
        })
        .optional(),
    })
  )
  .output(
    apiOutputSchema(
      z.object({
        closingCount: z.number(),
        uncountedCount: z.number(),
        totalSales: z.number(),
        cashReceived: z.number(),
        netVariance: z
          .number()
          .describe(
            "Sum of counted cash minus expected cash over counted closings"
          ),
      })
    )
  );
export type SaleClosingStatsContractType = InferContractRouterType<
  typeof saleClosingStatsContract
>;

const saleClosingDetailsContract = saleClosingBaseContract
  .route({
    method: "GET",
    path: "/finance/sale-closings/details",
    description: "Get sale closing details with cash reconciliation",
    tags,
  })
  .input(z.object({ saleClosingId: z.uuid() }))
  .output(
    apiOutputSchema(
      selectSaleClosingSchema
        .extend({
          closedByUser: userProfileSchema.nullable(),
        })
        .extend(cashSummarySchema.shape)
    )
  );
export type SaleClosingDetailsContractType = InferContractRouterType<
  typeof saleClosingDetailsContract
>;

const saleClosingCreateContract = saleClosingBaseContract
  .route({
    method: "POST",
    path: "/finance/sale-closings/create",
    description: "Create a sale closing for the current day",
    tags,
  })
  .input(saleClosingCreateSchema)
  .output(apiOutputSchema(selectSaleClosingSchema));
export type SaleClosingCreateContractType = InferContractRouterType<
  typeof saleClosingCreateContract
>;

export const saleClosingContract = {
  list: listSaleClosingContract,
  stats: saleClosingStatsContract,
  details: saleClosingDetailsContract,
  create: saleClosingCreateContract,
};
