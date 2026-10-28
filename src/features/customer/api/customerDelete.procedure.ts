import { ORPCError } from "@orpc/server";
import { and, desc, eq, inArray, isNotNull, isNull } from "drizzle-orm";

import { API_MESSAGES } from "@/constants/apiMessage";
import type { DatabaseType } from "@/db/clients/drizzle-client";
import { CustomerPaymentTable, CustomerTable, SaleTable } from "@/db/schemas";
import { buildPaginateOptions, buildPaginationMeta } from "@/db/utils";
import { apiResponse } from "@/lib/apiResponse";
import { userPermissionMiddleware } from "@/oRPC/middleware/auth.middleware";

import { customerImpl } from "./customer.procedure";

async function hasCustomerSales(
  db: DatabaseType,
  customerIds: Array<string>
): Promise<boolean> {
  const sales = await db
    .select({ id: SaleTable.id })
    .from(SaleTable)
    .where(inArray(SaleTable.customerId, customerIds))
    .limit(1);

  return sales.length > 0;
}

export const listCustomerBinProcedure = customerImpl.listBin
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "customer", action: "manage" },
      { level: "system", resource: "customer", action: "delete" },
    ])
  )
  .handler(async ({ context, input }) => {
    const { where, page, offset, limit } = buildPaginateOptions(
      {
        name: CustomerTable.name,
        phone: CustomerTable.phone,
        address: CustomerTable.address,
      },
      input
    );

    const binWhere = and(isNotNull(CustomerTable.deletedAt), where);

    const [totalCount, customers] = await Promise.all([
      context.db.$count(CustomerTable, binWhere),
      context.db
        .select()
        .from(CustomerTable)
        .where(binWhere)
        .offset(offset)
        .limit(limit)
        .orderBy(desc(CustomerTable.deletedAt)),
    ]);

    return apiResponse(API_MESSAGES.CUSTOMER.GET_ALL_BIN, {
      meta: buildPaginationMeta(totalCount, customers.length, page, limit),
      data: customers,
    });
  });

export const deleteCustomerProcedure = customerImpl.delete
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "customer", action: "manage" },
      { level: "system", resource: "customer", action: "delete" },
    ])
  )
  .handler(async ({ context, input, errors }) => {
    const [activeCustomer] = await context.db
      .select({ id: CustomerTable.id })
      .from(CustomerTable)
      .where(
        and(
          eq(CustomerTable.id, input.customerId),
          isNull(CustomerTable.deletedAt)
        )
      )
      .limit(1);

    if (!activeCustomer) {
      throw errors.NOT_FOUND();
    }

    if (await hasCustomerSales(context.db, [input.customerId])) {
      throw errors.HAS_SALES();
    }

    const [, [deletedCustomer]] = await context.db.batch([
      context.db
        .update(CustomerPaymentTable)
        .set({ deletedAt: new Date(), deletedBy: context.user.id })
        .where(
          and(
            eq(CustomerPaymentTable.customerId, input.customerId),
            isNull(CustomerPaymentTable.deletedAt)
          )
        ),
      context.db
        .update(CustomerTable)
        .set({ deletedAt: new Date(), deletedBy: context.user.id })
        .where(
          and(
            eq(CustomerTable.id, input.customerId),
            isNull(CustomerTable.deletedAt)
          )
        )
        .returning(),
    ]);

    if (!deletedCustomer) {
      throw errors.NOT_FOUND();
    }

    return apiResponse(API_MESSAGES.CUSTOMER.DELETE, deletedCustomer);
  });

export const deleteAllCustomerProcedure = customerImpl.deleteAll
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "customer", action: "manage" },
      { level: "system", resource: "customer", action: "delete" },
    ])
  )
  .handler(async ({ context, input, errors }) => {
    const customerIds = [...new Set(input.customerIds)];

    const activeCustomers = await context.db
      .select({ id: CustomerTable.id })
      .from(CustomerTable)
      .where(
        and(
          inArray(CustomerTable.id, customerIds),
          isNull(CustomerTable.deletedAt)
        )
      );

    if (activeCustomers.length !== customerIds.length) {
      throw errors.NOT_FOUND();
    }

    if (await hasCustomerSales(context.db, customerIds)) {
      throw errors.HAS_SALES();
    }

    const [, deletedCustomers] = await context.db.batch([
      context.db
        .update(CustomerPaymentTable)
        .set({ deletedAt: new Date(), deletedBy: context.user.id })
        .where(
          and(
            inArray(CustomerPaymentTable.customerId, customerIds),
            isNull(CustomerPaymentTable.deletedAt)
          )
        ),
      context.db
        .update(CustomerTable)
        .set({ deletedAt: new Date(), deletedBy: context.user.id })
        .where(inArray(CustomerTable.id, customerIds))
        .returning({ id: CustomerTable.id }),
    ]);

    return apiResponse(API_MESSAGES.CUSTOMER.DELETE_ALL, {
      count: deletedCustomers.length,
    });
  });

