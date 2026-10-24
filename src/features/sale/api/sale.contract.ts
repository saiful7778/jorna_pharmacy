import z from "zod";

import { selectCustomerSchema, selectSaleSchema } from "@/db/schemas";
import { apiOutputSchema } from "@/lib/zod-schemas/apiOutputSchema";
import { paginateInputSchema } from "@/lib/zod-schemas/paginateInputSchema";
import { paginateOutputSchema } from "@/lib/zod-schemas/paginateOutputSchema";
import { baseContract } from "@/oRPC/orpc.contract-base";
import type { InferContractRouterType } from "@/types/orpc.types";

const tags = ["Sale"] as const;

const listSaleInputSchema = z.object({
  invoiceNo: z.string(),
  customerName: z.string(),
  customerPhone: z.string(),
  createdAt: z.date(),
});

const listSaleContract = baseContract
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

export const saleContract = {
  list: listSaleContract,
};
