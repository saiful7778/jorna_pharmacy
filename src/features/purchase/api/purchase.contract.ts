import z from "zod";

import { API_MESSAGES } from "@/constants/apiMessage";
import {
  selectCompanySchema,
  selectMedicineSchema,
  selectPurchaseItemSchema,
  selectPurchaseSchema,
} from "@/db/schemas";
import { apiOutputSchema } from "@/lib/zod-schemas/apiOutputSchema";
import { paginateInputSchema } from "@/lib/zod-schemas/paginateInputSchema";
import { paginateOutputSchema } from "@/lib/zod-schemas/paginateOutputSchema";
import { baseContract } from "@/oRPC/orpc.contract-base";
import type { InferContractRouterType } from "@/types/orpc.types";

import { purchaseCreateSchema } from "../purchase.schema";
import { purchaseDeleteContract } from "./purchaseDelete.contract";

const purchaseBaseContract = baseContract.errors({
  NOT_FOUND: { status: 404, message: API_MESSAGES.PURCHASE.NOT_FOUND },
});

const tags = ["Company", "Purchases"] as const;

const listPurchaseContract = purchaseBaseContract
  .route({
    method: "POST",
    path: "/companies/purchases/list",
    description: "List of company purchases",
    tags,
  })
  .input(
    paginateInputSchema({
      searchFields: ["companyInvoiceNo"],
      orderFields: [],
      filter: z.object({
        createdAt: z
          .object({
            from: z.coerce.date().describe("Created at from date").optional(),
            to: z.coerce.date().describe("Created at to date").optional(),
          })
          .optional(),
      }),
    }).extend({
      companyId: z.uuid().optional(),
      unpaidOnly: z.boolean().optional(),
    })
  )
  .output(
    apiOutputSchema(
      paginateOutputSchema(
        selectPurchaseSchema
          .pick({
            id: true,
            companyInvoiceNo: true,
            note: true,
            subtotal: true,
            discount: true,
            totalAmount: true,
            paidAmount: true,
            createdAt: true,
            updatedAt: true,
          })
          .extend({
            company: selectCompanySchema,
            dueAmount: z
              .number()
              .describe("Total amount minus paid, never negative"),
          })
      )
    )
  );
export type ListPurchaseContractType = InferContractRouterType<
  typeof listPurchaseContract
>;

const purchaseStatsContract = purchaseBaseContract
  .route({
    method: "GET",
    path: "/companies/purchases/stats",
    description: "Get company purchase stats",
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
        totalPurchases: z.number(),
        dueAmount: z.number(),
        purchaseCount: z.number(),
      })
    )
  );
export type PurchaseStatsContractType = InferContractRouterType<
  typeof purchaseStatsContract
>;

const purchaseCreateContract = purchaseBaseContract
  .route({
    method: "POST",
    path: "/companies/purchases/create",
    description: "Create new purchase",
    tags,
  })
  .input(purchaseCreateSchema)
  .output(apiOutputSchema(selectPurchaseSchema));
export type PurchaseCreateContractType = InferContractRouterType<
  typeof purchaseCreateContract
>;

const purchaseDetailsContract = purchaseBaseContract
  .route({
    method: "GET",
    path: "/companies/purchases/details",
    description: "Get purchase details with company and items",
    tags,
  })
  .input(z.object({ purchaseId: z.uuid() }))
  .output(
    apiOutputSchema(
      selectPurchaseSchema.extend({
        company: selectCompanySchema,
        items: z.array(
          selectPurchaseItemSchema.extend({
            medicine: selectMedicineSchema.pick({
              id: true,
              name: true,
              genericName: true,
              strength: true,
              type: true,
              baseUnit: true,
            }),
          })
        ),
      })
    )
  );
export type PurchaseDetailsContractType = InferContractRouterType<
  typeof purchaseDetailsContract
>;

export const purchaseContract = {
  list: listPurchaseContract,
  stats: purchaseStatsContract,
  create: purchaseCreateContract,
  details: purchaseDetailsContract,
  ...purchaseDeleteContract,
};
