import { ORPCError } from "@orpc/server";
import { and, desc, eq, inArray, isNotNull, isNull } from "drizzle-orm";

import { API_MESSAGES } from "@/constants/apiMessage";
import type { DatabaseType } from "@/db/clients/drizzle-client";
import {
  CompanyPaymentTable,
  CompanyTable,
  PurchaseItemTable,
  PurchaseReturnTable,
  PurchaseTable,
  SaleItemTable,
} from "@/db/schemas";
import { buildPaginateOptions, buildPaginationMeta } from "@/db/utils";
import { apiResponse } from "@/lib/apiResponse";
import { userPermissionMiddleware } from "@/oRPC/middleware/auth.middleware";

import { companyImpl } from "./company.procedure";

async function hasPurchaseSoldBatches(
  db: DatabaseType,
  purchaseIds: Array<string>
): Promise<boolean> {
  const soldBatches = await db
    .select({ id: SaleItemTable.id })
    .from(SaleItemTable)
    .innerJoin(
      PurchaseItemTable,
      eq(PurchaseItemTable.id, SaleItemTable.purchaseItemId)
    )
    .where(inArray(PurchaseItemTable.purchaseId, purchaseIds))
    .limit(1);

  return soldBatches.length > 0;
}

async function restorePurchases(
  db: DatabaseType,
  purchaseIds: Array<string>
): Promise<void> {
  await db.batch([
    db
      .update(PurchaseReturnTable)
      .set({ deletedAt: null, deletedBy: null })
      .where(
        and(
          inArray(PurchaseReturnTable.purchaseId, purchaseIds),
          isNotNull(PurchaseReturnTable.deletedAt)
        )
      ),
    db
      .update(CompanyPaymentTable)
      .set({ deletedAt: null, deletedBy: null })
      .where(
        and(
          inArray(CompanyPaymentTable.purchaseId, purchaseIds),
          isNotNull(CompanyPaymentTable.deletedAt)
        )
      ),
    db
      .update(PurchaseTable)
      .set({ deletedAt: null, deletedBy: null })
      .where(
        and(
          inArray(PurchaseTable.id, purchaseIds),
          isNotNull(PurchaseTable.deletedAt)
        )
      ),
  ]);
}

export const listCompanyPurchaseBinProcedure = companyImpl.purchase.listBin
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "purchase", action: "manage" },
      { level: "system", resource: "purchase", action: "delete" },
    ])
  )
  .handler(async ({ context, input }) => {
    const { where, page, offset, limit } = buildPaginateOptions(
      {
        companyInvoiceNo: PurchaseTable.companyInvoiceNo,
      },
      input
    );

    const binWhere = and(isNotNull(PurchaseTable.deletedAt), where);

    const [totalCountResult, purchases] = await Promise.all([
      context.db.$count(PurchaseTable, binWhere),
      context.db
        .select({
          id: PurchaseTable.id,
          note: PurchaseTable.note,
          subtotal: PurchaseTable.subtotal,
          discount: PurchaseTable.discount,
          totalAmount: PurchaseTable.totalAmount,
          paidAmount: PurchaseTable.paidAmount,
          createdAt: PurchaseTable.createdAt,
          updatedAt: PurchaseTable.updatedAt,
          deletedAt: PurchaseTable.deletedAt,
          company: CompanyTable,
        })
        .from(PurchaseTable)
        .innerJoin(CompanyTable, eq(CompanyTable.id, PurchaseTable.companyId))
        .where(binWhere)
        .orderBy(desc(PurchaseTable.deletedAt))
        .limit(limit)
        .offset(offset),
    ]);

    return apiResponse(API_MESSAGES.PURCHASE.GET_ALL_BIN, {
      meta: buildPaginationMeta(
        totalCountResult,
        purchases.length,
        page,
        limit
      ),
      data: purchases,
    });
  });

