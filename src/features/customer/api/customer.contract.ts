import z from "zod";

import { API_MESSAGES } from "@/constants/apiMessage";
import { selectCustomerSchema } from "@/db/schemas";
import { apiOutputSchema } from "@/lib/zod-schemas/apiOutputSchema";
import { paginateInputSchema } from "@/lib/zod-schemas/paginateInputSchema";
import { paginateOutputSchema } from "@/lib/zod-schemas/paginateOutputSchema";
import { baseContract } from "@/oRPC/orpc.contract-base";
import type { InferContractRouterType } from "@/types/orpc.types";

import { customerCreateSchema, customerUpdateSchema } from "../customer.schema";
import { customerPaymentContract } from "./customerPayment.contract";

const customerBaseContract = baseContract.errors({
  NOT_FOUND: {
    status: 404,
    success: false,
    message: API_MESSAGES.CUSTOMER.NOT_FOUND,
  },
});

const tags = ["Customer"] as const;

const listCustomerContract = baseContract
  .route({
    method: "GET",
    path: "/customers/list",
    description:
      "List of customers with their outstanding due and last purchase",
    tags,
  })
  .input(
    paginateInputSchema<typeof selectCustomerSchema>({
      searchFields: ["name", "phone", "address"],
      orderFields: [],
    })
  )
  .output(
    apiOutputSchema(
      paginateOutputSchema(
        selectCustomerSchema.extend({
          dueAmount: z.number(),
          lastPurchaseAt: z.date().nullable(),
        })
      )
    )
  );
export type ListCustomerContractType = InferContractRouterType<
  typeof listCustomerContract
>;

const listCustomerForSearchContract = baseContract
  .route({
    method: "GET",
    path: "/customers/search",
    description: "List active customers for search",
    tags,
  })
  .input(
    paginateInputSchema<typeof selectCustomerSchema>({
      searchFields: ["name", "phone", "address"],
      orderFields: [],
    })
  )
  .output(
    apiOutputSchema(
      z.array(
        selectCustomerSchema.pick({
          id: true,
          name: true,
          phone: true,
          address: true,
        })
      )
    )
  );
export type ListCustomerForSearchContractType = InferContractRouterType<
  typeof listCustomerForSearchContract
>;

const createCustomerContract = baseContract
  .route({
    path: "/customers/create",
    description: "Create customer",
    tags,
  })
  .input(customerCreateSchema)
  .output(apiOutputSchema(selectCustomerSchema));
export type CreateCustomerContractType = InferContractRouterType<
  typeof createCustomerContract
>;

const updateCustomerContract = customerBaseContract
  .route({
    path: "/customers/update",
    description: "Update customer",
    tags,
  })
  .input(customerUpdateSchema)
  .output(apiOutputSchema(selectCustomerSchema));
export type UpdateCustomerContractType = InferContractRouterType<
  typeof updateCustomerContract
>;

const customerDetailsContract = customerBaseContract
  .route({
    method: "GET",
    path: "/customers/details",
    description: "Get customer details with purchase and payment summary",
    tags,
  })
  .input(
    z.object({
      customerId: z.uuid(),
      createdAt: z
        .object({
          from: z.coerce.date().describe("Created at from date").optional(),
          to: z.coerce.date().describe("Created at to date").optional(),
        })
        .optional(),
    })
  )
  .output(
    apiOutputSchema(
      selectCustomerSchema.extend({
        summary: z.object({
          totalPaid: z.number(),
          dueAmount: z.number(),
          saleCount: z.number(),
          paymentCount: z.number(),
          totalSales: z.number(),
          lastPurchaseAt: z.date().optional(),
        }),
      })
    )
  );
export type CustomerDetailsContractType = InferContractRouterType<
  typeof customerDetailsContract
>;

export const customerContract = {
  list: listCustomerContract,
  listForSearch: listCustomerForSearchContract,
  create: createCustomerContract,
  update: updateCustomerContract,
  details: customerDetailsContract,
  payment: customerPaymentContract,
};
