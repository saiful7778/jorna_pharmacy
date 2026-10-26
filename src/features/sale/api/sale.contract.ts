import z from "zod";

import { API_MESSAGES } from "@/constants/apiMessage";
import { selectCustomerSchema, selectSaleSchema } from "@/db/schemas";
import { apiOutputSchema } from "@/lib/zod-schemas/apiOutputSchema";
import { paginateInputSchema } from "@/lib/zod-schemas/paginateInputSchema";
import { paginateOutputSchema } from "@/lib/zod-schemas/paginateOutputSchema";
import { baseContract } from "@/oRPC/orpc.contract-base";
import type { InferContractRouterType } from "@/types/orpc.types";

import { saleCreateSchema } from "../sale.schema";

const saleBaseContract = baseContract.errors({
  NOT_FOUND: { status: 404, message: API_MESSAGES.SALE.NOT_FOUND },
});

const tags = ["Sale"] as const;

const listSaleInputSchema = z.object({
  invoiceNo: z.string(),
  customerName: z.string(),
  customerPhone: z.string(),
  createdAt: z.date(),
});

const listSaleContract = saleBaseContract
  .route({
    method: "GET",
    path: "/sales/list",
    description:
      "List sales with their customer, item count, totals, and outstanding due",
    tags,
  })
  .input(
    paginateInputSchema<typeof listSaleInputSchema>({
      searchFields: ["invoiceNo", "customerPhone", "customerName"],
      orderFields: ["createdAt"],
      filter: z.object({
        from: z.coerce.date().describe("Created at from date").optional(),
        to: z.coerce.date().describe("Created at to date").optional(),
      }),
    }).extend({
      customerId: z.uuid().optional(),
      unpaidOnly: z.boolean().optional(),
    })
  )
  .output(
    apiOutputSchema(
      paginateOutputSchema(
        selectSaleSchema
          .pick({
            id: true,
            subtotal: true,
            discount: true,
            totalAmount: true,
            paidAmount: true,
            createdAt: true,
          })
          .extend({
            invoiceNo: z.string(),
            itemCount: z.number(),
            customer: selectCustomerSchema
              .pick({
                id: true,
                name: true,
                phone: true,
              })
              .nullable(),
          })
      )
    )
  );
export type ListSaleContractType = InferContractRouterType<
  typeof listSaleContract
>;

const saleStatsContract = saleBaseContract
  .route({
    method: "GET",
    path: "/sales/stats",
    description: "Get sale totals, revenue, collected amount, and due",
    tags,
  })
  .input(
    z.object({
      filter: z
        .object({
          createdAt: z
            .object({
              from: z.coerce.date().describe("Created at from date").optional(),
              to: z.coerce.date().describe("Created at to date").optional(),
            })
            .optional(),
        })
        .optional(),
    })
  )
  .output(
    apiOutputSchema(
      z.object({
        saleCount: z.number(),
        totalRevenue: z.number(),
        totalPaid: z.number(),
        dueAmount: z.number(),
      })
    )
  );
export type SaleStatsContractType = InferContractRouterType<
  typeof saleStatsContract
>;

const saleCreateContract = saleBaseContract
  .route({
    method: "POST",
    path: "/sales/create",
    description: "Create new sale",
    tags,
  })
  .input(saleCreateSchema)
  .output(apiOutputSchema(selectSaleSchema));
export type SaleCreateContractType = InferContractRouterType<
  typeof saleCreateContract
>;

export const saleContract = {
  list: listSaleContract,
  stats: saleStatsContract,
  create: saleCreateContract,
};
