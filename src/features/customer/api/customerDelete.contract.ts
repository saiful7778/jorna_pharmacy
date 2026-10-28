import z from "zod";

import { API_MESSAGES } from "@/constants/apiMessage";
import { selectCustomerSchema } from "@/db/schemas";
import { apiOutputSchema } from "@/lib/zod-schemas/apiOutputSchema";
import { bulkIdsSchema } from "@/lib/zod-schemas/bulkIdsSchema";
import { paginateInputSchema } from "@/lib/zod-schemas/paginateInputSchema";
import { paginateOutputSchema } from "@/lib/zod-schemas/paginateOutputSchema";
import { baseContract } from "@/oRPC/orpc.contract-base";
import type { InferContractRouterType } from "@/types/orpc.types";

const customerDeleteBaseContract = baseContract.errors({
  NOT_FOUND: {
    status: 404,
    success: false,
    message: API_MESSAGES.CUSTOMER.NOT_FOUND,
  },
});

const customerBinContract = customerDeleteBaseContract.errors({
  NOT_IN_BIN: {
    status: 409,
    success: false,
    message: API_MESSAGES.CUSTOMER.NOT_IN_BIN,
  },
});

const customerMoveToBinContract = customerDeleteBaseContract.errors({
  HAS_SALES: {
    status: 409,
    success: false,
    message: API_MESSAGES.CUSTOMER.HAS_SALES,
  },
});

const tags = ["Customer"] as const;

const listCustomerBinContract = baseContract
  .route({
    method: "GET",
    path: "/customers/bin",
    description: "List of customers in the bin",
    tags,
  })
  .input(
    paginateInputSchema<typeof selectCustomerSchema>({
      searchFields: ["name", "phone", "address"],
      orderFields: [],
    })
  )
  .output(apiOutputSchema(paginateOutputSchema(selectCustomerSchema)));
export type ListCustomerBinContractType = InferContractRouterType<
  typeof listCustomerBinContract
>;

const deleteCustomerContract = customerMoveToBinContract
  .route({
    method: "DELETE",
    path: "/customers/delete",
    description: "Move a customer to the bin (soft delete)",
    tags,
  })
  .input(z.object({ customerId: z.uuid() }))
  .output(apiOutputSchema(selectCustomerSchema));

const deleteAllCustomerContract = customerMoveToBinContract
  .route({
    method: "DELETE",
    path: "/customers/delete-all",
    description: "Move multiple customers to the bin (soft delete)",
    tags,
  })
  .input(z.object({ customerIds: bulkIdsSchema }))
  .output(apiOutputSchema(z.object({ count: z.number() })));

const restoreCustomerContract = customerBinContract
  .route({
    method: "POST",
    path: "/customers/restore",
    description: "Restore a customer from the bin",
    tags,
  })
  .input(z.object({ customerId: z.uuid() }))
  .output(apiOutputSchema(selectCustomerSchema));

const restoreAllCustomerContract = customerBinContract
  .route({
    method: "POST",
    path: "/customers/restore-all",
    description: "Restore multiple customers from the bin",
    tags,
  })
  .input(z.object({ customerIds: bulkIdsSchema }))
  .output(apiOutputSchema(z.object({ count: z.number() })));

const removeCustomerContract = customerBinContract
  .route({
    method: "DELETE",
    path: "/customers/remove",
    description: "Permanently delete a customer that is in the bin",
    tags,
  })
  .input(z.object({ customerId: z.uuid() }))
  .output(apiOutputSchema(selectCustomerSchema));

const removeAllCustomerContract = customerBinContract
  .route({
    method: "DELETE",
    path: "/customers/remove-all",
    description: "Permanently delete multiple customers that are in the bin",
    tags,
  })
  .input(z.object({ customerIds: bulkIdsSchema }))
  .output(apiOutputSchema(z.object({ count: z.number() })));

export const customerDeleteContract = {
  listBin: listCustomerBinContract,
  delete: deleteCustomerContract,
  deleteAll: deleteAllCustomerContract,
  restore: restoreCustomerContract,
  restoreAll: restoreAllCustomerContract,
  remove: removeCustomerContract,
  removeAll: removeAllCustomerContract,
};
