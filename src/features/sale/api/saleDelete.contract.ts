import z from "zod";

import { API_MESSAGES } from "@/constants/apiMessage";
import { selectCustomerSchema, selectSaleSchema } from "@/db/schemas";
import { apiOutputSchema } from "@/lib/zod-schemas/apiOutputSchema";
import { bulkIdsSchema } from "@/lib/zod-schemas/bulkIdsSchema";
import { paginateInputSchema } from "@/lib/zod-schemas/paginateInputSchema";
import { paginateOutputSchema } from "@/lib/zod-schemas/paginateOutputSchema";
import { baseContract } from "@/oRPC/orpc.contract-base";
import type { InferContractRouterType } from "@/types/orpc.types";

const saleDeleteBaseContract = baseContract.errors({
  NOT_FOUND: { status: 404, message: API_MESSAGES.SALE.NOT_FOUND },
});

const saleBinContract = saleDeleteBaseContract.errors({
  NOT_IN_BIN: { status: 409, message: API_MESSAGES.SALE.NOT_IN_BIN },
});

const saleRestoreContract = saleBinContract.errors({
  NOT_ENOUGH_STOCK_TO_RESTORE: {
    status: 409,
    message: API_MESSAGES.SALE.NOT_ENOUGH_STOCK_TO_RESTORE,
  },
});

const tags = ["Sale"] as const;

const listSaleBinContract = saleDeleteBaseContract
  .route({
    method: "GET",
    path: "/sales/bin",
    description: "List of sales in the bin",
    tags,
  })
  .input(
    paginateInputSchema({
      searchFields: ["invoiceNo", "customerPhone", "customerName"],
      orderFields: [],
      filter: z.object({ customerId: z.uuid().optional() }),
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
            deletedAt: true,
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
export type ListSaleBinContractType = InferContractRouterType<
  typeof listSaleBinContract
>;

const deleteSaleContract = saleDeleteBaseContract
  .route({
    method: "DELETE",
    path: "/sales/delete",
    description:
      "Move a sale to the bin (soft delete) and return its batch quantities to stock",
    tags,
  })
  .input(z.object({ saleId: z.uuid() }))
  .output(apiOutputSchema(selectSaleSchema));

const deleteAllSaleContract = saleDeleteBaseContract
  .route({
    method: "DELETE",
    path: "/sales/delete-all",
    description:
      "Move multiple sales to the bin (soft delete) and return their batch quantities to stock",
    tags,
  })
  .input(z.object({ saleIds: bulkIdsSchema }))
  .output(apiOutputSchema(z.object({ count: z.number() })));

const restoreSaleContract = saleRestoreContract
  .route({
    method: "POST",
    path: "/sales/restore",
    description:
      "Restore a sale from the bin and take its batch quantities out of stock again",
    tags,
  })
  .input(z.object({ saleId: z.uuid() }))
  .output(apiOutputSchema(selectSaleSchema));

const restoreAllSaleContract = saleRestoreContract
  .route({
    method: "POST",
    path: "/sales/restore-all",
    description:
      "Restore multiple sales from the bin and take their batch quantities out of stock again",
    tags,
  })
  .input(z.object({ saleIds: bulkIdsSchema }))
  .output(apiOutputSchema(z.object({ count: z.number() })));

const removeSaleContract = saleBinContract
  .route({
    method: "DELETE",
    path: "/sales/remove",
    description: "Permanently delete a sale that is in the bin",
    tags,
  })
  .input(z.object({ saleId: z.uuid() }))
  .output(apiOutputSchema(selectSaleSchema));

const removeAllSaleContract = saleBinContract
  .route({
    method: "DELETE",
    path: "/sales/remove-all",
    description: "Permanently delete multiple sales that are in the bin",
    tags,
  })
  .input(z.object({ saleIds: bulkIdsSchema }))
  .output(apiOutputSchema(z.object({ count: z.number() })));

export const saleDeleteContract = {
  listBin: listSaleBinContract,
  delete: deleteSaleContract,
  deleteAll: deleteAllSaleContract,
  restore: restoreSaleContract,
  restoreAll: restoreAllSaleContract,
  remove: removeSaleContract,
  removeAll: removeAllSaleContract,
};
