import { readFileSync } from "node:fs";
import path from "node:path";

import { call } from "@orpc/server";
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createMockDrizzleClient,
  type MockDatabaseType,
} from "@/db/clients/drizzle-client.mock";
import {
  CompanyPaymentTable,
  CompanyTable,
  MedicineTable,
  PurchaseItemTable,
  PurchaseTable,
  SaleInvoiceTable,
  SaleItemTable,
  SaleTable,
  UserTable,
} from "@/db/schemas";
import type { ORPCContext } from "@/types/orpc.types";

import {
  deleteCompanyProcedure,
  removeCompanyProcedure,
  restoreCompanyProcedure,
} from "./companyDelete.procedure";
import { deleteCompanyPurchaseProcedure } from "./companyPurchaseDelete.procedure";

vi.mock("@/oRPC/middleware/auth.middleware", async () => {
  const { os } = await import("@orpc/server");
  const passThrough = os.middleware(({ next }) => next());

  return {
    authMiddleware: passThrough,
    userPermissionMiddleware: () => passThrough,
  };
});

const USER_ID = "11111111-1111-4111-8111-111111111111";
const COMPANY_ID = "55555555-5555-4555-8555-555555555555";
const PURCHASE_ID = "66666666-6666-4666-8666-666666666666";
const PURCHASE_ITEM_ID = "77777777-7777-4777-8777-777777777777";
const PAYMENT_ID = "88888888-8888-4888-8888-888888888888";
const MEDICINE_ID = "22222222-2222-4222-8222-222222222222";
const INVOICE_ID = "99999999-9999-4999-8999-999999999999";
const SALE_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

async function applySchema(db: MockDatabaseType) {
  const schemaPath = path.resolve(process.cwd(), "full-schema.sql");
  await db.$client.exec(readFileSync(schemaPath, "utf8"));
}

async function seedCompany(db: MockDatabaseType) {
  await db.insert(UserTable).values({
    id: USER_ID,
    name: "John",
    email: "john@mail.com",
    role: "ADMIN",
  });
  await db.insert(CompanyTable).values({ id: COMPANY_ID, name: "Square" });
  await db.insert(MedicineTable).values({
    id: MEDICINE_ID,
    name: "Napa",
    genericName: "Paracetamol",
    strength: "500mg",
    type: "tablet",
    baseUnit: "strip",
    companyId: COMPANY_ID,
  });
  await db.insert(PurchaseTable).values({
    id: PURCHASE_ID,
    companyId: COMPANY_ID,
    subtotal: 100,
    totalAmount: 100,
    paidAmount: 50,
  });
  await db.insert(PurchaseItemTable).values({
    id: PURCHASE_ITEM_ID,
    purchaseId: PURCHASE_ID,
    medicineId: MEDICINE_ID,
    qtyPurchased: 10,
    qtyRemaining: 10,
    costPerUnit: 10,
    sellPerUnit: 12,
  });
  await db.insert(CompanyPaymentTable).values({
    id: PAYMENT_ID,
    companyId: COMPANY_ID,
    purchaseId: PURCHASE_ID,
    amount: 50,
  });
}

async function seedSoldBatch(db: MockDatabaseType) {
  await db.insert(SaleInvoiceTable).values({ id: INVOICE_ID, number: "0001" });
  await db.insert(SaleTable).values({
    id: SALE_ID,
    invoiceId: INVOICE_ID,
    subtotal: 12,
    totalAmount: 12,
    paidAmount: 12,
  });
  await db.insert(SaleItemTable).values({
    saleId: SALE_ID,
    medicineId: MEDICINE_ID,
    purchaseItemId: PURCHASE_ITEM_ID,
    qty: 1,
    unitPrice: 12,
    unitCost: 10,
    lineTotal: 12,
  });
}

function createContext(db: MockDatabaseType) {
  return {
    context: {
      reqHeaders: new Headers(),
      db,
      user: { id: USER_ID },
      session: { id: "session-id" },
      permissions: [{ level: "system", resource: "company", action: "delete" }],
      roles: [{ roleName: "ADMIN" }],
    } as unknown as ORPCContext,
  };
}

