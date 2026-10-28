import z from "zod";

import { API_MESSAGES } from "@/constants/apiMessage";
import { selectCompanySchema, selectPurchaseSchema } from "@/db/schemas";
import { apiOutputSchema } from "@/lib/zod-schemas/apiOutputSchema";
import { bulkIdsSchema } from "@/lib/zod-schemas/bulkIdsSchema";
import { paginateInputSchema } from "@/lib/zod-schemas/paginateInputSchema";
import { paginateOutputSchema } from "@/lib/zod-schemas/paginateOutputSchema";
import { baseContract } from "@/oRPC/orpc.contract-base";
import type { InferContractRouterType } from "@/types/orpc.types";

const purchaseDeleteBaseContract = baseContract.errors({
  NOT_FOUND: { status: 404, message: API_MESSAGES.PURCHASE.NOT_FOUND },
});

const purchaseMoveToBinContract = purchaseDeleteBaseContract.errors({
  HAS_SALES: { status: 409, message: API_MESSAGES.PURCHASE.HAS_SALES },
});

const purchaseBinContract = purchaseDeleteBaseContract.errors({
  NOT_IN_BIN: { status: 409, message: API_MESSAGES.PURCHASE.NOT_IN_BIN },
});

const tags = ["Company", "Purchases"] as const;

const listPurchaseBinContract = purchaseDeleteBaseContract
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
export type ListPurchaseBinContractType = InferContractRouterType<
  typeof listPurchaseBinContract
>;

const deletePurchaseContract = purchaseMoveToBinContract
  .route({
    method: "DELETE",
    path: "/companies/purchases/delete",
    description:
      "Move a purchase to the bin (soft delete) together with its returns and payments",
    tags,
  })
  .input(z.object({ purchaseId: z.uuid() }))
  .output(apiOutputSchema(selectPurchaseSchema));

const deleteAllPurchaseContract = purchaseMoveToBinContract
  .route({
    method: "DELETE",
    path: "/companies/purchases/delete-all",
    description:
      "Move multiple purchases to the bin (soft delete) together with their returns and payments",
    tags,
  })
  .input(z.object({ purchaseIds: bulkIdsSchema }))
  .output(apiOutputSchema(z.object({ count: z.number() })));

const restorePurchaseContract = purchaseBinContract
  .route({
    method: "POST",
    path: "/companies/purchases/restore",
    description:
      "Restore a purchase from the bin together with its returns and payments",
    tags,
  })
  .input(z.object({ purchaseId: z.uuid() }))
  .output(apiOutputSchema(selectPurchaseSchema));

const restoreAllPurchaseContract = purchaseBinContract
  .route({
    method: "POST",
    path: "/companies/purchases/restore-all",
    description:
      "Restore multiple purchases from the bin together with their returns and payments",
    tags,
  })
  .input(z.object({ purchaseIds: bulkIdsSchema }))
  .output(apiOutputSchema(z.object({ count: z.number() })));

const removePurchaseContract = purchaseBinContract
  .route({
    method: "DELETE",
    path: "/companies/purchases/remove",
    description: "Permanently delete a purchase that is in the bin",
    tags,
  })
  .input(z.object({ purchaseId: z.uuid() }))
  .output(apiOutputSchema(selectPurchaseSchema));

const removeAllPurchaseContract = purchaseBinContract
  .route({
    method: "DELETE",
    path: "/companies/purchases/remove-all",
    description: "Permanently delete multiple purchases that are in the bin",
    tags,
  })
  .input(z.object({ purchaseIds: bulkIdsSchema }))
  .output(apiOutputSchema(z.object({ count: z.number() })));

export const purchaseDeleteContract = {
  listBin: listPurchaseBinContract,
  delete: deletePurchaseContract,
  deleteAll: deleteAllPurchaseContract,
  restore: restorePurchaseContract,
  restoreAll: restoreAllPurchaseContract,
  remove: removePurchaseContract,
  removeAll: removeAllPurchaseContract,
};
