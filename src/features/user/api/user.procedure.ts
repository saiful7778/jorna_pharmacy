import { implement, ORPCError } from "@orpc/server";
import {
  and,
  countDistinct,
  eq,
  gt,
  gte,
  isNull,
  lte,
  max,
  ne,
  or,
} from "drizzle-orm";

import { API_MESSAGES } from "@/constants/apiMessage";
import {
  RoleTable,
  UserDeviceTable,
  UserEventTable,
  UserRoleTable,
  UserSessionTable,
  UserTable,
} from "@/db/schemas";
import { buildPaginateOptions, buildPaginationMeta } from "@/db/utils";
import { getAuth } from "@/features/auth/auth.server";
import { apiResponse } from "@/lib/apiResponse";
import {
  authMiddleware,
  userPermissionMiddleware,
  userRoleMiddleware,
} from "@/oRPC/middleware/auth.middleware";
import { errorMiddleware } from "@/oRPC/middleware/error.middleware";
import type { ORPCContext } from "@/types/orpc.types";

import { roleColumnSql, userProfileColumns } from "../user.api-schema";
import { userContract } from "./user.contract";

export const userImpl = implement(userContract)
  .$context<ORPCContext>()
  .use(authMiddleware)
  .use(errorMiddleware);

export const listUserProcedure = userImpl.list
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "user", action: "manage" },
      { level: "system", resource: "user", action: "list" },
    ])
  )
  .handler(async ({ context, input }) => {
    const { where, orderBy, limit, offset, page } = buildPaginateOptions(
      {
        name: UserTable.name,
        email: UserTable.email,
        createdAt: UserTable.createdAt,
        updatedAt: UserTable.updatedAt,
      },
      input
    );

    const lastLoginSq = context.db
      .select({
        userId: UserSessionTable.userId,
        lastLogin: max(UserSessionTable.loginAt).as("last_login"),
      })
      .from(UserSessionTable)
      .groupBy(UserSessionTable.userId)
      .as("last_login_sq");

    const [totalCount, users] = await Promise.all([
      context.db.$count(UserTable),
      context.db
        .select({
          id: UserTable.id,
          name: UserTable.name,
          email: UserTable.email,
          emailVerified: UserTable.emailVerified,
          image: UserTable.image,
          role: UserTable.role,
          roles: roleColumnSql,
          banned: UserTable.banned,
          banReason: UserTable.banReason,
          banExpires: UserTable.banExpires,
          timezone: UserTable.timezone,
          locale: UserTable.locale,
          currency: UserTable.currency,
          createdAt: UserTable.createdAt,
          updatedAt: UserTable.updatedAt,
          lastLogin: lastLoginSq.lastLogin,
        })
        .from(UserTable)
        .leftJoin(lastLoginSq, eq(lastLoginSq.userId, UserTable.id))
        .innerJoin(UserRoleTable, eq(UserRoleTable.userId, UserTable.id))
        .innerJoin(RoleTable, eq(UserRoleTable.roleId, RoleTable.id))
        .where(where)
        .groupBy(({ id, lastLogin }) => [id, lastLogin])
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),
    ]);

    const meta = buildPaginationMeta(totalCount, users.length, page, limit);

    return apiResponse(API_MESSAGES.USER.GET_ALL, { meta, data: users });
  });

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function calcGrowth(previous: number, current: number): number | null {
  if (previous === 0) return null; // avoid division by zero — no data last period
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export const userStatsProcedure = userImpl.stats
  .use(userRoleMiddleware(["ADMIN", "SUPER_ADMIN"]))
  .handler(async ({ context }) => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const thisWeekStart = daysAgo(7);
    const lastWeekStart = daysAgo(14);
    const thisMonthStart = daysAgo(30);
    const lastMonthStart = daysAgo(60);

    const allData = await Promise.all([
      // Total registered users
      context.db.$count(UserTable),

      // Total users 30 days ago (to compute growth)
      context.db.$count(UserTable, lte(UserTable.createdAt, thisMonthStart)),

      // Active now
      context.db
        .select({ count: countDistinct(UserSessionTable.userId) })
        .from(UserSessionTable)
        .where(
          and(
            gte(UserSessionTable.lastSeenAt, fiveMinutesAgo),
            isNull(UserSessionTable.logoutAt)
          )
        ),

      // WAU: unique logins in last 7 days
      context.db
        .select({ count: countDistinct(UserSessionTable.userId) })
        .from(UserSessionTable)
        .where(gte(UserSessionTable.loginAt, thisWeekStart)),

      // Last WAU: unique logins in the 7 days before that
      context.db
        .select({ count: countDistinct(UserSessionTable.userId) })
        .from(UserSessionTable)
        .where(
          and(
            gte(UserSessionTable.loginAt, lastWeekStart),
            lte(UserSessionTable.loginAt, thisWeekStart)
          )
        ),

      // MAU: unique logins in last 30 days
      context.db
        .select({ count: countDistinct(UserSessionTable.userId) })
        .from(UserSessionTable)
        .where(gte(UserSessionTable.loginAt, thisMonthStart)),

      // Last MAU: unique logins in the 30 days before that
      context.db
        .select({ count: countDistinct(UserSessionTable.userId) })
        .from(UserSessionTable)
        .where(
          and(
            gte(UserSessionTable.loginAt, lastMonthStart),
            lte(UserSessionTable.loginAt, thisMonthStart)
          )
        ),

      // Active sessions: not logged out and not expired
      context.db
        .select({ count: countDistinct(UserSessionTable.id) })
        .from(UserSessionTable)
        .where(
          and(
            isNull(UserSessionTable.logoutAt),
            or(
              isNull(UserSessionTable.expiresAt),
              gt(UserSessionTable.expiresAt, new Date())
            )
          )
        ),

      // Known devices across all users
      context.db.$count(UserDeviceTable),

      // New devices first seen in the last 7 days
      context.db.$count(
        UserDeviceTable,
        gte(UserDeviceTable.firstSeenAt, thisWeekStart)
      ),

      // Failed sign-in attempts in the last 24 hours
      context.db.$count(
        UserEventTable,
        and(
          eq(UserEventTable.event, "auth.login_failed"),
          gte(UserEventTable.createdAt, daysAgo(1))
        )
      ),
    ]);

    const totalUsers = allData[0];
    const lastMonthTotal = allData[1];
    const activeNow = allData[2][0];
    const wau = allData[3][0];
    const lastWau = allData[4][0];
    const mau = allData[5][0];
    const lastMau = allData[6][0];
    const activeSessions = allData[7][0];
    const totalDevices = allData[8];
    const newDevices = allData[9];
    const failedLogins = allData[10];

    const wauCount = wau ? wau.count : 0;
    const lastWauCount = lastWau ? lastWau.count : 0;
    const mauCount = mau ? mau.count : 0;
    const lastMauCount = lastMau ? lastMau.count : 0;

    return apiResponse(API_MESSAGES.USER.GET_STATS, {
      totalUsers,
      totalUsersGrowth: calcGrowth(lastMonthTotal, totalUsers),
      activeNow: activeNow ? activeNow.count : 0,
      activeSessions: activeSessions ? activeSessions.count : 0,
      wau: wauCount,
      wauGrowth: calcGrowth(lastWauCount, wauCount),
      mau: mauCount,
      mauGrowth: calcGrowth(lastMauCount, mauCount),
      totalDevices,
      newDevices,
      failedLogins,
    });
  });

