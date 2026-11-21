import { and, eq, isNull, lt, notExists, or, sql } from "drizzle-orm";

import type { DatabaseType } from "@/db/clients/drizzle-client";
import { SaleInvoiceTable, SaleTable } from "@/db/schemas";

const INVOICE_RESERVATION_MINUTES = 10;

/**
 * An invoice number belongs to the sale that used it, even when `is_linked` is
 * stale, so an invoice already referenced by a sale is never handed out again.
 */
function notAttachedToSale(db: DatabaseType) {
  return notExists(
    db
      .select({ id: sql`1` })
      .from(SaleTable)
      .where(eq(SaleTable.invoiceId, SaleInvoiceTable.id))
  );
}

/**
 * Reserves the lowest free invoice number for a few minutes. The reservation
 * keeps two in-flight sales from picking the same number, and simply lapses if
 * a sale is never written, so a number is never lost.
 */
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
        ),
        notAttachedToSale(db)
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

/**
 * Builds the statement that ties a reserved invoice to its sale. Run it in the
 * same batch as the sale insert so the invoice is claimed only once the sale
 * exists, and both writes commit or roll back together.
 */
export function claimInvoiceStatement(db: DatabaseType, invoiceId: string) {
  return db
    .update(SaleInvoiceTable)
    .set({ isLinked: true, reservedBy: null, reservedUntil: null })
    .where(eq(SaleInvoiceTable.id, invoiceId));
}

/**
 * Frees a reserved invoice that never made it into a sale. A number already
 * attached to a sale is left untouched.
 */
export async function releaseInvoice(db: DatabaseType, invoiceId: string) {
  await db
    .update(SaleInvoiceTable)
    .set({ isLinked: false, reservedBy: null, reservedUntil: null })
    .where(and(eq(SaleInvoiceTable.id, invoiceId), notAttachedToSale(db)));
}
