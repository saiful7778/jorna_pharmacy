import { ORPCError } from "@orpc/server";
import {
  and,
  desc,
  eq,
  inArray,
  isNotNull,
  isNull,
  sql,
  type SQL,
} from "drizzle-orm";
import type { BatchItem } from "drizzle-orm/batch";

import { API_MESSAGES } from "@/constants/apiMessage";
import type { DatabaseType } from "@/db/clients/drizzle-client";
import {
  CustomerPaymentTable,
  CustomerTable,
  PurchaseItemTable,
  SaleInvoiceTable,
  SaleItemTable,
  SaleTable,
} from "@/db/schemas";
import { buildPaginateOptions, buildPaginationMeta } from "@/db/utils";
import { apiResponse } from "@/lib/apiResponse";
import { userPermissionMiddleware } from "@/oRPC/middleware/auth.middleware";

import { saleImpl } from "./sale.procedure";

async function getSaleItemQuantities(
  db: DatabaseType,
  saleIds: Array<string>
): Promise<Map<string, number>> {
  const items = await db
    .select({
      purchaseItemId: SaleItemTable.purchaseItemId,
      qty: SaleItemTable.qty,
    })
    .from(SaleItemTable)
    .where(inArray(SaleItemTable.saleId, saleIds));

  const quantities = new Map<string, number>();

  for (const item of items) {
    quantities.set(
      item.purchaseItemId,
      (quantities.get(item.purchaseItemId) ?? 0) + item.qty
    );
  }

  return quantities;
}

function restockStatements(
  db: DatabaseType,
  quantities: Map<string, number>
): Array<BatchItem<"sqlite">> {
  return [...quantities].map(([purchaseItemId, qty]) =>
    db
      .update(PurchaseItemTable)
      .set({
        qtyRemaining: sql`${PurchaseItemTable.qtyRemaining} + ${qty}`,
      })
      .where(eq(PurchaseItemTable.id, purchaseItemId))
  );
}

async function softDeleteSales(
  db: DatabaseType,
  saleIds: Array<string>,
  userId: string
): Promise<void> {
  const deletedAt = new Date();
  const quantities = await getSaleItemQuantities(db, saleIds);

  const statements: Array<BatchItem<"sqlite">> = [
    ...restockStatements(db, quantities),
    db
      .update(CustomerPaymentTable)
      .set({ deletedAt, deletedBy: userId })
      .where(
        and(
          inArray(CustomerPaymentTable.saleId, saleIds),
          isNull(CustomerPaymentTable.deletedAt)
        )
      ),
    db
      .update(SaleTable)
      .set({ deletedAt, deletedBy: userId })
      .where(and(inArray(SaleTable.id, saleIds), isNull(SaleTable.deletedAt))),
  ];

  const [firstStatement, ...otherStatements] = statements;

  if (firstStatement) {
    await db.batch([firstStatement, ...otherStatements]);
  }
}

async function hasStockToRestoreSales(
  db: DatabaseType,
  saleIds: Array<string>
): Promise<boolean> {
  const quantities = await getSaleItemQuantities(db, saleIds);

  if (quantities.size === 0) {
    return true;
  }

  const batches = await db
    .select({
      id: PurchaseItemTable.id,
      qtyRemaining: PurchaseItemTable.qtyRemaining,
    })
    .from(PurchaseItemTable)
    .where(inArray(PurchaseItemTable.id, [...quantities.keys()]));

  if (batches.length !== quantities.size) {
    return false;
  }

  return batches.every(
    (batch) => batch.qtyRemaining >= (quantities.get(batch.id) ?? 0)
  );
}

async function restoreSales(
  db: DatabaseType,
  saleIds: Array<string>
): Promise<void> {
  const quantities = await getSaleItemQuantities(db, saleIds);

  const statements: Array<BatchItem<"sqlite">> = [
    ...[...quantities].map(([purchaseItemId, qty]) =>
      db
        .update(PurchaseItemTable)
        .set({
          qtyRemaining: sql`${PurchaseItemTable.qtyRemaining} - ${qty}`,
        })
        .where(eq(PurchaseItemTable.id, purchaseItemId))
    ),
    db
      .update(CustomerPaymentTable)
      .set({ deletedAt: null, deletedBy: null })
      .where(
        and(
          inArray(CustomerPaymentTable.saleId, saleIds),
          isNotNull(CustomerPaymentTable.deletedAt)
        )
      ),
    db
      .update(SaleTable)
      .set({ deletedAt: null, deletedBy: null })
      .where(
        and(inArray(SaleTable.id, saleIds), isNotNull(SaleTable.deletedAt))
      ),
  ];

  const [firstStatement, ...otherStatements] = statements;

  if (firstStatement) {
    await db.batch([firstStatement, ...otherStatements]);
  }
}

