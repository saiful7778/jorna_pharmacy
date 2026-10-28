import { implement, ORPCError } from "@orpc/server";
import {
  and,
  asc,
  desc,
  eq,
  getTableColumns,
  gt,
  inArray,
  isNull,
  sql,
  type SQL,
} from "drizzle-orm";
import type { BatchItem } from "drizzle-orm/batch";

import { API_MESSAGES } from "@/constants/apiMessage";
import {
  CompanyPaymentTable,
  CompanyTable,
  MedicineTable,
  PurchaseItemTable,
  PurchaseTable,
  type InsertCompanyPayment,
  type InsertMedicine,
  type InsertPurchase,
  type InsertPurchaseItem,
  type PurchaseDataModel,
} from "@/db/schemas";
import { buildPaginateOptions, buildPaginationMeta } from "@/db/utils";
import { chunkByParams } from "@/db/utils/chunk-by-params";
import { apiResponse } from "@/lib/apiResponse";
import {
  authMiddleware,
  userPermissionMiddleware,
} from "@/oRPC/middleware/auth.middleware";
import { errorMiddleware } from "@/oRPC/middleware/error.middleware";
import type { ORPCContext } from "@/types/orpc.types";

import { resolveCompany } from "../companyResolver";
import { purchaseContract } from "./purchase.contract";

export const purchaseImpl = implement(purchaseContract)
  .$context<ORPCContext>()
  .use(authMiddleware)
  .use(errorMiddleware);

export const listPurchaseProcedure = purchaseImpl.list
  .use(
    userPermissionMiddleware([
      {
        level: "system",
        resource: "purchase",
        action: "manage",
      },
      {
        level: "system",
        resource: "purchase",
        action: "list",
      },
    ])
  )
  .handler(async ({ context, input }) => {
    const { companyId, unpaidOnly, ...paginateInput } = input;

    const { where, page, orderBy, offset, limit } = buildPaginateOptions(
      {
        companyInvoiceNo: PurchaseTable.companyInvoiceNo,
        createdAt: PurchaseTable.createdAt,
      },
      paginateInput
    );

    const whereSql: Array<SQL> = [isNull(PurchaseTable.deletedAt)];

    if (companyId) {
      whereSql.push(eq(PurchaseTable.companyId, companyId));
    }

    if (unpaidOnly) {
      whereSql.push(gt(PurchaseTable.totalAmount, PurchaseTable.paidAmount));
    }

    if (where) {
      whereSql.push(where);
    }

    const purchaseWhere = and(...whereSql);

    const [totalCountResult, purchases] = await Promise.all([
      context.db
        .select({ count: sql<number>`COUNT(*)` })
        .from(PurchaseTable)
        .where(purchaseWhere),
      context.db
        .select({
          id: PurchaseTable.id,
          companyInvoiceNo: PurchaseTable.companyInvoiceNo,
          note: PurchaseTable.note,
          subtotal: PurchaseTable.subtotal,
          discount: PurchaseTable.discount,
          totalAmount: PurchaseTable.totalAmount,
          paidAmount: PurchaseTable.paidAmount,
          dueAmount: sql<number>`MAX(${PurchaseTable.totalAmount} - ${PurchaseTable.paidAmount}, 0)`,
          createdAt: PurchaseTable.createdAt,
          updatedAt: PurchaseTable.updatedAt,
          company: CompanyTable,
        })
        .from(PurchaseTable)
        .innerJoin(CompanyTable, eq(CompanyTable.id, PurchaseTable.companyId))
        .where(purchaseWhere)
        .orderBy(desc(PurchaseTable.createdAt), orderBy)
        .limit(limit)
        .offset(offset),
    ]);

    const totalCount = Number(totalCountResult[0]?.count ?? 0);

    return apiResponse(API_MESSAGES.PURCHASE.GET_ALL, {
      meta: buildPaginationMeta(totalCount, purchases.length, page, limit),
      data: purchases,
    });
  });

export const purchaseStatsProcedure = purchaseImpl.stats
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "purchase", action: "manage" },
      { level: "system", resource: "purchase", action: "read" },
    ])
  )
  .handler(async ({ context, input }) => {
    const { where } = buildPaginateOptions(
      {
        createdAt: PurchaseTable.createdAt,
      },
      input
    );

    const activeWhere = and(isNull(PurchaseTable.deletedAt), where);

    const [purchaseTotals, dueTotals] = await Promise.all([
      context.db
        .select({
          totalPurchases: sql<number>`COALESCE(SUM(${PurchaseTable.totalAmount}), 0)`,
          count: sql<number>`COUNT(*)`,
        })
        .from(PurchaseTable)
        .where(activeWhere),
      context.db
        .select({
          total: sql<number>`COALESCE(SUM(${PurchaseTable.totalAmount} - ${PurchaseTable.paidAmount}), 0)`,
        })
        .from(PurchaseTable)
        .where(isNull(PurchaseTable.deletedAt)),
    ]);

    return apiResponse(API_MESSAGES.PURCHASE.GET_STATS, {
      totalPurchases: Number(purchaseTotals[0]?.totalPurchases ?? 0),
      dueAmount: Number(dueTotals[0]?.total ?? 0),
      purchaseCount: Number(purchaseTotals[0]?.count ?? 0),
    });
  });

