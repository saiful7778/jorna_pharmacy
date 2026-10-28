import { and, asc, desc, eq, isNull, lt, sql, type SQL } from "drizzle-orm";
import type { BatchItem } from "drizzle-orm/batch";

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
    const { where, page, orderBy, offset, limit } = buildPaginateOptions(
      {
        customerId: CustomerPaymentTable.customerId,
      },
      input
    );

    const whereSql: Array<SQL> = [isNull(CustomerPaymentTable.deletedAt)];

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
          saleTotalAmount: SaleTable.totalAmount,
          saleCreatedAt: SaleTable.createdAt,
          amount: CustomerPaymentTable.amount,
          note: CustomerPaymentTable.note,
          createdAt: CustomerPaymentTable.createdAt,
        })
        .from(CustomerPaymentTable)
        .leftJoin(SaleTable, eq(CustomerPaymentTable.saleId, SaleTable.id))
        .leftJoin(
          SaleInvoiceTable,
          eq(SaleTable.invoiceId, SaleInvoiceTable.id)
        )
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
      .select({ id: CustomerTable.id })
      .from(CustomerTable)
      .where(
        and(eq(CustomerTable.id, customerId), isNull(CustomerTable.deletedAt))
      )
      .limit(1);

    if (!customer) {
      throw errors.CUSTOMER_NOT_FOUND();
    }

    // 1. Candidate sales
    const candidateSales = saleId
      ? await context.db
          .select({
            id: SaleTable.id,
            dueAmount:
              sql<number>`${SaleTable.totalAmount} - ${SaleTable.paidAmount}`.as(
                "due_amount"
              ),
          })
          .from(SaleTable)
          .where(
            and(
              eq(SaleTable.customerId, customerId),
              eq(SaleTable.id, saleId),
              isNull(SaleTable.deletedAt)
            )
          )
      : await context.db
          .select({
            id: SaleTable.id,
            dueAmount:
              sql<number>`${SaleTable.totalAmount} - ${SaleTable.paidAmount}`.as(
                "due_amount"
              ),
          })
          .from(SaleTable)
          .where(
            and(
              eq(SaleTable.customerId, customerId),
              lt(SaleTable.paidAmount, SaleTable.totalAmount),
              isNull(SaleTable.deletedAt)
            )
          )
          .orderBy(asc(SaleTable.createdAt));

    if (saleId && candidateSales.length === 0) throw errors.SALE_NOT_FOUND();

    // 2. Check the payment doesn't exceed the total due
    const totalDue = candidateSales.reduce((sum, s) => sum + s.dueAmount, 0);

    if (amount > totalDue) throw errors.PAYMENT_EXCEEDS();

    // 3. Pay each sale; if the amount is bigger than a sale's due, carry the rest forward
    let remaining = amount;
    const statements: Array<BatchItem<"sqlite">> = [];

    for (const sale of candidateSales) {
      if (remaining <= 0) break;

      const due = sale.dueAmount;
      const pay = Math.min(due, remaining);

      statements.push(
        context.db
          .update(SaleTable)
          .set({ paidAmount: sql`${SaleTable.paidAmount} + ${pay}` })
          .where(eq(SaleTable.id, sale.id)),
        context.db.insert(CustomerPaymentTable).values({
          customerId,
          saleId: sale.id,
          amount: pay,
          note,
          createdBy: context.user.id,
        })
      );

      remaining -= pay;
    }

    const [firstStatement, ...otherStatements] = statements;

    if (firstStatement) {
      await context.db.batch([firstStatement, ...otherStatements]);
    }

    return apiResponse(API_MESSAGES.CUSTOMER.PAYMENT.CREATE, null);
  });

export const customerPaymentStatsProcedure = customerImpl.payment.stats
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "customer_payment", action: "manage" },
      { level: "system", resource: "customer_payment", action: "read" },
    ])
  )
  .handler(async ({ context, input }) => {
    const customerPaginateOption = buildPaginateOptions(
      {
        customerId: CustomerPaymentTable.customerId,
      },
      input
    );
    const salerPaginateOption = buildPaginateOptions(
      {
        customerId: SaleTable.customerId,
      },
      input
    );

    const customerWhere: Array<SQL> = [isNull(CustomerPaymentTable.deletedAt)];
    const saleWhere: Array<SQL> = [isNull(SaleTable.deletedAt)];

    if (customerPaginateOption.where) {
      customerWhere.push(customerPaginateOption.where);
    }
    if (salerPaginateOption.where) {
      saleWhere.push(salerPaginateOption.where);
    }

    const [saleTotals, paymentTotals] = await Promise.all([
      context.db
        .select({
          totalSales: sql<number>`COALESCE(SUM(${SaleTable.totalAmount}), 0)`,
          count: sql<number>`COUNT(*)`,
          lastPurchaseAt: sql<number>`MAX(${SaleTable.createdAt})`,
        })
        .from(SaleTable)
        .where(and(...saleWhere)),
      context.db
        .select({
          total: sql<number>`COALESCE(SUM(${CustomerPaymentTable.amount}), 0)`,
          count: sql<number>`COUNT(*)`,
        })
        .from(CustomerPaymentTable)
        .where(and(...customerWhere)),
    ]);

    const totalSales = Number(saleTotals[0]?.totalSales ?? 0);
    const totalPaid = Number(paymentTotals[0]?.total ?? 0);
    const lastPurchaseAt = saleTotals[0]?.lastPurchaseAt;

    const dueAmount = totalSales - totalPaid;

    return apiResponse(API_MESSAGES.CUSTOMER.PAYMENT.GET_STATS, {
      totalPaid,
      dueAmount,
      saleCount: Number(saleTotals[0]?.count ?? 0),
      paymentCount: Number(paymentTotals[0]?.count ?? 0),
      totalSales,
      lastPurchaseAt: lastPurchaseAt ? new Date(lastPurchaseAt) : undefined,
    });
  });