export const listSaleBinProcedure = saleImpl.listBin
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "sale", action: "manage" },
      { level: "system", resource: "sale", action: "delete" },
    ])
  )
  .handler(async ({ context, input }) => {
    const { where, page, offset, limit } = buildPaginateOptions(
      {
        invoiceNo: SaleInvoiceTable.number,
        customerId: CustomerTable.id,
        customerName: CustomerTable.name,
        customerPhone: CustomerTable.phone,
      },
      input
    );

    const binWhere: SQL | undefined = and(
      isNotNull(SaleTable.deletedAt),
      where
    );

    const itemCounts = context.db
      .select({
        saleId: SaleItemTable.saleId,
        itemCount: sql<number>`COUNT(*)`.as("item_count"),
      })
      .from(SaleItemTable)
      .groupBy(SaleItemTable.saleId)
      .as("sale_item_counts");

    const [totalCountResult, sales] = await Promise.all([
      context.db
        .select({ count: sql<number>`COUNT(*)` })
        .from(SaleTable)
        .innerJoin(
          SaleInvoiceTable,
          eq(SaleInvoiceTable.id, SaleTable.invoiceId)
        )
        .leftJoin(CustomerTable, eq(SaleTable.customerId, CustomerTable.id))
        .where(binWhere),
      context.db
        .select({
          id: SaleTable.id,
          invoiceNo: SaleInvoiceTable.number,
          customer: {
            id: CustomerTable.id,
            name: CustomerTable.name,
            phone: CustomerTable.phone,
          },
          itemCount: sql<number>`COALESCE(${itemCounts.itemCount}, 0)`,
          subtotal: SaleTable.subtotal,
          discount: SaleTable.discount,
          totalAmount: SaleTable.totalAmount,
          paidAmount: SaleTable.paidAmount,
          createdAt: SaleTable.createdAt,
          deletedAt: SaleTable.deletedAt,
        })
        .from(SaleTable)
        .innerJoin(
          SaleInvoiceTable,
          eq(SaleInvoiceTable.id, SaleTable.invoiceId)
        )
        .leftJoin(CustomerTable, eq(SaleTable.customerId, CustomerTable.id))
        .leftJoin(itemCounts, eq(itemCounts.saleId, SaleTable.id))
        .where(binWhere)
        .orderBy(desc(SaleTable.deletedAt))
        .limit(limit)
        .offset(offset),
    ]);

    const totalCount = Number(totalCountResult[0]?.count ?? 0);

    return apiResponse(API_MESSAGES.SALE.GET_ALL_BIN, {
      meta: buildPaginationMeta(totalCount, sales.length, page, limit),
      data: sales.map((sale) => ({
        ...sale,
        itemCount: Number(sale.itemCount),
      })),
    });
  });

export const deleteSaleProcedure = saleImpl.delete
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "sale", action: "manage" },
      { level: "system", resource: "sale", action: "delete" },
    ])
  )
  .handler(async ({ context, input, errors }) => {
    const [activeSale] = await context.db
      .select({ id: SaleTable.id })
      .from(SaleTable)
      .where(and(eq(SaleTable.id, input.saleId), isNull(SaleTable.deletedAt)))
      .limit(1);

    if (!activeSale) {
      throw errors.NOT_FOUND();
    }

    await softDeleteSales(context.db, [input.saleId], context.user.id);

    const [deletedSale] = await context.db
      .select()
      .from(SaleTable)
      .where(eq(SaleTable.id, input.saleId))
      .limit(1);

    if (!deletedSale) {
      throw errors.NOT_FOUND();
    }

    return apiResponse(API_MESSAGES.SALE.DELETE, deletedSale);
  });

export const deleteAllSaleProcedure = saleImpl.deleteAll
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "sale", action: "manage" },
      { level: "system", resource: "sale", action: "delete" },
    ])
  )
  .handler(async ({ context, input, errors }) => {
    const saleIds = [...new Set(input.saleIds)];

    const activeSales = await context.db
      .select({ id: SaleTable.id })
      .from(SaleTable)
      .where(and(inArray(SaleTable.id, saleIds), isNull(SaleTable.deletedAt)));

    if (activeSales.length !== saleIds.length) {
      throw errors.NOT_FOUND();
    }

    await softDeleteSales(context.db, saleIds, context.user.id);

    return apiResponse(API_MESSAGES.SALE.DELETE_ALL, { count: saleIds.length });
  });

