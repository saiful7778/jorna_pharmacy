import { implement, ORPCError } from "@orpc/server";
import { desc, eq, getTableColumns, gte, sql } from "drizzle-orm";

import { API_MESSAGES } from "@/constants/apiMessage";
import {
  RoleTable,
  SaleClosingTable,
  UserRoleTable,
  UserTable,
  type SaleClosingDataModel,
} from "@/db/schemas";
import { buildPaginateOptions, buildPaginationMeta } from "@/db/utils";
import {
  userProfileColumns,
  type UserProfileType,
} from "@/features/user/user.api-schema";
import { apiResponse } from "@/lib/apiResponse";
import {
  authMiddleware,
  userPermissionMiddleware,
} from "@/oRPC/middleware/auth.middleware";
import { errorMiddleware } from "@/oRPC/middleware/error.middleware";
import type { ORPCContext } from "@/types/orpc.types";

import { calculateExpectedCash } from "../saleClosing.calc";
import { saleClosingContract } from "./saleClosing.contract";

export const saleClosingImpl = implement(saleClosingContract)
  .$context<ORPCContext>()
  .use(authMiddleware)
  .use(errorMiddleware);

type SaleClosingWithUserType = SaleClosingDataModel & {
  closedByUser: UserProfileType | null;
};

function toSaleClosingResponse({
  closedByUser,
  ...closing
}: SaleClosingWithUserType) {
  return {
    ...closing,
    closedByUser: closedByUser
      ? {
          id: closedByUser.id,
          name: closedByUser.name,
          email: closedByUser.email,
          image: closedByUser.image,
          roles: closedByUser.roles,
        }
      : null,
    expectedCash: calculateExpectedCash(closing),
  };
}

export const listSaleClosingProcedure = saleClosingImpl.list
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "sale_closing", action: "manage" },
      { level: "system", resource: "sale_closing", action: "list" },
    ])
  )
  .handler(async ({ context, input }) => {
    const { where, page, orderBy, offset, limit } = buildPaginateOptions(
      {
        periodEnd: SaleClosingTable.periodEnd,
        totalSales: SaleClosingTable.totalSales,
      },
      input
    );

    const [totalCountResult, closings] = await Promise.all([
      context.db
        .select({ count: sql<number>`COUNT(*)` })
        .from(SaleClosingTable)
        .where(where),
      context.db
        .select({
          ...getTableColumns(SaleClosingTable),
          closedByUser: userProfileColumns,
        })
        .from(SaleClosingTable)
        .leftJoin(UserTable, eq(UserTable.id, SaleClosingTable.closedBy))
        .leftJoin(UserRoleTable, eq(UserRoleTable.userId, UserTable.id))
        .leftJoin(RoleTable, eq(RoleTable.id, UserRoleTable.roleId))
        .where(where)
        .orderBy(desc(SaleClosingTable.periodEnd), orderBy)
        .groupBy(SaleClosingTable.id, UserTable.id)
        .limit(limit)
        .offset(offset),
    ]);

    const totalCount = Number(totalCountResult[0]?.count ?? 0);

    return apiResponse(API_MESSAGES.SALE_CLOSING.GET_ALL, {
      meta: buildPaginationMeta(totalCount, closings.length, page, limit),
      data: closings.map(toSaleClosingResponse),
    });
  });