export const purchaseCreateProcedure = purchaseImpl.create
  .use(
    userPermissionMiddleware([
      {
        level: "system",
        resource: "purchase",
        action: "manage",
      },
      {
        level: "system",
        resource: "purchase",
        action: "create",
      },
    ])
  )
  .handler(async ({ context, input, errors }) => {
    let companyId: string;

    const resolvedCompanyData = await resolveCompany(context.db, {
      id: input.companyId,
      name: input.companyName,
      address: input.companyAddress,
      phone: input.companyPhone,
    });

    if (resolvedCompanyData.success) {
      companyId = resolvedCompanyData.id;
    } else {
      throw errors.BAD_REQUEST();
    }

    const purchaseId = crypto.randomUUID();
    const subtotal =
      input.items.length > 0
        ? Math.round(
            input.items.reduce(
              (sum, item) => sum + item.qtyPurchased * item.costPerUnit,
              0
            ) * 100
          ) / 100
        : input.totalAmount;

    if (subtotal < input.totalAmount) {
      throw errors.BAD_REQUEST();
    }

    const existingMedicineIds = [
      ...new Set(
        input.items.flatMap((item) =>
          !item.isNew && item.medicineId ? [item.medicineId] : []
        )
      ),
    ];

    if (existingMedicineIds.length > 0) {
      const existingMedicines = await context.db
        .select({ id: MedicineTable.id })
        .from(MedicineTable)
        .where(
          and(
            eq(MedicineTable.isActive, true),
            inArray(MedicineTable.id, existingMedicineIds)
          )
        );

      if (existingMedicines.length !== existingMedicineIds.length) {
        throw errors.BAD_REQUEST();
      }
    }

    const newMedicines: Array<InsertMedicine> = [];
    const purchaseItems: Array<InsertPurchaseItem> = [];

    for (const item of input.items) {
      let medicineId = item.medicineId;

      if (item.isNew) {
        if (!item.medicineType || !item.baseUnit) {
          throw errors.BAD_REQUEST();
        }

        medicineId = crypto.randomUUID();
        newMedicines.push({
          id: medicineId,
          name: item.medicineName,
          genericName: item.genericName,
          strength: item.strength,
          companyId,
          type: item.medicineType,
          baseUnit: item.baseUnit,
        });
      }

      if (!medicineId) {
        throw errors.BAD_REQUEST();
      }

      purchaseItems.push({
        purchaseId,
        medicineId,
        qtyPurchased: item.qtyPurchased,
        qtyRemaining: item.qtyPurchased,
        costPerUnit: item.costPerUnit,
        sellPerUnit: item.sellPerUnit,
        expiryDate: item.expiryDate,
      });
    }

    const statements: [BatchItem<"sqlite">, ...Array<BatchItem<"sqlite">>] = [
      context.db
        .insert(PurchaseTable)
        .values({
          id: purchaseId,
          companyId,
          createdBy: context.user.id,
          subtotal,
          discount: subtotal - input.totalAmount,
          totalAmount: input.totalAmount,
          paidAmount: input.paidAmount,
        } satisfies InsertPurchase)
        .returning(),
    ];

    // Column counts are upper bounds on bound parameters per row (D1 limit).
    for (const rows of chunkByParams(newMedicines, 12)) {
      statements.push(context.db.insert(MedicineTable).values(rows));
    }

    for (const rows of chunkByParams(purchaseItems, 11)) {
      statements.push(context.db.insert(PurchaseItemTable).values(rows));
    }

    statements.push(
      context.db.insert(CompanyPaymentTable).values({
        companyId,
        amount: input.paidAmount,
        createdBy: context.user.id,
        purchaseId,
      } satisfies InsertCompanyPayment)
    );

    const [purchaseResult] = await context.db.batch(statements);
    const newPurchase = (
      purchaseResult as Array<PurchaseDataModel> | undefined
    )?.[0];

    if (!newPurchase) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: API_MESSAGES.PURCHASE.NOT_CREATE,
      });
    }

    return apiResponse(API_MESSAGES.PURCHASE.CREATE, newPurchase);
  });

export const purchaseDetailsProcedure = purchaseImpl.details
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "purchase", action: "manage" },
      { level: "system", resource: "purchase", action: "read" },
    ])
  )
  .handler(async ({ context, input, errors }) => {
    const [[purchase], items] = await Promise.all([
      context.db
        .select({
          ...getTableColumns(PurchaseTable),
          company: CompanyTable,
        })
        .from(PurchaseTable)
        .innerJoin(CompanyTable, eq(CompanyTable.id, PurchaseTable.companyId))
        .where(
          and(
            eq(PurchaseTable.id, input.purchaseId),
            isNull(PurchaseTable.deletedAt)
          )
        )
        .limit(1),
      context.db
        .select({
          ...getTableColumns(PurchaseItemTable),
          medicine: {
            id: MedicineTable.id,
            name: MedicineTable.name,
            genericName: MedicineTable.genericName,
            strength: MedicineTable.strength,
            type: MedicineTable.type,
            baseUnit: MedicineTable.baseUnit,
          },
        })
        .from(PurchaseItemTable)
        .innerJoin(
          MedicineTable,
          eq(MedicineTable.id, PurchaseItemTable.medicineId)
        )
        .where(eq(PurchaseItemTable.purchaseId, input.purchaseId))
        .orderBy(asc(PurchaseItemTable.createdAt), asc(PurchaseItemTable.id)),
    ]);

    if (!purchase) {
      throw errors.NOT_FOUND();
    }

    return apiResponse(API_MESSAGES.PURCHASE.GET_DETAILS, {
      ...purchase,
      items,
    });
  });
