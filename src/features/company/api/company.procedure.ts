import { implement, ORPCError } from "@orpc/server";
import type { SQL } from "drizzle-orm";
import { and, asc, desc, eq, getTableColumns, isNull, sql } from "drizzle-orm";

import { API_MESSAGES } from "@/constants/apiMessage";
import {
  CompanyPaymentTable,
  CompanyTable,
  PurchaseTable,
  type InsertCompany,
} from "@/db/schemas";
import { buildPaginateOptions, buildPaginationMeta } from "@/db/utils";
import { apiResponse } from "@/lib/apiResponse";
import {
  authMiddleware,
  userPermissionMiddleware,
} from "@/oRPC/middleware/auth.middleware";
import { errorMiddleware } from "@/oRPC/middleware/error.middleware";
import type { ORPCContext } from "@/types/orpc.types";

import { companyContract } from "./company.contract";

export const companyImpl = implement(companyContract)
  .$context<ORPCContext>()
  .use(authMiddleware)
  .use(errorMiddleware);

export const listCompanyProcedure = companyImpl.list
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "company", action: "manage" },
      { level: "system", resource: "company", action: "list" },
    ])
  )
  .handler(async ({ context, input }) => {
    const { where, page, offset, limit } = buildPaginateOptions(
      {
        name: CompanyTable.name,
        phone: CompanyTable.phone,
        address: CompanyTable.address,
        createdAt: CompanyTable.createdAt,
      },
      input
    );

    const purchaseByCompany = context.db
      .select({
        companyId: PurchaseTable.companyId,
        totalPurchases:
          sql<number>`COALESCE(SUM(${PurchaseTable.totalAmount}), 0)`.as(
            "total_purchases"
          ),
        totalPaid:
          sql<number>`COALESCE(SUM(${PurchaseTable.paidAmount}), 0)`.as(
            "total_purchases"
          ),
        lastPurchaseAt: sql<number | null>`MAX(${PurchaseTable.createdAt})`.as(
          "last_purchase_at"
        ),
      })
      .from(PurchaseTable)
      .where(isNull(PurchaseTable.deletedAt))
      .groupBy(PurchaseTable.companyId)
      .as("purchases_by_company");

    const [totalCount, companies] = await Promise.all([
      context.db.$count(CompanyTable, isNull(CompanyTable.deletedAt)),
      context.db
        .select({
          ...getTableColumns(CompanyTable),
          dueAmount:
            sql<number>`COALESCE(${purchaseByCompany.totalPurchases}, 0) - COALESCE(${purchaseByCompany.totalPaid}, 0)`.as(
              "due_amount"
            ),
          lastPurchaseAt: purchaseByCompany.lastPurchaseAt,
        })
        .from(CompanyTable)
        .leftJoin(
          purchaseByCompany,
          eq(purchaseByCompany.companyId, CompanyTable.id)
        )
        .where(and(isNull(CompanyTable.deletedAt), where))
        .offset(offset)
        .limit(limit)
        .orderBy(desc(CompanyTable.createdAt)),
    ]);

    return apiResponse(API_MESSAGES.COMPANY.GET_ALL, {
      meta: buildPaginationMeta(totalCount, companies.length, page, limit),
      data: companies.map(({ lastPurchaseAt, ...company }) => ({
        ...company,
        lastPurchaseAt: lastPurchaseAt ? new Date(lastPurchaseAt) : null,
      })),
    });
  });

export const listCompanyForSearchProcedure = companyImpl.listForSearch
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "company", action: "manage" },
      { level: "system", resource: "company", action: "list" },
    ])
  )
  .handler(async ({ context, input }) => {
    const { where, limit } = buildPaginateOptions(
      {
        name: CompanyTable.name,
        phone: CompanyTable.phone,
        address: CompanyTable.address,
      },
      input
    );

    const customers = await context.db
      .select({
        id: CompanyTable.id,
        name: CompanyTable.name,
        phone: CompanyTable.phone,
        address: CompanyTable.address,
      })
      .from(CompanyTable)
      .where(
        and(
          eq(CompanyTable.isActive, true),
          isNull(CompanyTable.deletedAt),
          where
        )
      )
      .orderBy(asc(CompanyTable.name))
      .limit(limit);

    return apiResponse(API_MESSAGES.COMPANY.GET_ALL_FOR_SEARCH, customers);
  });