describe("company delete procedure", () => {
  let db: MockDatabaseType;

  beforeEach(async () => {
    db = createMockDrizzleClient();
    await applySchema(db);
    await seedCompany(db);
  });

  it("soft deletes the company together with its purchases and payments", async () => {
    const { context } = createContext(db);

    await call(deleteCompanyProcedure, { companyId: COMPANY_ID }, { context });

    const [company] = await db
      .select()
      .from(CompanyTable)
      .where(eq(CompanyTable.id, COMPANY_ID));
    const [purchase] = await db
      .select()
      .from(PurchaseTable)
      .where(eq(PurchaseTable.id, PURCHASE_ID));
    const [payment] = await db
      .select()
      .from(CompanyPaymentTable)
      .where(eq(CompanyPaymentTable.id, PAYMENT_ID));

    expect(company?.deletedAt).toBeInstanceOf(Date);
    expect(company?.deletedBy).toBe(USER_ID);
    expect(purchase?.deletedAt).toBeInstanceOf(Date);
    expect(payment?.deletedAt).toBeInstanceOf(Date);
  });

  it("blocks the delete when a batch of the company has been sold", async () => {
    await seedSoldBatch(db);
    const { context } = createContext(db);

    await expect(
      call(deleteCompanyProcedure, { companyId: COMPANY_ID }, { context })
    ).rejects.toMatchObject({ code: "HAS_SALES" });

    const [company] = await db
      .select()
      .from(CompanyTable)
      .where(eq(CompanyTable.id, COMPANY_ID));
    const [purchase] = await db
      .select()
      .from(PurchaseTable)
      .where(eq(PurchaseTable.id, PURCHASE_ID));

    expect(company?.deletedAt).toBeNull();
    expect(purchase?.deletedAt).toBeNull();
  });

  it("restores the company with the purchases and payments deleted with it", async () => {
    const { context } = createContext(db);
    await call(deleteCompanyProcedure, { companyId: COMPANY_ID }, { context });

    await call(restoreCompanyProcedure, { companyId: COMPANY_ID }, { context });

    const [company] = await db
      .select()
      .from(CompanyTable)
      .where(eq(CompanyTable.id, COMPANY_ID));
    const [purchase] = await db
      .select()
      .from(PurchaseTable)
      .where(eq(PurchaseTable.id, PURCHASE_ID));
    const [payment] = await db
      .select()
      .from(CompanyPaymentTable)
      .where(eq(CompanyPaymentTable.id, PAYMENT_ID));

    expect(company?.deletedAt).toBeNull();
    expect(company?.deletedBy).toBeNull();
    expect(purchase?.deletedAt).toBeNull();
    expect(payment?.deletedAt).toBeNull();
  });

  it("does not restore a purchase that was deleted on its own before the company", async () => {
    const { context } = createContext(db);
    await call(
      deleteCompanyPurchaseProcedure,
      { purchaseId: PURCHASE_ID },
      { context }
    );
    await call(deleteCompanyProcedure, { companyId: COMPANY_ID }, { context });

    await call(restoreCompanyProcedure, { companyId: COMPANY_ID }, { context });

    const [company] = await db
      .select()
      .from(CompanyTable)
      .where(eq(CompanyTable.id, COMPANY_ID));
    const [purchase] = await db
      .select()
      .from(PurchaseTable)
      .where(eq(PurchaseTable.id, PURCHASE_ID));

    expect(company?.deletedAt).toBeNull();
    expect(purchase?.deletedAt).toBeInstanceOf(Date);
  });

  it("permanently removes the company with its purchases, items and payments", async () => {
    const { context } = createContext(db);
    await call(deleteCompanyProcedure, { companyId: COMPANY_ID }, { context });

    await call(removeCompanyProcedure, { companyId: COMPANY_ID }, { context });

    expect(
      await db
        .select()
        .from(CompanyTable)
        .where(eq(CompanyTable.id, COMPANY_ID))
    ).toEqual([]);
    expect(await db.select().from(PurchaseTable)).toEqual([]);
    expect(await db.select().from(PurchaseItemTable)).toEqual([]);
    expect(await db.select().from(CompanyPaymentTable)).toEqual([]);
  });
});
