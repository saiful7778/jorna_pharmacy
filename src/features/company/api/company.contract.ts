import z from "zod";

import { API_MESSAGES } from "@/constants/apiMessage";
import { selectCompanySchema } from "@/db/schemas";
import { apiOutputSchema } from "@/lib/zod-schemas/apiOutputSchema";
import { paginateInputSchema } from "@/lib/zod-schemas/paginateInputSchema";
import { paginateOutputSchema } from "@/lib/zod-schemas/paginateOutputSchema";
import { baseContract } from "@/oRPC/orpc.contract-base";
import type { InferContractRouterType } from "@/types/orpc.types";

import { companyCreateSchema, companyUpdateSchema } from "../company.schema";
import { companyDeleteContract } from "./companyDelete.contract";
import { companyPaymentContract } from "./companyPayment.contract";
import { companyPurchaseContract } from "./companyPurchase.contract";

const companyBaseContract = baseContract.errors({
  NOT_FOUND: {
    status: 404,
    success: false,
    message: API_MESSAGES.COMPANY.NOT_FOUND,
  },
});

const tags = ["Company"] as const;

const listCompanyContract = companyBaseContract
  .route({
    method: "GET",
    path: "/companies/list",
    description: "List of companies",
    tags,
  })
  .input(
    paginateInputSchema<typeof selectCompanySchema>({
      searchFields: ["name", "phone", "address"],
      orderFields: [],
    })
  )
  .output(
    apiOutputSchema(
      paginateOutputSchema(
        selectCompanySchema.extend({
          lastPurchaseAt: z.date().nullable(),
          dueAmount: z.number(),
        })
      )
    )
  );
export type ListCompanyContractType = InferContractRouterType<
  typeof listCompanyContract
>;

const listCompanyForSearchContract = baseContract
  .route({
    method: "GET",
    path: "/companies/search",
    description: "List active companies for search",
    tags,
  })
  .input(
    paginateInputSchema<typeof selectCompanySchema>({
      searchFields: ["name", "phone", "address"],
      orderFields: [],
    })
  )
  .output(
    apiOutputSchema(
      z.array(
        selectCompanySchema.pick({
          id: true,
          name: true,
          phone: true,
          address: true,
        })
      )
    )
  );
export type ListCompanyForSearchContractType = InferContractRouterType<
  typeof listCompanyForSearchContract
>;

const companyCreateContract = companyBaseContract
  .route({
    method: "POST",
    path: "/companies/create",
    description: "Company create",
    tags,
  })
  .input(companyCreateSchema)
  .output(apiOutputSchema(selectCompanySchema));
export type CompanyCreateContractType = InferContractRouterType<
  typeof companyCreateContract
>;

const updateCompanyContract = companyBaseContract
  .route({
    path: "/companies/update",
    description: "Update company",
    tags,
  })
  .input(companyUpdateSchema)
  .output(apiOutputSchema(selectCompanySchema));
export type UpdateCompanyContractType = InferContractRouterType<
  typeof updateCompanyContract
>;

const companyDetailsContract = companyBaseContract
  .route({
    method: "GET",
    path: "/companies/details",
    description: "Get company details with purchase and payment summary",
    tags,
  })
  .input(
    z.object({
      companyId: z.uuid(),
    })
  )
  .output(
    apiOutputSchema(
      selectCompanySchema.extend({
        summary: z.object({
          totalPaid: z.number(),
          dueAmount: z.number(),
          purchaseCount: z.number(),
          paymentCount: z.number(),
          totalPurchases: z.number(),
          lastPurchaseAt: z.date().optional(),
        }),
      })
    )
  );
export type CompanyDetailsContractType = InferContractRouterType<
  typeof companyDetailsContract
>;

export const companyContract = {
  list: listCompanyContract,
  listForSearch: listCompanyForSearchContract,
  create: companyCreateContract,
  update: updateCompanyContract,
  ...companyDeleteContract,
  details: companyDetailsContract,
  payment: companyPaymentContract,
  purchase: companyPurchaseContract,
};
