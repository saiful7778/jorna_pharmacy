import { implement, ORPCError } from "@orpc/server";
import { and, asc, eq, getTableColumns, isNotNull, sql } from "drizzle-orm";

import { API_MESSAGES } from "@/constants/apiMessage";
import { CustomerPaymentTable, CustomerTable, SaleTable } from "@/db/schemas";
import { buildPaginateOptions, buildPaginationMeta } from "@/db/utils";
import { apiResponse } from "@/lib/apiResponse";
import {
  authMiddleware,
  userPermissionMiddleware,
} from "@/oRPC/middleware/auth.middleware";
import { errorMiddleware } from "@/oRPC/middleware/error.middleware";
import type { ORPCContext } from "@/types/orpc.types";

import { customerContract } from "./customer.contract";

export const customerImpl = implement(customerContract)
  .$context<ORPCContext>()
  .use(authMiddleware)
  .use(errorMiddleware);

export const listCustomerProcedure = customerImpl.list
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "customer", action: "manage" },
      { level: "system", resource: "customer", action: "list" },
    ])
  )
  .handler(async ({ context, input }) => {
    const { where, page, orderBy, offset, limit } = buildPaginateOptions(
      {
        name: CustomerTable.name,
        phone: CustomerTable.phone,
        address: CustomerTable.address,
        createdAt: CustomerTable.createdAt,
      },
      input
    );

    const salesByCustomer = context.db
      .select({
        customerId: SaleTable.customerId,
        totalSales: sql<number>`COALESCE(SUM(${SaleTable.totalAmount}), 0)`.as(
          "total_sales"
        ),
        lastPurchaseAt: sql<number | null>`MAX(${SaleTable.createdAt})`.as(
          "last_purchase_at"
        ),
      })
      .from(SaleTable)
      .where(isNotNull(SaleTable.customerId))
      .groupBy(SaleTable.customerId)
      .as("sales_by_customer");

    const paymentsByCustomer = context.db
      .select({
        customerId: CustomerPaymentTable.customerId,
        totalPaid:
          sql<number>`COALESCE(SUM(${CustomerPaymentTable.amount}), 0)`.as(
            "total_paid"
          ),
      })
      .from(CustomerPaymentTable)
      .groupBy(CustomerPaymentTable.customerId)
      .as("payments_by_customer");

    const [totalCountResult, customers] = await Promise.all([
      context.db
        .select({ count: sql<number>`COUNT(*)` })
        .from(CustomerTable)
        .where(where),
      context.db
        .select({
          ...getTableColumns(CustomerTable),
          dueAmount:
            sql<number>`COALESCE(${salesByCustomer.totalSales}, 0) - COALESCE(${paymentsByCustomer.totalPaid}, 0)`.as(
              "due_amount"
            ),
          lastPurchaseAt: salesByCustomer.lastPurchaseAt,
        })
        .from(CustomerTable)
        .leftJoin(
          salesByCustomer,
          eq(salesByCustomer.customerId, CustomerTable.id)
        )
        .leftJoin(
          paymentsByCustomer,
          eq(paymentsByCustomer.customerId, CustomerTable.id)
        )
        .where(where)
        .offset(offset)
        .limit(limit)
        .orderBy(orderBy),
    ]);

    const totalCount = Number(totalCountResult[0]?.count ?? 0);

    return apiResponse(API_MESSAGES.CUSTOMER.GET_ALL, {
      meta: buildPaginationMeta(totalCount, customers.length, page, limit),
      data: customers.map((customer) => ({
        ...customer,
        lastPurchaseAt:
          customer.lastPurchaseAt == null
            ? null
            : new Date(customer.lastPurchaseAt),
      })),
    });
  });

