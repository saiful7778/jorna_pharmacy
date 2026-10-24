import { ORPCError } from "@orpc/client";
import { and, desc, eq, sql, type SQL } from "drizzle-orm";

import { API_MESSAGES } from "@/constants/apiMessage";
import {
  CustomerPaymentTable,
  CustomerTable,
  SaleInvoiceTable,
  SaleTable,
} from "@/db/schemas";
import { buildPaginateOptions, buildPaginationMeta } from "@/db/utils";
import { apiResponse } from "@/lib/apiResponse";
import { userPermissionMiddleware } from "@/oRPC/middleware/auth.middleware";

import { customerImpl } from "./customer.procedure";

export const listCustomerPaymentsProcedure = customerImpl.payment.list
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "customer_payment", action: "manage" },
      { level: "system", resource: "customer_payment", action: "read" },
    ])
  )
  .handler(async ({ context, input }) => {
    const { customerId, ...paginateInput } = input;

    const { where, page, orderBy, offset, limit } = buildPaginateOptions(
      {
        invoiceNo: SaleInvoiceTable.number,
        createdAt: CustomerPaymentTable.createdAt,
        amount: CustomerPaymentTable.amount,
      },
      paginateInput
    );

    const whereSql: Array<SQL> = [];

    if (customerId) {
      whereSql.push(eq(CustomerPaymentTable.customerId, customerId));
    }

    if (where) {
      whereSql.push(where);
    }

    const paymentWhere = and(...whereSql);

    const [totalCountResult, payments] = await Promise.all([
      context.db
        .select({ count: sql<number>`COUNT(*)` })
        .from(CustomerPaymentTable)
        .leftJoin(SaleTable, eq(CustomerPaymentTable.saleId, SaleTable.id))
        .where(paymentWhere),
      context.db
        .select({
          id: CustomerPaymentTable.id,
          customerId: CustomerPaymentTable.customerId,
          saleId: CustomerPaymentTable.saleId,
          invoiceNo: SaleInvoiceTable.number,
          amount: CustomerPaymentTable.amount,
          note: CustomerPaymentTable.note,
          createdAt: CustomerPaymentTable.createdAt,
        })
        .from(CustomerPaymentTable)
        .leftJoin(SaleTable, eq(CustomerPaymentTable.saleId, SaleTable.id))
        .where(paymentWhere)
        .orderBy(desc(CustomerPaymentTable.createdAt), orderBy)
        .limit(limit)
        .offset(offset),
    ]);

    const totalCount = Number(totalCountResult[0]?.count ?? 0);

    return apiResponse(API_MESSAGES.CUSTOMER.PAYMENT.GET_ALL, {
      meta: buildPaginationMeta(totalCount, payments.length, page, limit),
      data: payments,
    });
  });

export const createCustomerPaymentProcedure = customerImpl.payment.create
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "customer_payment", action: "manage" },
      { level: "system", resource: "customer_payment", action: "create" },
    ])
  )
  .handler(async ({ context, input, errors }) => {
    const { customerId, saleId, amount, note } = input;

    const [customer] = await context.db
      .select()
      .from(CustomerTable)
      .where(eq(CustomerTable.id, customerId))
      .limit(1);

    if (!customer) {
      throw errors.CUSTOMER_NOT_FOUND();
    }

    if (saleId) {
      const [sale] = await context.db
        .select()
        .from(SaleTable)
        .where(eq(SaleTable.id, saleId))
        .limit(1);

      if (!sale || sale.customerId !== customerId) {
        throw errors.SALE_NOT_FOUND();
      }

      if (amount > sale.totalAmount - sale.paidAmount) {
        throw errors.PAYMENT_EXCEEDS();
      }
    }

    const [payment] = await context.db
      .insert(CustomerPaymentTable)
      .values({
        customerId,
        saleId,
        amount,
        note,
        createdBy: context.user.id,
      })
      .returning();

    if (!payment) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: API_MESSAGES.CUSTOMER.PAYMENT.NOT_CREATE,
      });
    }

    if (saleId) {
      await context.db
        .update(SaleTable)
        .set({ paidAmount: sql`${SaleTable.paidAmount} + ${amount}` })
        .where(eq(SaleTable.id, saleId));
    }

    return apiResponse(API_MESSAGES.CUSTOMER.PAYMENT.CREATE, payment);
  });

export const customerPaymentStatsProcedure = customerImpl.payment.stats
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "customer_payment", action: "manage" },
      { level: "system", resource: "customer_payment", action: "read" },
    ])
  )
  .handler(async ({ context, input }) => {
    const { where } = buildPaginateOptions(
      {
        createdAt: CustomerPaymentTable.createdAt,
      },
      { filter: input.createdAt }
    );

    const customerWhere: Array<SQL> = [];

    if (input.customerId) {
      customerWhere.push(eq(CustomerPaymentTable.customerId, input.customerId));
    }
    if (where) {
      customerWhere.push(where);
    }

    const saleWhere: Array<SQL> = [];

    if (input.customerId) {
      saleWhere.push(eq(SaleTable.customerId, input.customerId));
    }

    const [paymentTotals, dueTotals] = await Promise.all([
      context.db
        .select({
          total: sql<number>`COALESCE(SUM(${CustomerPaymentTable.amount}), 0)`,
          count: sql<number>`COUNT(*)`,
        })
        .from(CustomerPaymentTable)
        .where(and(...customerWhere)),
      context.db
        .select({
          total: sql<number>`COALESCE(SUM(${SaleTable.totalAmount}), 0)`,
          count: sql<number>`COUNT(*)`,
          lastPurchaseAt: sql<number | null>`MAX(${SaleTable.createdAt})`,
        })
        .from(SaleTable)
        .where(and(...saleWhere)),
    ]);

    return apiResponse(API_MESSAGES.CUSTOMER.PAYMENT.GET_STATS, {
      totalPaid: Number(paymentTotals[0]?.total ?? 0),
      dueAmount: Number(dueTotals[0]?.total ?? 0),
      paymentCount: Number(paymentTotals[0]?.count ?? 0),
    });
  });
