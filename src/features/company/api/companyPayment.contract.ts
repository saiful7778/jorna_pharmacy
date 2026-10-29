import z from "zod";

import { API_MESSAGES } from "@/constants/apiMessage";
import { selectCompanyPaymentSchema } from "@/db/schemas";
import { apiOutputSchema } from "@/lib/zod-schemas/apiOutputSchema";
import { paginateInputSchema } from "@/lib/zod-schemas/paginateInputSchema";
import { paginateOutputSchema } from "@/lib/zod-schemas/paginateOutputSchema";
import { baseContract } from "@/oRPC/orpc.contract-base";
import type { InferContractRouterType } from "@/types/orpc.types";

import { companyPaymentCreateSchema } from "../company.schema";

const companyPaymentBaseContract = baseContract.errors({
  COMPANY_NOT_FOUND: {
    status: 404,
    success: false,
    message: API_MESSAGES.COMPANY.NOT_FOUND,
  },
  PURCHASE_NOT_FOUND: {
    status: 404,
    success: false,
    message: API_MESSAGES.PURCHASE.NOT_FOUND,
  },
  PAYMENT_EXCEEDS: {
    status: 400,
    success: false,
    message: API_MESSAGES.COMPANY.PAYMENT.EXCEEDS_BALANCE,
  },
});

const tags = ["Company"] as const;

const listCompanyPaymentsContract = companyPaymentBaseContract
  .route({
    method: "GET",
    path: "/companies/payments/list",
    description: "List payments received from a company",
    tags,
  })
  .input(
    paginateInputSchema<typeof selectCompanyPaymentSchema>({
      searchFields: [],
      orderFields: [],
      filter: z.object({
        companyId: z.uuid().optional(),
      }),
    })
  )
  .output(
    apiOutputSchema(
      paginateOutputSchema(
        selectCompanyPaymentSchema
          .pick({
            id: true,
            companyId: true,
            purchaseId: true,
            amount: true,
            note: true,
            createdAt: true,
          })
          .extend({
            purchase: z
              .object({
                companyInvoiceNo: z.string().nullable(),
                totalAmount: z.number(),
                paidAmount: z.number(),
                dueAmount: z.number(),
              })
              .nullable(),
          })
      )
    )
  );
export type ListCompanyPaymentsContractType = InferContractRouterType<
  typeof listCompanyPaymentsContract
>;

const createCompanyPaymentContract = companyPaymentBaseContract
  .route({
    path: "/companies/payments/create",
    description: "Record a payment received from a company",
    tags,
  })
  .input(companyPaymentCreateSchema)
  .output(apiOutputSchema(z.null()));
export type CreateCompanyPaymentContractType = InferContractRouterType<
  typeof createCompanyPaymentContract
>;

const companyPaymentStatsContract = companyPaymentBaseContract
  .route({
    method: "GET",
    path: "/companies/payments/stats",
    description: "Get company payment stats",
    tags,
  })
  .input(
    z.object({
      filter: z
        .object({
          companyId: z.uuid().optional(),
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
        purchaseCount: z.number(),
        paymentCount: z.number(),
        totalPurchases: z.number(),
        lastPurchaseAt: z.date().optional(),
      })
    )
  );
export type CompanyPaymentStatsContractType = InferContractRouterType<
  typeof companyPaymentStatsContract
>;

export const companyPaymentContract = {
  list: listCompanyPaymentsContract,
  create: createCompanyPaymentContract,
  stats: companyPaymentStatsContract,
};