export const updateUserRoleProcedure = userImpl.updateRole
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "user", action: "manage" },
      { level: "system", resource: "user", action: "update" },
    ])
  )
  .handler(async ({ input, context, errors }) => {
    const [existUser] = await context.db
      .select({
        id: UserTable.id,
      })
      .from(UserTable)
      .where(eq(UserTable.id, input.userId))
      .limit(1);

    if (!existUser) {
      throw errors.NOT_FOUND();
    }

    const roles = await context.db
      .select({ id: RoleTable.id })
      .from(RoleTable)
      .where(eq(RoleTable.roleName, input.roleName));

    if (roles.length === 0) {
      throw new ORPCError("NOT_FOUND", {
        message: API_MESSAGES.USER.ROLE.NOT_FOUND,
      });
    }

    await context.db
      .delete(UserRoleTable)
      .where(eq(UserRoleTable.userId, existUser.id));

    await context.db.insert(UserRoleTable).values(
      roles.map((role) => ({
        userId: existUser.id,
        roleId: role.id,
      }))
    );

    return apiResponse(API_MESSAGES.USER.UPDATE, null);
  });

export const userDetailsProcedure = userImpl.details
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "user", action: "manage" },
      { level: "system", resource: "user", action: "read" },
    ])
  )
  .handler(async ({ input, errors, context }) => {
    const lastLoginSq = context.db
      .select({
        userId: UserSessionTable.userId,
        lastLogin: max(UserSessionTable.loginAt).as("last_login"),
      })
      .from(UserSessionTable)
      .groupBy(UserSessionTable.userId)
      .as("last_login_sq");

    const [user] = await context.db
      .select({
        user: UserTable,
        lastLogin: lastLoginSq.lastLogin,
      })
      .from(UserTable)
      .leftJoin(lastLoginSq, eq(UserTable.id, lastLoginSq.userId))
      .where(eq(UserTable.id, input.userId))
      .limit(1);

    if (!user) {
      throw errors.NOT_FOUND();
    }

    return apiResponse(API_MESSAGES.USER.GET_DETAILS, {
      ...user.user,
      lastLogin: user.lastLogin,
    });
  });

export const listUserForSearchProcedure = userImpl.listForSearch
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "user", action: "manage" },
      { level: "system", resource: "user", action: "list" },
    ])
  )
  .handler(async ({ input, context }) => {
    const { where } = buildPaginateOptions(
      {
        name: UserTable.name,
        email: UserTable.email,
      },
      input
    );

    const members = await context.db
      .select(userProfileColumns)
      .from(UserTable)
      .innerJoin(UserRoleTable, eq(UserRoleTable.userId, UserTable.id))
      .innerJoin(RoleTable, eq(UserRoleTable.roleId, RoleTable.id))
      .where(and(where, ne(UserTable.id, context.user.id)))
      .groupBy(UserTable.id);

    return apiResponse(API_MESSAGES.USER.GET_ALL_FOR_SEARCH, members);
  });

export const profileUpdateProcedure = userImpl.updateProfile
  .use(
    userPermissionMiddleware([
      { level: "self", resource: "user", action: "manage" },
      { level: "self", resource: "user", action: "update" },
    ])
  )
  .handler(async ({ context, input }) => {
    await getAuth().api.updateUser({
      body: { name: input.name },
      headers: context.reqHeaders,
    });

    const [updatedUserData] = await context.db
      .select()
      .from(UserTable)
      .where(eq(UserTable.id, context.user.id))
      .limit(1);

    return apiResponse(API_MESSAGES.USER.PROFILE_UPDATE, updatedUserData!);
  });
