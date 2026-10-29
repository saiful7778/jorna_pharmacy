import { and, asc, desc, eq, isNull, lt, sql, type SQL } from "drizzle-orm";
import type { BatchItem } from "drizzle-orm/batch";

import { API_MESSAGES } from "@/constants/apiMessage";
import { CompanyPaymentTable, CompanyTable, PurchaseTable } from "@/db/schemas";
import { buildPaginateOptions, buildPaginationMeta } from "@/db/utils";
import { apiResponse } from "@/lib/apiResponse";
import { userPermissionMiddleware } from "@/oRPC/middleware/auth.middleware";

import { companyImpl } from "./company.procedure";

export const listCompanyPaymentsProcedure = companyImpl.payment.list
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "company_payment", action: "manage" },
      { level: "system", resource: "company_payment", action: "read" },
    ])
  )
  .handler(async ({ context, input }) => {
    const { where, page, orderBy, offset, limit } = buildPaginateOptions(
      {
        amount: CompanyPaymentTable.amount,
        companyId: CompanyPaymentTable.companyId,
      },
      input
    );

    const whereSql: Array<SQL> = [isNull(CompanyPaymentTable.deletedAt)];

    if (where) {
      whereSql.push(where);
    }

    const paymentWhere = and(...whereSql);

    const [totalCountResult, payments] = await Promise.all([
      context.db
        .select({ count: sql<number>`COUNT(*)` })
        .from(CompanyPaymentTable)
        .where(paymentWhere),
      context.db
        .select({
          id: CompanyPaymentTable.id,
          companyId: CompanyPaymentTable.companyId,
          purchaseId: CompanyPaymentTable.purchaseId,
          purchaseInvoiceNo: PurchaseTable.companyInvoiceNo,
          purchaseTotalAmount: PurchaseTable.totalAmount,
          purchasePaidAmount: PurchaseTable.paidAmount,
          amount: CompanyPaymentTable.amount,
          note: CompanyPaymentTable.note,
          createdAt: CompanyPaymentTable.createdAt,
        })
        .from(CompanyPaymentTable)
        .leftJoin(
          PurchaseTable,
          eq(PurchaseTable.id, CompanyPaymentTable.purchaseId)
        )
        .where(paymentWhere)
        .orderBy(desc(CompanyPaymentTable.createdAt), orderBy)
        .limit(limit)
        .offset(offset),
    ]);

    const totalCount = Number(totalCountResult[0]?.count ?? 0);

    const data = payments.map(
      ({
        purchaseInvoiceNo,
        purchaseTotalAmount,
        purchasePaidAmount,
        ...payment
      }) => ({
        ...payment,
        purchase:
          purchaseTotalAmount === null || purchasePaidAmount === null
            ? null
            : {
                companyInvoiceNo: purchaseInvoiceNo,
                totalAmount: purchaseTotalAmount,
                paidAmount: purchasePaidAmount,
                dueAmount: Math.max(
                  purchaseTotalAmount - purchasePaidAmount,
                  0
                ),
              },
      })
    );

    return apiResponse(API_MESSAGES.COMPANY.PAYMENT.GET_ALL, {
      meta: buildPaginationMeta(totalCount, payments.length, page, limit),
      data,
    });
  });

