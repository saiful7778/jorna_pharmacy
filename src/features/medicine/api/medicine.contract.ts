import z from "zod";

import { API_MESSAGES } from "@/constants/apiMessage";
import { selectMedicineSchema } from "@/db/schemas";
import { apiOutputSchema } from "@/lib/zod-schemas/apiOutputSchema";
import { paginateInputSchema } from "@/lib/zod-schemas/paginateInputSchema";
import { baseContract } from "@/oRPC/orpc.contract-base";
import type { InferContractRouterType } from "@/types/orpc.types";

const medicineBaseContract = baseContract.errors({
  NOT_FOUND: {
    status: 404,
    message: API_MESSAGES.MEDICINE.NOT_FOUND,
  },
});

const tags = ["Medicine"] as const;

const listMedicineForSearchContract = medicineBaseContract
  .route({
    method: "GET",
    path: "/medicines/search",
    description: "List medicines for search",
    tags,
  })
  .input(
    paginateInputSchema<typeof selectMedicineSchema>({
      searchFields: ["name", "genericName", "strength"],
      orderFields: ["name"],
      filter: z.object({
        companyId: z.uuid().optional(),
      }),
    })
  )
  .output(
    apiOutputSchema(
      z.array(
        selectMedicineSchema
          .pick({
            id: true,
            name: true,
            genericName: true,
            strength: true,
            type: true,
            baseUnit: true,
          })
          .extend({
            sellPerUnit: z.number().nullable(),
            stock: z.number(),
          })
      )
    )
  );
export type ListMedicineForSearchContractType = InferContractRouterType<
  typeof listMedicineForSearchContract
>;

export const medicineContract = {
  listForSearch: listMedicineForSearchContract,
};
