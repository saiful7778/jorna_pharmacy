import { and, asc, desc, eq, lt, sql, type SQL } from "drizzle-orm";

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
      .where(eq(CustomerTable.id, customerId))
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
            and(eq(SaleTable.customerId, customerId), eq(SaleTable.id, saleId))
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
              lt(SaleTable.paidAmount, SaleTable.totalAmount)
            )
          )
          .orderBy(asc(SaleTable.createdAt));

    if (saleId && candidateSales.length === 0) throw errors.SALE_NOT_FOUND();

    // 2. Check the payment doesn't exceed the total due
    const totalDue = candidateSales.reduce((sum, s) => sum + s.dueAmount, 0);

    console.log(candidateSales);

    if (amount > totalDue) throw errors.PAYMENT_EXCEEDS();

    // 3. Pay each sale; if the amount is bigger than a sale's due, carry the rest forward
    let remaining = amount;
    const payments = [];

    for (const sale of candidateSales) {
      if (remaining <= 0) break;

      const due = sale.dueAmount;
      const pay = Math.min(due, remaining);

      await context.db
        .update(SaleTable)
        .set({ paidAmount: sql`${SaleTable.paidAmount} + ${pay}` })
        .where(eq(SaleTable.id, sale.id));

      const [payment] = await context.db
        .insert(CustomerPaymentTable)
        .values({
          customerId,
          saleId: sale.id,
          amount: pay,
          note,
          createdBy: context.user.id,
        })
        .returning();

      payments.push(payment);
      remaining -= pay;
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
    const { where } = buildPaginateOptions(
      {
        createdAt: CustomerPaymentTable.createdAt,
      },
      { filter: input.createdAt }
    );

    const customerWhere: Array<SQL> = [];
    const saleWhere: Array<SQL> = [];

    if (input.customerId) {
      customerWhere.push(eq(CustomerPaymentTable.customerId, input.customerId));
      saleWhere.push(eq(SaleTable.customerId, input.customerId));
    }
    if (where) {
      customerWhere.push(where);
    }

    const [paymentTotals, saleTotals] = await Promise.all([
      // Get total paid amount
      context.db
        .select({
          total: sql<number>`COALESCE(SUM(${CustomerPaymentTable.amount}), 0)`,
          count: sql<number>`COUNT(*)`,
        })
        .from(CustomerPaymentTable)
        .where(and(...customerWhere)),

      // Get total sales amount and paid amount from sales table
      context.db
        .select({
          totalSales: sql<number>`COALESCE(SUM(${SaleTable.totalAmount}), 0)`,
          totalPaid: sql<number>`COALESCE(SUM(${SaleTable.paidAmount}), 0)`,
          count: sql<number>`COUNT(*)`,
          lastPurchaseAt: sql<number>`MAX(${SaleTable.createdAt})`,
        })
        .from(SaleTable)
        .where(and(...saleWhere)),
    ]);

    const totalSales = Number(saleTotals[0]?.totalSales ?? 0);
    const totalPaidFromSales = Number(saleTotals[0]?.totalPaid ?? 0);
    const totalPaidFromPayments = Number(paymentTotals[0]?.total ?? 0);
    const lastPurchaseAt = saleTotals[0]?.lastPurchaseAt;

    // Due amount = Total sales - Total paid (from sales table)
    const dueAmount = totalSales - totalPaidFromSales;

    return apiResponse(API_MESSAGES.CUSTOMER.PAYMENT.GET_STATS, {
      totalPaid: totalPaidFromPayments,
      dueAmount,
      paymentCount: Number(paymentTotals[0]?.count ?? 0),
      totalSales,
      lastPurchaseAt: lastPurchaseAt ? new Date(lastPurchaseAt) : undefined,
    });
  });