export const restoreCustomerProcedure = customerImpl.restore
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "customer", action: "manage" },
      { level: "system", resource: "customer", action: "delete" },
    ])
  )
  .handler(async ({ context, input, errors }) => {
    const [binCustomer] = await context.db
      .select({ id: CustomerTable.id })
      .from(CustomerTable)
      .where(
        and(
          eq(CustomerTable.id, input.customerId),
          isNotNull(CustomerTable.deletedAt)
        )
      )
      .limit(1);

    if (!binCustomer) {
      throw errors.NOT_IN_BIN();
    }

    const [, [restoredCustomer]] = await context.db.batch([
      context.db
        .update(CustomerPaymentTable)
        .set({ deletedAt: null, deletedBy: null })
        .where(
          and(
            eq(CustomerPaymentTable.customerId, input.customerId),
            isNotNull(CustomerPaymentTable.deletedAt)
          )
        ),
      context.db
        .update(CustomerTable)
        .set({ deletedAt: null, deletedBy: null })
        .where(
          and(
            eq(CustomerTable.id, input.customerId),
            isNotNull(CustomerTable.deletedAt)
          )
        )
        .returning(),
    ]);

    if (!restoredCustomer) {
      throw errors.NOT_IN_BIN();
    }

    return apiResponse(API_MESSAGES.CUSTOMER.RESTORE, restoredCustomer);
  });

export const restoreAllCustomerProcedure = customerImpl.restoreAll
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "customer", action: "manage" },
      { level: "system", resource: "customer", action: "delete" },
    ])
  )
  .handler(async ({ context, input, errors }) => {
    const customerIds = [...new Set(input.customerIds)];

    const binCustomers = await context.db
      .select({ id: CustomerTable.id })
      .from(CustomerTable)
      .where(
        and(
          inArray(CustomerTable.id, customerIds),
          isNotNull(CustomerTable.deletedAt)
        )
      );

    if (binCustomers.length !== customerIds.length) {
      throw errors.NOT_IN_BIN();
    }

    const [, restoredCustomers] = await context.db.batch([
      context.db
        .update(CustomerPaymentTable)
        .set({ deletedAt: null, deletedBy: null })
        .where(
          and(
            inArray(CustomerPaymentTable.customerId, customerIds),
            isNotNull(CustomerPaymentTable.deletedAt)
          )
        ),
      context.db
        .update(CustomerTable)
        .set({ deletedAt: null, deletedBy: null })
        .where(inArray(CustomerTable.id, customerIds))
        .returning({ id: CustomerTable.id }),
    ]);

    return apiResponse(API_MESSAGES.CUSTOMER.RESTORE_ALL, {
      count: restoredCustomers.length,
    });
  });

export const removeCustomerProcedure = customerImpl.remove
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "customer", action: "manage" },
      { level: "system", resource: "customer", action: "delete" },
    ])
  )
  .handler(async ({ context, input, errors }) => {
    const [binCustomer] = await context.db
      .select({ id: CustomerTable.id })
      .from(CustomerTable)
      .where(
        and(
          eq(CustomerTable.id, input.customerId),
          isNotNull(CustomerTable.deletedAt)
        )
      )
      .limit(1);

    if (!binCustomer) {
      throw errors.NOT_IN_BIN();
    }

    const [, [removedCustomer]] = await context.db.batch([
      context.db
        .delete(CustomerPaymentTable)
        .where(eq(CustomerPaymentTable.customerId, input.customerId)),
      context.db
        .delete(CustomerTable)
        .where(eq(CustomerTable.id, input.customerId))
        .returning(),
    ]);

    if (!removedCustomer) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: API_MESSAGES.CUSTOMER.NOT_DELETE,
      });
    }

    return apiResponse(API_MESSAGES.CUSTOMER.REMOVE, removedCustomer);
  });

export const removeAllCustomerProcedure = customerImpl.removeAll
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "customer", action: "manage" },
      { level: "system", resource: "customer", action: "delete" },
    ])
  )
  .handler(async ({ context, input, errors }) => {
    const customerIds = [...new Set(input.customerIds)];

    const binCustomers = await context.db
      .select({ id: CustomerTable.id })
      .from(CustomerTable)
      .where(
        and(
          inArray(CustomerTable.id, customerIds),
          isNotNull(CustomerTable.deletedAt)
        )
      );

    if (binCustomers.length !== customerIds.length) {
      throw errors.NOT_IN_BIN();
    }

    const [, removedCustomers] = await context.db.batch([
      context.db
        .delete(CustomerPaymentTable)
        .where(inArray(CustomerPaymentTable.customerId, customerIds)),
      context.db
        .delete(CustomerTable)
        .where(inArray(CustomerTable.id, customerIds))
        .returning({ id: CustomerTable.id }),
    ]);

    return apiResponse(API_MESSAGES.CUSTOMER.REMOVE_ALL, {
      count: removedCustomers.length,
    });
  });