export const listCustomerForSearchProcedure = customerImpl.listForSearch
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "customer", action: "manage" },
      { level: "system", resource: "customer", action: "list" },
    ])
  )
  .handler(async ({ input, context }) => {
    const { where, limit } = buildPaginateOptions(
      {
        name: CustomerTable.name,
        phone: CustomerTable.phone,
        address: CustomerTable.address,
      },
      input
    );

    const customers = await context.db
      .select({
        id: CustomerTable.id,
        name: CustomerTable.name,
        phone: CustomerTable.phone,
        address: CustomerTable.address,
      })
      .from(CustomerTable)
      .where(and(eq(CustomerTable.isActive, true), where))
      .orderBy(asc(CustomerTable.name))
      .limit(limit);

    return apiResponse(API_MESSAGES.CUSTOMER.GET_ALL_FOR_SEARCH, customers);
  });

export const createCustomerProcedure = customerImpl.create
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "customer", action: "manage" },
      { level: "system", resource: "customer", action: "create" },
    ])
  )
  .handler(async ({ context, input }) => {
    const [customer] = await context.db
      .insert(CustomerTable)
      .values(input)
      .returning();

    if (!customer) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: API_MESSAGES.CUSTOMER.NOT_CREATE,
      });
    }

    return apiResponse(API_MESSAGES.CUSTOMER.CREATE, customer);
  });

export const updateCustomerProcedure = customerImpl.update
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "customer", action: "manage" },
      { level: "system", resource: "customer", action: "update" },
    ])
  )
  .handler(async ({ context, input, errors }) => {
    const { customerId, ...data } = input;

    const [existCustomer] = await context.db
      .select()
      .from(CustomerTable)
      .where(eq(CustomerTable.id, customerId))
      .limit(1);

    if (!existCustomer) {
      throw errors.NOT_FOUND();
    }

    if (Object.keys(data).length === 0) {
      return apiResponse(API_MESSAGES.CUSTOMER.UPDATE, existCustomer);
    }

    const [updatedCustomer] = await context.db
      .update(CustomerTable)
      .set(data)
      .where(eq(CustomerTable.id, customerId))
      .returning();

    if (!updatedCustomer) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: API_MESSAGES.CUSTOMER.NOT_UPDATE,
      });
    }

    return apiResponse(API_MESSAGES.CUSTOMER.UPDATE, updatedCustomer);
  });

export const customerDetailsProcedure = customerImpl.details
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "customer", action: "manage" },
      { level: "system", resource: "customer", action: "read" },
    ])
  )
  .handler(async ({ context, input, errors }) => {
    const [customer] = await context.db
      .select()
      .from(CustomerTable)
      .where(eq(CustomerTable.id, input.customerId))
      .limit(1);

    if (!customer) {
      throw errors.NOT_FOUND();
    }

    const [saleTotals, paymentTotals] = await Promise.all([
      context.db
        .select({
          totalSales: sql<number>`COALESCE(SUM(${SaleTable.totalAmount}), 0)`,
          count: sql<number>`COUNT(*)`,
          lastPurchaseAt: sql<number | null>`MAX(${SaleTable.createdAt})`,
        })
        .from(SaleTable)
        .where(eq(SaleTable.customerId, input.customerId)),
      context.db
        .select({
          total: sql<number>`COALESCE(SUM(${CustomerPaymentTable.amount}), 0)`,
          count: sql<number>`COUNT(*)`,
        })
        .from(CustomerPaymentTable)
        .where(eq(CustomerPaymentTable.customerId, input.customerId)),
    ]);

    const totalSales = Number(saleTotals[0]?.totalSales ?? 0);
    const totalPaid = Number(paymentTotals[0]?.total ?? 0);
    const lastPurchaseAt = saleTotals[0]?.lastPurchaseAt;

    const dueAmount = totalSales - totalPaid;

    return apiResponse(API_MESSAGES.CUSTOMER.GET_DETAILS, {
      ...customer,
      summary: {
        totalPaid,
        dueAmount,
        saleCount: Number(saleTotals[0]?.count ?? 0),
        paymentCount: Number(paymentTotals[0]?.count ?? 0),
        totalSales,
        lastPurchaseAt: lastPurchaseAt ? new Date(lastPurchaseAt) : undefined,
      },
    });
  });