export const companyCreateProcedure = companyImpl.create
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "company", action: "manage" },
      { level: "system", resource: "company", action: "create" },
    ])
  )
  .handler(async ({ context, input }) => {
    const [newCompany] = await context.db
      .insert(CompanyTable)
      .values(input satisfies InsertCompany)
      .returning();

    if (!newCompany) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: API_MESSAGES.COMPANY.NOT_CREATE,
      });
    }

    return apiResponse(API_MESSAGES.COMPANY.CREATE, newCompany);
  });

export const updateCompanyProcedure = companyImpl.update
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "company", action: "manage" },
      { level: "system", resource: "company", action: "update" },
    ])
  )
  .handler(async ({ context, input, errors }) => {
    const { companyId, ...data } = input;

    const [existCompany] = await context.db
      .select()
      .from(CompanyTable)
      .where(
        and(eq(CompanyTable.id, companyId), isNull(CompanyTable.deletedAt))
      )
      .limit(1);

    if (!existCompany) {
      throw errors.NOT_FOUND();
    }

    if (Object.keys(data).length === 0) {
      return apiResponse(API_MESSAGES.COMPANY.UPDATE, existCompany);
    }

    const [updatedCompany] = await context.db
      .update(CompanyTable)
      .set(data)
      .where(eq(CompanyTable.id, companyId))
      .returning();

    if (!updatedCompany) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: API_MESSAGES.COMPANY.NOT_UPDATE,
      });
    }

    return apiResponse(API_MESSAGES.COMPANY.UPDATE, updatedCompany);
  });

export const companyDetailsProcedure = companyImpl.details
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "company", action: "manage" },
      { level: "system", resource: "company", action: "read" },
    ])
  )
  .handler(async ({ context, input, errors }) => {
    const [company] = await context.db
      .select()
      .from(CompanyTable)
      .where(
        and(
          eq(CompanyTable.id, input.companyId),
          isNull(CompanyTable.deletedAt)
        )
      )
      .limit(1);

    if (!company) {
      throw errors.NOT_FOUND();
    }

    const purchaseTotalWhere: Array<SQL> = [
      eq(PurchaseTable.companyId, input.companyId),
      isNull(PurchaseTable.deletedAt),
    ];
    const paymentTotalWhere: Array<SQL> = [
      eq(CompanyPaymentTable.companyId, input.companyId),
      isNull(CompanyPaymentTable.deletedAt),
    ];

    const [purchaseTotals, paymentTotals] = await Promise.all([
      context.db
        .select({
          totalPurchases:
            sql<number>`COALESCE(SUM(${PurchaseTable.totalAmount}), 0)`.as(
              "total_purchases"
            ),
          count: sql<number>`COUNT(*)`,
          lastPurchaseAt: sql<
            number | null
          >`MAX(${PurchaseTable.createdAt})`.as("last_purchase_at"),
        })
        .from(PurchaseTable)
        .where(and(...purchaseTotalWhere)),
      context.db
        .select({
          total: sql<number>`COALESCE(SUM(${CompanyPaymentTable.amount}), 0)`,
          count: sql<number>`COUNT(*)`,
        })
        .from(CompanyPaymentTable)
        .where(and(...paymentTotalWhere)),
    ]);

    const totalPurchases = Number(purchaseTotals[0]?.totalPurchases ?? 0);
    const totalPaid = Number(paymentTotals[0]?.total ?? 0);
    const lastPurchaseAt = purchaseTotals[0]?.lastPurchaseAt;

    const dueAmount = totalPurchases - totalPaid;

    return apiResponse(API_MESSAGES.COMPANY.GET_DETAILS, {
      ...company,
      summary: {
        totalPaid,
        dueAmount,
        purchaseCount: Number(purchaseTotals[0]?.count ?? 0),
        paymentCount: Number(paymentTotals[0]?.count ?? 0),
        totalPurchases,
        lastPurchaseAt: lastPurchaseAt ? new Date(lastPurchaseAt) : undefined,
      },
    });
  });