export const removeSaleProcedure = saleImpl.remove
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "sale", action: "manage" },
      { level: "system", resource: "sale", action: "delete" },
    ])
  )
  .handler(async ({ context, input, errors }) => {
    const [binSale] = await context.db
      .select({ id: SaleTable.id })
      .from(SaleTable)
      .where(
        and(eq(SaleTable.id, input.saleId), isNotNull(SaleTable.deletedAt))
      )
      .limit(1);

    if (!binSale) {
      throw errors.NOT_IN_BIN();
    }

    const [, , [removedSale]] = await context.db.batch([
      context.db
        .delete(CustomerPaymentTable)
        .where(eq(CustomerPaymentTable.saleId, input.saleId)),
      context.db
        .delete(SaleItemTable)
        .where(eq(SaleItemTable.saleId, input.saleId)),
      context.db
        .delete(SaleTable)
        .where(eq(SaleTable.id, input.saleId))
        .returning(),
    ]);

    if (!removedSale) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: API_MESSAGES.SALE.NOT_DELETE,
      });
    }

    return apiResponse(API_MESSAGES.SALE.REMOVE, removedSale);
  });

export const removeAllSaleProcedure = saleImpl.removeAll
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "sale", action: "manage" },
      { level: "system", resource: "sale", action: "delete" },
    ])
  )
  .handler(async ({ context, input, errors }) => {
    const saleIds = [...new Set(input.saleIds)];

    const binSales = await context.db
      .select({ id: SaleTable.id })
      .from(SaleTable)
      .where(
        and(inArray(SaleTable.id, saleIds), isNotNull(SaleTable.deletedAt))
      );

    if (binSales.length !== saleIds.length) {
      throw errors.NOT_IN_BIN();
    }

    const [, , removedSales] = await context.db.batch([
      context.db
        .delete(CustomerPaymentTable)
        .where(inArray(CustomerPaymentTable.saleId, saleIds)),
      context.db
        .delete(SaleItemTable)
        .where(inArray(SaleItemTable.saleId, saleIds)),
      context.db
        .delete(SaleTable)
        .where(inArray(SaleTable.id, saleIds))
        .returning({ id: SaleTable.id }),
    ]);

    return apiResponse(API_MESSAGES.SALE.REMOVE_ALL, {
      count: removedSales.length,
    });
  });

export const restoreSaleProcedure = saleImpl.restore
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "sale", action: "manage" },
      { level: "system", resource: "sale", action: "delete" },
    ])
  )
  .handler(async ({ context, input, errors }) => {
    const [binSale] = await context.db
      .select({ id: SaleTable.id })
      .from(SaleTable)
      .where(
        and(eq(SaleTable.id, input.saleId), isNotNull(SaleTable.deletedAt))
      )
      .limit(1);

    if (!binSale) {
      throw errors.NOT_IN_BIN();
    }

    if (!(await hasStockToRestoreSales(context.db, [input.saleId]))) {
      throw errors.NOT_ENOUGH_STOCK_TO_RESTORE();
    }

    await restoreSales(context.db, [input.saleId]);

    const [restoredSale] = await context.db
      .select()
      .from(SaleTable)
      .where(eq(SaleTable.id, input.saleId))
      .limit(1);

    if (!restoredSale) {
      throw errors.NOT_FOUND();
    }

    return apiResponse(API_MESSAGES.SALE.RESTORE, restoredSale);
  });

export const restoreAllSaleProcedure = saleImpl.restoreAll
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "sale", action: "manage" },
      { level: "system", resource: "sale", action: "delete" },
    ])
  )
  .handler(async ({ context, input, errors }) => {
    const saleIds = [...new Set(input.saleIds)];

    const binSales = await context.db
      .select({ id: SaleTable.id })
      .from(SaleTable)
      .where(
        and(inArray(SaleTable.id, saleIds), isNotNull(SaleTable.deletedAt))
      );

    if (binSales.length !== saleIds.length) {
      throw errors.NOT_IN_BIN();
    }

    if (!(await hasStockToRestoreSales(context.db, saleIds))) {
      throw errors.NOT_ENOUGH_STOCK_TO_RESTORE();
    }

    await restoreSales(context.db, saleIds);

    return apiResponse(API_MESSAGES.SALE.RESTORE_ALL, {
      count: saleIds.length,
    });
  });
