import z from "zod";

import { API_MESSAGES } from "@/constants/apiMessage";
import { selectCompanySchema } from "@/db/schemas";
import { apiOutputSchema } from "@/lib/zod-schemas/apiOutputSchema";
import { bulkIdsSchema } from "@/lib/zod-schemas/bulkIdsSchema";
import { paginateInputSchema } from "@/lib/zod-schemas/paginateInputSchema";
import { paginateOutputSchema } from "@/lib/zod-schemas/paginateOutputSchema";
import { baseContract } from "@/oRPC/orpc.contract-base";
import type { InferContractRouterType } from "@/types/orpc.types";

const companyDeleteBaseContract = baseContract.errors({
  NOT_FOUND: {
    status: 404,
    success: false,
    message: API_MESSAGES.COMPANY.NOT_FOUND,
  },
});

const companyBinContract = companyDeleteBaseContract.errors({
  NOT_IN_BIN: {
    status: 409,
    success: false,
    message: API_MESSAGES.COMPANY.NOT_IN_BIN,
  },
});

const companyMoveToBinContract = companyDeleteBaseContract.errors({
  HAS_SALES: {
    status: 409,
    success: false,
    message: API_MESSAGES.COMPANY.HAS_SALES,
  },
});

const tags = ["Company"] as const;

const listCompanyBinContract = baseContract
  .route({
    method: "GET",
    path: "/companies/bin",
    description: "List of companies in the bin",
    tags,
  })
  .input(
    paginateInputSchema<typeof selectCompanySchema>({
      searchFields: ["name", "phone", "address"],
      orderFields: [],
    })
  )
  .output(apiOutputSchema(paginateOutputSchema(selectCompanySchema)));
export type ListCompanyBinContractType = InferContractRouterType<
  typeof listCompanyBinContract
>;

const deleteCompanyContract = companyMoveToBinContract
  .route({
    method: "DELETE",
    path: "/companies/delete",
    description: "Move a company to the bin (soft delete)",
    tags,
  })
  .input(z.object({ companyId: z.uuid() }))
  .output(apiOutputSchema(selectCompanySchema));

const deleteAllCompanyContract = companyMoveToBinContract
  .route({
    method: "DELETE",
    path: "/companies/delete-all",
    description: "Move multiple companies to the bin (soft delete)",
    tags,
  })
  .input(z.object({ companyIds: bulkIdsSchema }))
  .output(apiOutputSchema(z.object({ count: z.number() })));

const restoreCompanyContract = companyBinContract
  .route({
    method: "POST",
    path: "/companies/restore",
    description: "Restore a company from the bin",
    tags,
  })
  .input(z.object({ companyId: z.uuid() }))
  .output(apiOutputSchema(selectCompanySchema));

const restoreAllCompanyContract = companyBinContract
  .route({
    method: "POST",
    path: "/companies/restore-all",
    description: "Restore multiple companies from the bin",
    tags,
  })
  .input(z.object({ companyIds: bulkIdsSchema }))
  .output(apiOutputSchema(z.object({ count: z.number() })));

const removeCompanyContract = companyBinContract
  .route({
    method: "DELETE",
    path: "/companies/remove",
    description: "Permanently delete a company that is in the bin",
    tags,
  })
  .input(z.object({ companyId: z.uuid() }))
  .output(apiOutputSchema(selectCompanySchema));

const removeAllCompanyContract = companyBinContract
  .route({
    method: "DELETE",
    path: "/companies/remove-all",
    description: "Permanently delete multiple companies that are in the bin",
    tags,
  })
  .input(z.object({ companyIds: bulkIdsSchema }))
  .output(apiOutputSchema(z.object({ count: z.number() })));

export const companyDeleteContract = {
  listBin: listCompanyBinContract,
  delete: deleteCompanyContract,
  deleteAll: deleteAllCompanyContract,
  restore: restoreCompanyContract,
  restoreAll: restoreAllCompanyContract,
  remove: removeCompanyContract,
  removeAll: removeAllCompanyContract,
};
