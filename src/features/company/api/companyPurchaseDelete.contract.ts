import z from "zod";

import { API_MESSAGES } from "@/constants/apiMessage";
import { selectCompanySchema, selectPurchaseSchema } from "@/db/schemas";
import { apiOutputSchema } from "@/lib/zod-schemas/apiOutputSchema";
import { bulkIdsSchema } from "@/lib/zod-schemas/bulkIdsSchema";
import { paginateInputSchema } from "@/lib/zod-schemas/paginateInputSchema";
import { paginateOutputSchema } from "@/lib/zod-schemas/paginateOutputSchema";
import { baseContract } from "@/oRPC/orpc.contract-base";
import type { InferContractRouterType } from "@/types/orpc.types";

const companyPurchaseDeleteBaseContract = baseContract.errors({
  NOT_FOUND: { status: 404, message: API_MESSAGES.PURCHASE.NOT_FOUND },
});

const companyPurchaseMoveToBinContract =
  companyPurchaseDeleteBaseContract.errors({
    HAS_SALES: { status: 409, message: API_MESSAGES.PURCHASE.HAS_SALES },
  });

const companyPurchaseBinContract = companyPurchaseDeleteBaseContract.errors({
  NOT_IN_BIN: { status: 409, message: API_MESSAGES.PURCHASE.NOT_IN_BIN },
});

const tags = ["Company", "Purchases"] as const;

const listCompanyPurchaseBinContract = companyPurchaseDeleteBaseContract
  .route({
    method: "POST",
    path: "/companies/purchases/bin",
    description: "List of purchases in the bin",
    tags,
  })
  .input(
    paginateInputSchema({
      searchFields: ["companyInvoiceNo"],
      orderFields: [],
    })
  )
  .output(
    apiOutputSchema(
      paginateOutputSchema(
        selectPurchaseSchema
          .pick({
            id: true,
            note: true,
            subtotal: true,
            discount: true,
            totalAmount: true,
            paidAmount: true,
            createdAt: true,
            updatedAt: true,
            deletedAt: true,
          })
          .extend({ company: selectCompanySchema })
      )
    )
  );
export type ListCompanyPurchaseBinContractType = InferContractRouterType<
  typeof listCompanyPurchaseBinContract
>;

const deleteCompanyPurchaseContract = companyPurchaseMoveToBinContract
  .route({
    method: "DELETE",
    path: "/companies/purchases/delete",
    description:
      "Move a purchase to the bin (soft delete) together with its returns and payments",
    tags,
  })
  .input(z.object({ purchaseId: z.uuid() }))
  .output(apiOutputSchema(selectPurchaseSchema));

const deleteAllCompanyPurchaseContract = companyPurchaseMoveToBinContract
  .route({
    method: "DELETE",
    path: "/companies/purchases/delete-all",
    description:
      "Move multiple purchases to the bin (soft delete) together with their returns and payments",
    tags,
  })
  .input(z.object({ purchaseIds: bulkIdsSchema }))
  .output(apiOutputSchema(z.object({ count: z.number() })));

const restoreCompanyPurchaseContract = companyPurchaseBinContract
  .route({
    method: "POST",
    path: "/companies/purchases/restore",
    description:
      "Restore a purchase from the bin together with its returns and payments",
    tags,
  })
  .input(z.object({ purchaseId: z.uuid() }))
  .output(apiOutputSchema(selectPurchaseSchema));

const restoreAllCompanyPurchaseContract = companyPurchaseBinContract
  .route({
    method: "POST",
    path: "/companies/purchases/restore-all",
    description:
      "Restore multiple purchases from the bin together with their returns and payments",
    tags,
  })
  .input(z.object({ purchaseIds: bulkIdsSchema }))
  .output(apiOutputSchema(z.object({ count: z.number() })));

const removeCompanyPurchaseContract = companyPurchaseBinContract
  .route({
    method: "DELETE",
    path: "/companies/purchases/remove",
    description: "Permanently delete a purchase that is in the bin",
    tags,
  })
  .input(z.object({ purchaseId: z.uuid() }))
  .output(apiOutputSchema(selectPurchaseSchema));

const removeAllCompanyPurchaseContract = companyPurchaseBinContract
  .route({
    method: "DELETE",
    path: "/companies/purchases/remove-all",
    description: "Permanently delete multiple purchases that are in the bin",
    tags,
  })
  .input(z.object({ purchaseIds: bulkIdsSchema }))
  .output(apiOutputSchema(z.object({ count: z.number() })));

export const companyPurchaseDeleteContract = {
  listBin: listCompanyPurchaseBinContract,
  delete: deleteCompanyPurchaseContract,
  deleteAll: deleteAllCompanyPurchaseContract,
  restore: restoreCompanyPurchaseContract,
  restoreAll: restoreAllCompanyPurchaseContract,
  remove: removeCompanyPurchaseContract,
  removeAll: removeAllCompanyPurchaseContract,
};