export const deleteCompanyPurchaseProcedure = companyImpl.purchase.delete
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "purchase", action: "manage" },
      { level: "system", resource: "purchase", action: "delete" },
    ])
  )
  .handler(async ({ context, input, errors }) => {
    const [activePurchase] = await context.db
      .select({ id: PurchaseTable.id })
      .from(PurchaseTable)
      .where(
        and(
          eq(PurchaseTable.id, input.purchaseId),
          isNull(PurchaseTable.deletedAt)
        )
      )
      .limit(1);

    if (!activePurchase) {
      throw errors.NOT_FOUND();
    }

    if (await hasPurchaseSoldBatches(context.db, [input.purchaseId])) {
      throw errors.HAS_SALES();
    }

    const deletedAt = new Date();

    const [, , [deletedPurchase]] = await context.db.batch([
      context.db
        .update(PurchaseReturnTable)
        .set({ deletedAt, deletedBy: context.user.id })
        .where(
          and(
            eq(PurchaseReturnTable.purchaseId, input.purchaseId),
            isNull(PurchaseReturnTable.deletedAt)
          )
        ),
      context.db
        .update(CompanyPaymentTable)
        .set({ deletedAt, deletedBy: context.user.id })
        .where(
          and(
            eq(CompanyPaymentTable.purchaseId, input.purchaseId),
            isNull(CompanyPaymentTable.deletedAt)
          )
        ),
      context.db
        .update(PurchaseTable)
        .set({ deletedAt, deletedBy: context.user.id })
        .where(
          and(
            eq(PurchaseTable.id, input.purchaseId),
            isNull(PurchaseTable.deletedAt)
          )
        )
        .returning(),
    ]);

    if (!deletedPurchase) {
      throw errors.NOT_FOUND();
    }

    return apiResponse(API_MESSAGES.PURCHASE.DELETE, deletedPurchase);
  });

export const deleteAllCompanyPurchaseProcedure = companyImpl.purchase.deleteAll
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "purchase", action: "manage" },
      { level: "system", resource: "purchase", action: "delete" },
    ])
  )
  .handler(async ({ context, input, errors }) => {
    const purchaseIds = [...new Set(input.purchaseIds)];

    const activePurchases = await context.db
      .select({ id: PurchaseTable.id })
      .from(PurchaseTable)
      .where(
        and(
          inArray(PurchaseTable.id, purchaseIds),
          isNull(PurchaseTable.deletedAt)
        )
      );

    if (activePurchases.length !== purchaseIds.length) {
      throw errors.NOT_FOUND();
    }

    if (await hasPurchaseSoldBatches(context.db, purchaseIds)) {
      throw errors.HAS_SALES();
    }

    const deletedAt = new Date();

    const [, , deletedPurchases] = await context.db.batch([
      context.db
        .update(PurchaseReturnTable)
        .set({ deletedAt, deletedBy: context.user.id })
        .where(
          and(
            inArray(PurchaseReturnTable.purchaseId, purchaseIds),
            isNull(PurchaseReturnTable.deletedAt)
          )
        ),
      context.db
        .update(CompanyPaymentTable)
        .set({ deletedAt, deletedBy: context.user.id })
        .where(
          and(
            inArray(CompanyPaymentTable.purchaseId, purchaseIds),
            isNull(CompanyPaymentTable.deletedAt)
          )
        ),
      context.db
        .update(PurchaseTable)
        .set({ deletedAt, deletedBy: context.user.id })
        .where(
          and(
            inArray(PurchaseTable.id, purchaseIds),
            isNull(PurchaseTable.deletedAt)
          )
        )
        .returning({ id: PurchaseTable.id }),
    ]);

    return apiResponse(API_MESSAGES.PURCHASE.DELETE_ALL, {
      count: deletedPurchases.length,
    });
  });

