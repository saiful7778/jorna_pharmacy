import { ORPCError } from "@orpc/server";
import { and, desc, eq, inArray, isNotNull, isNull } from "drizzle-orm";
import type { BatchItem } from "drizzle-orm/batch";

import { API_MESSAGES } from "@/constants/apiMessage";
import type { DatabaseType } from "@/db/clients/drizzle-client";
import {
  CompanyPaymentTable,
  CompanyTable,
  PurchaseItemTable,
  PurchaseReturnTable,
  PurchaseTable,
  SaleItemTable,
} from "@/db/schemas";
import { buildPaginateOptions, buildPaginationMeta } from "@/db/utils";
import { apiResponse } from "@/lib/apiResponse";
import { userPermissionMiddleware } from "@/oRPC/middleware/auth.middleware";

import { companyImpl } from "./company.procedure";

async function hasSoldBatches(
  db: DatabaseType,
  companyIds: Array<string>
): Promise<boolean> {
  const soldBatches = await db
    .select({ id: SaleItemTable.id })
    .from(SaleItemTable)
    .innerJoin(
      PurchaseItemTable,
      eq(PurchaseItemTable.id, SaleItemTable.purchaseItemId)
    )
    .innerJoin(
      PurchaseTable,
      eq(PurchaseTable.id, PurchaseItemTable.purchaseId)
    )
    .where(inArray(PurchaseTable.companyId, companyIds))
    .limit(1);

  return soldBatches.length > 0;
}

// Children are restored only if they were deleted together with their company
// (same timestamp), so a purchase deleted on its own stays in the bin.
function groupCompanyIdsByDeletedAt(
  companies: Array<{ id: string; deletedAt: Date | null }>
): Array<{ deletedAt: Date; companyIds: Array<string> }> {
  const groups = new Map<
    number,
    { deletedAt: Date; companyIds: Array<string> }
  >();

  for (const company of companies) {
    if (!company.deletedAt) continue;

    const key = company.deletedAt.getTime();
    const group = groups.get(key) ?? {
      deletedAt: company.deletedAt,
      companyIds: [],
    };

    group.companyIds.push(company.id);
    groups.set(key, group);
  }

  return [...groups.values()];
}

function restoreChildStatements(
  db: DatabaseType,
  groups: Array<{ deletedAt: Date; companyIds: Array<string> }>
): Array<BatchItem<"sqlite">> {
  return groups.flatMap(({ deletedAt, companyIds }) => [
    db
      .update(PurchaseTable)
      .set({ deletedAt: null, deletedBy: null })
      .where(
        and(
          inArray(PurchaseTable.companyId, companyIds),
          eq(PurchaseTable.deletedAt, deletedAt)
        )
      ),
    db
      .update(PurchaseReturnTable)
      .set({ deletedAt: null, deletedBy: null })
      .where(
        and(
          inArray(PurchaseReturnTable.companyId, companyIds),
          eq(PurchaseReturnTable.deletedAt, deletedAt)
        )
      ),
    db
      .update(CompanyPaymentTable)
      .set({ deletedAt: null, deletedBy: null })
      .where(
        and(
          inArray(CompanyPaymentTable.companyId, companyIds),
          eq(CompanyPaymentTable.deletedAt, deletedAt)
        )
      ),
  ]);
}

export const listCompanyBinProcedure = companyImpl.listBin
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "company", action: "manage" },
      { level: "system", resource: "company", action: "delete" },
    ])
  )
  .handler(async ({ context, input }) => {
    const { where, page, offset, limit } = buildPaginateOptions(
      {
        name: CompanyTable.name,
        phone: CompanyTable.phone,
        address: CompanyTable.address,
      },
      input
    );

    const binWhere = and(isNotNull(CompanyTable.deletedAt), where);

    const [totalCount, companies] = await Promise.all([
      context.db.$count(CompanyTable, binWhere),
      context.db
        .select()
        .from(CompanyTable)
        .where(binWhere)
        .offset(offset)
        .limit(limit)
        .orderBy(desc(CompanyTable.deletedAt)),
    ]);

    return apiResponse(API_MESSAGES.COMPANY.GET_ALL_BIN, {
      meta: buildPaginationMeta(totalCount, companies.length, page, limit),
      data: companies,
    });
  });