export const saleClosingStatsProcedure = saleClosingImpl.stats
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "sale_closing", action: "manage" },
      { level: "system", resource: "sale_closing", action: "list" },
    ])
  )
  .handler(async ({ context, input }) => {
    const { where } = buildPaginateOptions(
      {
        periodEnd: SaleClosingTable.periodEnd,
      },
      input
    );

    // Mirrors calculateExpectedCash in saleClosing.calc.ts
    const expectedCashSql = sql`(COALESCE(${SaleClosingTable.openingCash}, 0) + ${SaleClosingTable.cashReceived} - ${SaleClosingTable.totalExpenses} - ${SaleClosingTable.totalSalary} - COALESCE(${SaleClosingTable.companyPaid}, 0))`;

    const [stats] = await context.db
      .select({
        closingCount: sql<number>`COUNT(*)`,
        uncountedCount: sql<number>`COALESCE(SUM(CASE WHEN ${SaleClosingTable.countedCash} IS NULL THEN 1 ELSE 0 END), 0)`,
        totalSales: sql<number>`COALESCE(SUM(${SaleClosingTable.totalSales}), 0)`,
        cashReceived: sql<number>`COALESCE(SUM(${SaleClosingTable.cashReceived}), 0)`,
        netVariance: sql<number>`COALESCE(SUM(CASE WHEN ${SaleClosingTable.countedCash} IS NOT NULL THEN ${SaleClosingTable.countedCash} - ${expectedCashSql} ELSE 0 END), 0)`,
      })
      .from(SaleClosingTable)
      .where(where);

    return apiResponse(API_MESSAGES.SALE_CLOSING.GET_STATS, {
      closingCount: Number(stats?.closingCount ?? 0),
      uncountedCount: Number(stats?.uncountedCount ?? 0),
      totalSales: Number(stats?.totalSales ?? 0),
      cashReceived: Number(stats?.cashReceived ?? 0),
      netVariance: Number(stats?.netVariance ?? 0),
    });
  });

export const saleClosingCreateProcedure = saleClosingImpl.create
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "sale_closing", action: "manage" },
      { level: "system", resource: "sale_closing", action: "create" },
    ])
  )
  .handler(async ({ context, input, errors }) => {
    const now = new Date();
    const startOfToday = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    );

    const [closedToday] = await context.db
      .select({ id: SaleClosingTable.id })
      .from(SaleClosingTable)
      .where(gte(SaleClosingTable.periodEnd, startOfToday))
      .limit(1);

    if (closedToday) {
      throw errors.ALREADY_CLOSED_TODAY();
    }

    // Each period starts where the previous closing ended, so no sales are skipped
    const [lastClosing] = await context.db
      .select({
        lastPeriodEnd: sql<number | null>`MAX(${SaleClosingTable.periodEnd})`,
      })
      .from(SaleClosingTable);

    const periodStart = lastClosing?.lastPeriodEnd
      ? new Date(lastClosing.lastPeriodEnd)
      : startOfToday;

    const [created] = await context.db
      .insert(SaleClosingTable)
      .values({
        periodStart,
        periodEnd: now,
        totalSales: input.totalSales,
        cashReceived: input.totalSales,
        totalSalary: input.totalSalary,
        closedBy: context.user.id,
      })
      .returning();

    if (!created) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: API_MESSAGES.SALE_CLOSING.NOT_CREATE,
      });
    }

    return apiResponse(API_MESSAGES.SALE_CLOSING.CREATE, created);
  });

export const saleClosingDetailsProcedure = saleClosingImpl.details
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "sale_closing", action: "manage" },
      { level: "system", resource: "sale_closing", action: "read" },
    ])
  )
  .handler(async ({ context, input, errors }) => {
    const [closing] = await context.db
      .select({
        ...getTableColumns(SaleClosingTable),
        closedByUser: userProfileColumns,
      })
      .from(SaleClosingTable)
      .leftJoin(UserTable, eq(UserTable.id, SaleClosingTable.closedBy))
      .leftJoin(UserRoleTable, eq(UserRoleTable.userId, UserTable.id))
      .leftJoin(RoleTable, eq(RoleTable.id, UserRoleTable.roleId))
      .where(eq(SaleClosingTable.id, input.saleClosingId))
      .limit(1);

    if (!closing) {
      throw errors.NOT_FOUND();
    }

    return apiResponse(
      API_MESSAGES.SALE_CLOSING.GET_DETAILS,
      toSaleClosingResponse(closing)
    );
  });