export const removeCompanyPurchaseProcedure = companyImpl.purchase.remove
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "purchase", action: "manage" },
      { level: "system", resource: "purchase", action: "delete" },
    ])
  )
  .handler(async ({ context, input, errors }) => {
    const [binPurchase] = await context.db
      .select({ id: PurchaseTable.id })
      .from(PurchaseTable)
      .where(
        and(
          eq(PurchaseTable.id, input.purchaseId),
          isNotNull(PurchaseTable.deletedAt)
        )
      )
      .limit(1);

    if (!binPurchase) {
      throw errors.NOT_IN_BIN();
    }

    const [, , [removedPurchase]] = await context.db.batch([
      context.db
        .delete(CompanyPaymentTable)
        .where(eq(CompanyPaymentTable.purchaseId, input.purchaseId)),
      context.db
        .delete(PurchaseReturnTable)
        .where(eq(PurchaseReturnTable.purchaseId, input.purchaseId)),
      context.db
        .delete(PurchaseTable)
        .where(eq(PurchaseTable.id, input.purchaseId))
        .returning(),
    ]);

    if (!removedPurchase) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: API_MESSAGES.PURCHASE.NOT_DELETE,
      });
    }

    return apiResponse(API_MESSAGES.PURCHASE.REMOVE, removedPurchase);
  });

export const removeAllCompanyPurchaseProcedure = companyImpl.purchase.removeAll
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "purchase", action: "manage" },
      { level: "system", resource: "purchase", action: "delete" },
    ])
  )
  .handler(async ({ context, input, errors }) => {
    const purchaseIds = [...new Set(input.purchaseIds)];

    const binPurchases = await context.db
      .select({ id: PurchaseTable.id })
      .from(PurchaseTable)
      .where(
        and(
          inArray(PurchaseTable.id, purchaseIds),
          isNotNull(PurchaseTable.deletedAt)
        )
      );

    if (binPurchases.length !== purchaseIds.length) {
      throw errors.NOT_IN_BIN();
    }

    const [, , removedPurchases] = await context.db.batch([
      context.db
        .delete(CompanyPaymentTable)
        .where(inArray(CompanyPaymentTable.purchaseId, purchaseIds)),
      context.db
        .delete(PurchaseReturnTable)
        .where(inArray(PurchaseReturnTable.purchaseId, purchaseIds)),
      context.db
        .delete(PurchaseTable)
        .where(inArray(PurchaseTable.id, purchaseIds))
        .returning({ id: PurchaseTable.id }),
    ]);

    return apiResponse(API_MESSAGES.PURCHASE.REMOVE_ALL, {
      count: removedPurchases.length,
    });
  });

export const restoreCompanyPurchaseProcedure = companyImpl.purchase.restore
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "purchase", action: "manage" },
      { level: "system", resource: "purchase", action: "delete" },
    ])
  )
  .handler(async ({ context, input, errors }) => {
    const [binPurchase] = await context.db
      .select({ id: PurchaseTable.id })
      .from(PurchaseTable)
      .where(
        and(
          eq(PurchaseTable.id, input.purchaseId),
          isNotNull(PurchaseTable.deletedAt)
        )
      )
      .limit(1);

    if (!binPurchase) {
      throw errors.NOT_IN_BIN();
    }

    await restorePurchases(context.db, [input.purchaseId]);

    const [restoredPurchase] = await context.db
      .select()
      .from(PurchaseTable)
      .where(eq(PurchaseTable.id, input.purchaseId))
      .limit(1);

    if (!restoredPurchase) {
      throw errors.NOT_FOUND();
    }

    return apiResponse(API_MESSAGES.PURCHASE.RESTORE, restoredPurchase);
  });

export const restoreAllCompanyPurchaseProcedure =
  companyImpl.purchase.restoreAll
    .use(
      userPermissionMiddleware([
        { level: "system", resource: "purchase", action: "manage" },
        { level: "system", resource: "purchase", action: "delete" },
      ])
    )
    .handler(async ({ context, input, errors }) => {
      const purchaseIds = [...new Set(input.purchaseIds)];

      const binPurchases = await context.db
        .select({ id: PurchaseTable.id })
        .from(PurchaseTable)
        .where(
          and(
            inArray(PurchaseTable.id, purchaseIds),
            isNotNull(PurchaseTable.deletedAt)
          )
        );

      if (binPurchases.length !== purchaseIds.length) {
        throw errors.NOT_IN_BIN();
      }

      await restorePurchases(context.db, purchaseIds);

      return apiResponse(API_MESSAGES.PURCHASE.RESTORE_ALL, {
        count: purchaseIds.length,
      });
    });