export const deleteCompanyProcedure = companyImpl.delete
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "company", action: "manage" },
      { level: "system", resource: "company", action: "delete" },
    ])
  )
  .handler(async ({ context, input, errors }) => {
    const [activeCompany] = await context.db
      .select({ id: CompanyTable.id })
      .from(CompanyTable)
      .where(
        and(
          eq(CompanyTable.id, input.companyId),
          isNull(CompanyTable.deletedAt)
        )
      )
      .limit(1);

    if (!activeCompany) {
      throw errors.NOT_FOUND();
    }

    if (await hasSoldBatches(context.db, [input.companyId])) {
      throw errors.HAS_SALES();
    }

    const deletedAt = new Date();

    const [, , , [deletedCompany]] = await context.db.batch([
      context.db
        .update(PurchaseTable)
        .set({ deletedAt, deletedBy: context.user.id })
        .where(
          and(
            eq(PurchaseTable.companyId, input.companyId),
            isNull(PurchaseTable.deletedAt)
          )
        ),
      context.db
        .update(PurchaseReturnTable)
        .set({ deletedAt, deletedBy: context.user.id })
        .where(
          and(
            eq(PurchaseReturnTable.companyId, input.companyId),
            isNull(PurchaseReturnTable.deletedAt)
          )
        ),
      context.db
        .update(CompanyPaymentTable)
        .set({ deletedAt, deletedBy: context.user.id })
        .where(
          and(
            eq(CompanyPaymentTable.companyId, input.companyId),
            isNull(CompanyPaymentTable.deletedAt)
          )
        ),
      context.db
        .update(CompanyTable)
        .set({ deletedAt, deletedBy: context.user.id })
        .where(
          and(
            eq(CompanyTable.id, input.companyId),
            isNull(CompanyTable.deletedAt)
          )
        )
        .returning(),
    ]);

    if (!deletedCompany) {
      throw errors.NOT_FOUND();
    }

    return apiResponse(API_MESSAGES.COMPANY.DELETE, deletedCompany);
  });

export const deleteAllCompanyProcedure = companyImpl.deleteAll
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "company", action: "manage" },
      { level: "system", resource: "company", action: "delete" },
    ])
  )
  .handler(async ({ context, input, errors }) => {
    const companyIds = [...new Set(input.companyIds)];

    const activeCompanies = await context.db
      .select({ id: CompanyTable.id })
      .from(CompanyTable)
      .where(
        and(
          inArray(CompanyTable.id, companyIds),
          isNull(CompanyTable.deletedAt)
        )
      );

    if (activeCompanies.length !== companyIds.length) {
      throw errors.NOT_FOUND();
    }

    if (await hasSoldBatches(context.db, companyIds)) {
      throw errors.HAS_SALES();
    }

    const deletedAt = new Date();

    const [, , , deletedCompanies] = await context.db.batch([
      context.db
        .update(PurchaseTable)
        .set({ deletedAt, deletedBy: context.user.id })
        .where(
          and(
            inArray(PurchaseTable.companyId, companyIds),
            isNull(PurchaseTable.deletedAt)
          )
        ),
      context.db
        .update(PurchaseReturnTable)
        .set({ deletedAt, deletedBy: context.user.id })
        .where(
          and(
            inArray(PurchaseReturnTable.companyId, companyIds),
            isNull(PurchaseReturnTable.deletedAt)
          )
        ),
      context.db
        .update(CompanyPaymentTable)
        .set({ deletedAt, deletedBy: context.user.id })
        .where(
          and(
            inArray(CompanyPaymentTable.companyId, companyIds),
            isNull(CompanyPaymentTable.deletedAt)
          )
        ),
      context.db
        .update(CompanyTable)
        .set({ deletedAt, deletedBy: context.user.id })
        .where(inArray(CompanyTable.id, companyIds))
        .returning({ id: CompanyTable.id }),
    ]);

    return apiResponse(API_MESSAGES.COMPANY.DELETE_ALL, {
      count: deletedCompanies.length,
    });
  });

export const restoreCompanyProcedure = companyImpl.restore
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "company", action: "manage" },
      { level: "system", resource: "company", action: "delete" },
    ])
  )
  .handler(async ({ context, input, errors }) => {
    const [binCompany] = await context.db
      .select({ id: CompanyTable.id, deletedAt: CompanyTable.deletedAt })
      .from(CompanyTable)
      .where(
        and(
          eq(CompanyTable.id, input.companyId),
          isNotNull(CompanyTable.deletedAt)
        )
      )
      .limit(1);

    if (!binCompany) {
      throw errors.NOT_IN_BIN();
    }

    const groups = groupCompanyIdsByDeletedAt([binCompany]);
    const statements = restoreChildStatements(context.db, groups);

    statements.push(
      context.db
        .update(CompanyTable)
        .set({ deletedAt: null, deletedBy: null })
        .where(eq(CompanyTable.id, input.companyId))
    );

    const [firstStatement, ...otherStatements] = statements;

    if (firstStatement) {
      await context.db.batch([firstStatement, ...otherStatements]);
    }

    const [restoredCompany] = await context.db
      .select()
      .from(CompanyTable)
      .where(eq(CompanyTable.id, input.companyId))
      .limit(1);

    if (!restoredCompany) {
      throw errors.NOT_IN_BIN();
    }

    return apiResponse(API_MESSAGES.COMPANY.RESTORE, restoredCompany);
  });