export const createCompanyPaymentProcedure = companyImpl.payment.create
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "company_payment", action: "manage" },
      { level: "system", resource: "company_payment", action: "create" },
    ])
  )
  .handler(async ({ context, input, errors }) => {
    const { companyId, purchaseId, amount, note } = input;

    const [company] = await context.db
      .select({ id: CompanyTable.id })
      .from(CompanyTable)
      .where(
        and(eq(CompanyTable.id, companyId), isNull(CompanyTable.deletedAt))
      )
      .limit(1);

    if (!company) {
      throw errors.COMPANY_NOT_FOUND();
    }

    // 1. Candidate purchase
    const candidatePurchases = purchaseId
      ? await context.db
          .select({
            id: PurchaseTable.id,
            dueAmount:
              sql<number>`${PurchaseTable.totalAmount} - ${PurchaseTable.paidAmount}`.as(
                "due_amount"
              ),
          })
          .from(PurchaseTable)
          .where(
            and(
              eq(PurchaseTable.companyId, companyId),
              eq(PurchaseTable.id, purchaseId),
              isNull(PurchaseTable.deletedAt)
            )
          )
          .limit(1)
      : await context.db
          .select({
            id: PurchaseTable.id,
            dueAmount:
              sql<number>`${PurchaseTable.totalAmount} - ${PurchaseTable.paidAmount}`.as(
                "due_amount"
              ),
          })
          .from(PurchaseTable)
          .where(
            and(
              eq(PurchaseTable.companyId, companyId),
              lt(PurchaseTable.paidAmount, PurchaseTable.totalAmount),
              isNull(PurchaseTable.deletedAt)
            )
          )
          .orderBy(asc(PurchaseTable.createdAt));

    if (purchaseId && candidatePurchases.length === 0)
      throw errors.PURCHASE_NOT_FOUND();

    // 2. Check the payment doesn't exceed the total due
    const totalDue = candidatePurchases.reduce(
      (sum, s) => sum + s.dueAmount,
      0
    );

    if (amount > totalDue) throw errors.PAYMENT_EXCEEDS();

    // 3. Pay each purchase; if the amount is bigger than a purchase's due, carry the rest forward
    let remaining = amount;
    const statements: Array<BatchItem<"sqlite">> = [];

    for (const purchase of candidatePurchases) {
      if (remaining <= 0) break;

      const due = purchase.dueAmount;
      const pay = Math.min(due, remaining);

      statements.push(
        context.db
          .update(PurchaseTable)
          .set({ paidAmount: sql`${PurchaseTable.paidAmount} + ${pay}` })
          .where(eq(PurchaseTable.id, purchase.id)),
        context.db.insert(CompanyPaymentTable).values({
          companyId,
          purchaseId: purchase.id,
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

    return apiResponse(API_MESSAGES.COMPANY.PAYMENT.CREATE, null);
  });

export const companyPaymentStatsProcedure = companyImpl.payment.stats
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "company_payment", action: "manage" },
      { level: "system", resource: "company_payment", action: "read" },
    ])
  )
  .handler(async ({ context, input }) => {
    const companyPaginateOption = buildPaginateOptions(
      {
        companyId: CompanyPaymentTable.companyId,
        createdAt: CompanyPaymentTable.createdAt,
      },
      input
    );
    const purchasePaginateOption = buildPaginateOptions(
      {
        companyId: PurchaseTable.companyId,
        createdAt: PurchaseTable.createdAt,
      },
      input
    );

    const companyWhere: Array<SQL> = [isNull(CompanyPaymentTable.deletedAt)];
    const purchaseWhere: Array<SQL> = [isNull(PurchaseTable.deletedAt)];

    if (companyPaginateOption.where) {
      companyWhere.push(companyPaginateOption.where);
    }
    if (purchasePaginateOption.where) {
      purchaseWhere.push(purchasePaginateOption.where);
    }

    const [paymentTotals, purchaseTotals] = await Promise.all([
      // Get total paid amount
      context.db
        .select({
          total: sql<number>`COALESCE(SUM(${CompanyPaymentTable.amount}), 0)`,
          count: sql<number>`COUNT(*)`,
        })
        .from(CompanyPaymentTable)
        .where(and(...companyWhere)),

      // Get total sales amount and paid amount from sales table
      context.db
        .select({
          totalPurchases: sql<number>`COALESCE(SUM(${PurchaseTable.totalAmount}), 0)`,
          count: sql<number>`COUNT(*)`,
          lastPurchaseAt: sql<number>`MAX(${PurchaseTable.createdAt})`,
        })
        .from(PurchaseTable)
        .where(and(...purchaseWhere)),
    ]);

    const totalPurchases = Number(purchaseTotals[0]?.totalPurchases ?? 0);
    const totalPaid = Number(paymentTotals[0]?.total ?? 0);
    const lastPurchaseAt = purchaseTotals[0]?.lastPurchaseAt;

    const dueAmount = totalPurchases - totalPaid;

    return apiResponse(API_MESSAGES.COMPANY.PAYMENT.GET_STATS, {
      totalPaid,
      dueAmount,
      purchaseCount: Number(purchaseTotals[0]?.count ?? 0),
      paymentCount: Number(paymentTotals[0]?.count ?? 0),
      totalPurchases,
      lastPurchaseAt: lastPurchaseAt ? new Date(lastPurchaseAt) : undefined,
    });
  });
