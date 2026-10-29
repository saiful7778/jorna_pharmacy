import z from "zod";

import { API_MESSAGES } from "@/constants/apiMessage";
import { selectCustomerPaymentSchema } from "@/db/schemas";
import { apiOutputSchema } from "@/lib/zod-schemas/apiOutputSchema";
import { paginateInputSchema } from "@/lib/zod-schemas/paginateInputSchema";
import { paginateOutputSchema } from "@/lib/zod-schemas/paginateOutputSchema";
import { baseContract } from "@/oRPC/orpc.contract-base";
import type { InferContractRouterType } from "@/types/orpc.types";

import { customerPaymentCreateSchema } from "../customer.schema";

const customerPaymentBaseContract = baseContract.errors({
  CUSTOMER_NOT_FOUND: {
    status: 404,
    success: false,
    message: API_MESSAGES.CUSTOMER.NOT_FOUND,
  },
  SALE_NOT_FOUND: {
    status: 404,
    success: false,
    message: API_MESSAGES.SALE.NOT_FOUND,
  },
  PAYMENT_EXCEEDS: {
    status: 400,
    success: false,
    message: API_MESSAGES.CUSTOMER.PAYMENT.EXCEEDS_BALANCE,
  },
});

const tags = ["Customer"] as const;

const listCustomerPaymentsContract = customerPaymentBaseContract
  .route({
    method: "GET",
    path: "/customers/payments/list",
    description: "List payments received from a customer",
    tags,
  })
  .input(
    paginateInputSchema({
      searchFields: ["invoiceNo"],
      orderFields: [],
      filter: z.object({
        customerId: z.uuid().optional(),
      }),
    })
  )
  .output(
    apiOutputSchema(
      paginateOutputSchema(
        selectCustomerPaymentSchema
          .pick({
            id: true,
            saleId: true,
            amount: true,
            note: true,
            createdAt: true,
          })
          .extend({
            invoiceNo: z.string().nullable(),
            saleTotalAmount: z.number().nullable(),
            saleCreatedAt: z.date().nullable(),
          })
      )
    )
  );
export type ListCustomerPaymentsContractType = InferContractRouterType<
  typeof listCustomerPaymentsContract
>;

const createCustomerPaymentContract = customerPaymentBaseContract
  .route({
    path: "/customers/payments/create",
    description: "Record a payment received from a customer",
    tags,
  })
  .input(customerPaymentCreateSchema)
  .output(apiOutputSchema(z.null()));
export type CreateCustomerPaymentContractType = InferContractRouterType<
  typeof createCustomerPaymentContract
>;

const customerPaymentStatsContract = customerPaymentBaseContract
  .route({
    method: "GET",
    path: "/customers/payments/stats",
    description: "Get customer payment stats",
    tags,
  })
  .input(
    z.object({
      filter: z
        .object({
          customerId: z.uuid().optional(),
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
        totalPaid: z.number(),
        dueAmount: z.number(),
        saleCount: z.number(),
        paymentCount: z.number(),
        totalSales: z.number(),
        lastPurchaseAt: z.date().optional(),
      })
    )
  );
export type CustomerPaymentStatsContractType = InferContractRouterType<
  typeof customerPaymentStatsContract
>;

export const customerPaymentContract = {
  list: listCustomerPaymentsContract,
  create: createCustomerPaymentContract,
  stats: customerPaymentStatsContract,
};
