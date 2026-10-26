import { implement } from "@orpc/server";
import { and, asc, eq, gt, sql } from "drizzle-orm";

import { API_MESSAGES } from "@/constants/apiMessage";
import { MedicineTable, PurchaseItemTable } from "@/db/schemas";
import { buildPaginateOptions } from "@/db/utils";
import { apiResponse } from "@/lib/apiResponse";
import {
  authMiddleware,
  userPermissionMiddleware,
} from "@/oRPC/middleware/auth.middleware";
import { errorMiddleware } from "@/oRPC/middleware/error.middleware";
import type { ORPCContext } from "@/types/orpc.types";

import { medicineContract } from "./medicine.contract";

export const medicineImpl = implement(medicineContract)
  .$context<ORPCContext>()
  .use(authMiddleware)
  .use(errorMiddleware);

export const listMedicineForSearchProcedure = medicineImpl.listForSearch
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "purchase", action: "manage" },
      { level: "system", resource: "medicine", action: "list" },
    ])
  )
  .handler(async ({ context, input }) => {
    const { where, limit } = buildPaginateOptions(
      {
        name: MedicineTable.name,
        genericName: MedicineTable.genericName,
        strength: MedicineTable.strength,
        companyId: MedicineTable.companyId,
      },
      input
    );

    const rankedBatches = context.db
      .select({
        medicineId: PurchaseItemTable.medicineId,
        sellPerUnit: PurchaseItemTable.sellPerUnit,
        rn: sql<number>`row_number() over (partition by ${PurchaseItemTable.medicineId} order by ${PurchaseItemTable.expiryDate} is null, ${PurchaseItemTable.expiryDate} asc,${PurchaseItemTable.createdAt} asc)`.as(
          "rn"
        ),
        totalRemaining:
          sql<number>`sum(${PurchaseItemTable.qtyRemaining}) over (partition by ${PurchaseItemTable.medicineId})`.as(
            "total_remaining"
          ),
      })
      .from(PurchaseItemTable)
      .where(gt(PurchaseItemTable.qtyRemaining, 0))
      .as("ranked_batches");

    const medicines = await context.db
      .select({
        id: MedicineTable.id,
        name: MedicineTable.name,
        genericName: MedicineTable.genericName,
        strength: MedicineTable.strength,
        type: MedicineTable.type,
        baseUnit: MedicineTable.baseUnit,
        minimumStock: MedicineTable.minimumStock,
        sellPerUnit: rankedBatches.sellPerUnit,
        stock: sql<number>`coalesce(${rankedBatches.totalRemaining}, 0)`,
      })
      .from(MedicineTable)
      .leftJoin(
        rankedBatches,
        and(
          eq(rankedBatches.medicineId, MedicineTable.id),
          eq(rankedBatches.rn, 1)
        )
      )
      .where(and(eq(MedicineTable.isActive, true), where))
      .orderBy(asc(MedicineTable.name))
      .limit(limit);

    return apiResponse(API_MESSAGES.MEDICINE.GET_FOR_SEARCH, medicines);
  });
