import { and, eq, gt, isNull, lt, or, sql } from "drizzle-orm";

import type { DatabaseType } from "@/db/clients/drizzle-client";
import { SaleInvoiceTable } from "@/db/schemas";

const INVOICE_RESERVATION_MINUTES = 10;

export async function reserveInvoice(db: DatabaseType, userId: string) {
  const now = new Date();
  const reservedUntil = new Date(
    now.getTime() + INVOICE_RESERVATION_MINUTES * 60 * 1000
  );

  const availableInvoice = db
    .select({ id: SaleInvoiceTable.id })
    .from(SaleInvoiceTable)
    .where(
      and(
        eq(SaleInvoiceTable.isLinked, false),
        or(
          isNull(SaleInvoiceTable.reservedUntil),
          lt(SaleInvoiceTable.reservedUntil, now)
        )
      )
    )
    .orderBy(sql`CAST(${SaleInvoiceTable.number} AS INTEGER)`)
    .limit(1);

  const [reusedInvoice] = await db
    .update(SaleInvoiceTable)
    .set({ reservedBy: userId, reservedUntil })
    .where(eq(SaleInvoiceTable.id, sql`(${availableInvoice})`))
    .returning({
      id: SaleInvoiceTable.id,
      number: SaleInvoiceTable.number,
    });

  if (reusedInvoice) {
    return reusedInvoice;
  }

  const [createdInvoice] = await db
    .insert(SaleInvoiceTable)
    .values({
      number: sql`(SELECT printf('%04d', COALESCE(MAX(CAST(${SaleInvoiceTable.number} AS INTEGER)), 0) + 1) FROM ${SaleInvoiceTable})`,
      reservedBy: userId,
      reservedUntil,
    })
    .returning({
      id: SaleInvoiceTable.id,
      number: SaleInvoiceTable.number,
    });

  if (!createdInvoice) {
    throw new Error("Failed to reserve purchase invoice number");
  }

  return createdInvoice;
}

export async function claimInvoice(
  db: DatabaseType,
  invoiceId: string,
  userId: string
) {
  const [claimedInvoice] = await db
    .update(SaleInvoiceTable)
    .set({ isLinked: true })
    .where(
      and(
        eq(SaleInvoiceTable.id, invoiceId),
        eq(SaleInvoiceTable.isLinked, false),
        eq(SaleInvoiceTable.reservedBy, userId),
        gt(SaleInvoiceTable.reservedUntil, new Date())
      )
    )
    .returning({ id: SaleInvoiceTable.id });

  return claimedInvoice;
}

export async function releaseInvoice(db: DatabaseType, invoiceId: string) {
  await db
    .update(SaleInvoiceTable)
    .set({ isLinked: false })
    .where(eq(SaleInvoiceTable.id, invoiceId));
}