export const restoreAllCompanyProcedure = companyImpl.restoreAll
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "company", action: "manage" },
      { level: "system", resource: "company", action: "delete" },
    ])
  )
  .handler(async ({ context, input, errors }) => {
    const companyIds = [...new Set(input.companyIds)];

    const binCompanies = await context.db
      .select({ id: CompanyTable.id, deletedAt: CompanyTable.deletedAt })
      .from(CompanyTable)
      .where(
        and(
          inArray(CompanyTable.id, companyIds),
          isNotNull(CompanyTable.deletedAt)
        )
      );

    if (binCompanies.length !== companyIds.length) {
      throw errors.NOT_IN_BIN();
    }

    const groups = groupCompanyIdsByDeletedAt(binCompanies);
    const statements = restoreChildStatements(context.db, groups);

    statements.push(
      context.db
        .update(CompanyTable)
        .set({ deletedAt: null, deletedBy: null })
        .where(inArray(CompanyTable.id, companyIds))
    );

    const [firstStatement, ...otherStatements] = statements;

    if (firstStatement) {
      await context.db.batch([firstStatement, ...otherStatements]);
    }

    return apiResponse(API_MESSAGES.COMPANY.RESTORE_ALL, {
      count: companyIds.length,
    });
  });

export const removeCompanyProcedure = companyImpl.remove
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "company", action: "manage" },
      { level: "system", resource: "company", action: "delete" },
    ])
  )
  .handler(async ({ context, input, errors }) => {
    const [binCompany] = await context.db
      .select({ id: CompanyTable.id })
      .from(CompanyTable)
      .where(
        and(
          eq(CompanyTable.id, input.companyId),
          isNotNull(CompanyTable.deletedAt)
        )
      )
      .limit(1);

    if (!binCompany) {
      throw errors.NOT_IN_BIN();
    }

    const [, , , [removedCompany]] = await context.db.batch([
      context.db
        .delete(CompanyPaymentTable)
        .where(eq(CompanyPaymentTable.companyId, input.companyId)),
      context.db
        .delete(PurchaseReturnTable)
        .where(eq(PurchaseReturnTable.companyId, input.companyId)),
      context.db
        .delete(PurchaseTable)
        .where(eq(PurchaseTable.companyId, input.companyId)),
      context.db
        .delete(CompanyTable)
        .where(eq(CompanyTable.id, input.companyId))
        .returning(),
    ]);

    if (!removedCompany) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: API_MESSAGES.COMPANY.NOT_DELETE,
      });
    }

    return apiResponse(API_MESSAGES.COMPANY.REMOVE, removedCompany);
  });

export const removeAllCompanyProcedure = companyImpl.removeAll
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "company", action: "manage" },
      { level: "system", resource: "company", action: "delete" },
    ])
  )
  .handler(async ({ context, input, errors }) => {
    const companyIds = [...new Set(input.companyIds)];

    const binCompanies = await context.db
      .select({ id: CompanyTable.id })
      .from(CompanyTable)
      .where(
        and(
          inArray(CompanyTable.id, companyIds),
          isNotNull(CompanyTable.deletedAt)
        )
      );

    if (binCompanies.length !== companyIds.length) {
      throw errors.NOT_IN_BIN();
    }

    const [, , , removedCompanies] = await context.db.batch([
      context.db
        .delete(CompanyPaymentTable)
        .where(inArray(CompanyPaymentTable.companyId, companyIds)),
      context.db
        .delete(PurchaseReturnTable)
        .where(inArray(PurchaseReturnTable.companyId, companyIds)),
      context.db
        .delete(PurchaseTable)
        .where(inArray(PurchaseTable.companyId, companyIds)),
      context.db
        .delete(CompanyTable)
        .where(inArray(CompanyTable.id, companyIds))
        .returning({ id: CompanyTable.id }),
    ]);

    return apiResponse(API_MESSAGES.COMPANY.REMOVE_ALL, {
      count: removedCompanies.length,
    });
  });
