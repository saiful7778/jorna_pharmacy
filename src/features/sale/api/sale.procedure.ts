import { implement } from "@orpc/server";
import { and, desc, eq, sql, type SQL } from "drizzle-orm";

import { API_MESSAGES } from "@/constants/apiMessage";
import {
  CustomerTable,
  SaleInvoiceTable,
  SaleItemTable,
  SaleTable,
} from "@/db/schemas";
import { buildPaginateOptions, buildPaginationMeta } from "@/db/utils";
import { apiResponse } from "@/lib/apiResponse";
import {
  authMiddleware,
  userPermissionMiddleware,
} from "@/oRPC/middleware/auth.middleware";
import { errorMiddleware } from "@/oRPC/middleware/error.middleware";
import type { ORPCContext } from "@/types/orpc.types";

import { saleContract } from "./sale.contract";

export const saleImpl = implement(saleContract)
  .$context<ORPCContext>()
  .use(authMiddleware)
  .use(errorMiddleware);

export const listSaleProcedure = saleImpl.list
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "sale", action: "manage" },
      { level: "system", resource: "sale", action: "list" },
    ])
  )
  .handler(async ({ context, input }) => {
    const { customerId, unpaidOnly, ...paginateInput } = input;

    const { where, page, offset, limit } = buildPaginateOptions(
      {
        invoiceNo: SaleInvoiceTable.number,
        customerName: CustomerTable.name,
        customerPhone: CustomerTable.phone,
        createdAt: SaleTable.createdAt,
      },
      paginateInput
    );

    const whereSql: Array<SQL> = [];

    if (customerId) {
      whereSql.push(eq(SaleTable.customerId, customerId));
    }

    if (unpaidOnly) {
      whereSql.push(sql`${SaleTable.totalAmount} > ${SaleTable.paidAmount}`);
    }

    if (where) {
      whereSql.push(where);
    }

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
        .where(and(...whereSql)),
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
        })
        .from(SaleTable)
        .innerJoin(
          SaleInvoiceTable,
          eq(SaleInvoiceTable.id, SaleTable.invoiceId)
        )
        .leftJoin(CustomerTable, eq(SaleTable.customerId, CustomerTable.id))
        .leftJoin(itemCounts, eq(itemCounts.saleId, SaleTable.id))
        .where(and(...whereSql))
        .orderBy(desc(SaleTable.createdAt))
        .limit(limit)
        .offset(offset),
    ]);

    const totalCount = Number(totalCountResult[0]?.count ?? 0);

    return apiResponse(API_MESSAGES.SALE.GET_ALL, {
      meta: buildPaginationMeta(totalCount, sales.length, page, limit),
      data: sales.map((sale) => ({
        ...sale,
        itemCount: Number(sale.itemCount),
      })),
    });
  });
