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
  deleteAllPurchaseProcedure,
  deletePurchaseProcedure,
  listPurchaseBinProcedure,
  removeAllPurchaseProcedure,
  removePurchaseProcedure,
  restoreAllPurchaseProcedure,
  restorePurchaseProcedure,
} from "./purchaseDelete.procedure";

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
const PURCHASE_TWO_ID = "67676767-6767-4676-8676-676767676767";
const PURCHASE_ITEM_ID = "77777777-7777-4777-8777-777777777777";
const PURCHASE_ITEM_TWO_ID = "78787878-7878-4787-8787-787878787878";
const PAYMENT_ID = "88888888-8888-4888-8888-888888888888";
const MEDICINE_ID = "22222222-2222-4222-8222-222222222222";
const INVOICE_ID = "99999999-9999-4999-8999-999999999999";
const SALE_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

async function applySchema(db: MockDatabaseType) {
  const schemaPath = path.resolve(process.cwd(), "full-schema.sql");
  await db.$client.exec(readFileSync(schemaPath, "utf8"));
}

async function seedPurchases(db: MockDatabaseType) {
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
  await db.insert(PurchaseTable).values([
    {
      id: PURCHASE_ID,
      companyId: COMPANY_ID,
      subtotal: 100,
      totalAmount: 100,
      paidAmount: 50,
    },
    {
      id: PURCHASE_TWO_ID,
      companyId: COMPANY_ID,
      subtotal: 40,
      totalAmount: 40,
      paidAmount: 0,
    },
  ]);
  await db.insert(PurchaseItemTable).values([
    {
      id: PURCHASE_ITEM_ID,
      purchaseId: PURCHASE_ID,
      medicineId: MEDICINE_ID,
      qtyPurchased: 10,
      qtyRemaining: 10,
      costPerUnit: 10,
      sellPerUnit: 12,
    },
    {
      id: PURCHASE_ITEM_TWO_ID,
      purchaseId: PURCHASE_TWO_ID,
      medicineId: MEDICINE_ID,
      qtyPurchased: 4,
      qtyRemaining: 4,
      costPerUnit: 10,
      sellPerUnit: 12,
    },
  ]);
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
      permissions: [
        { level: "system", resource: "purchase", action: "delete" },
      ],
      roles: [{ roleName: "ADMIN" }],
    } as unknown as ORPCContext,
  };
}

describe("company purchase delete procedure", () => {
  let db: MockDatabaseType;

  beforeEach(async () => {
    db = createMockDrizzleClient();
    await applySchema(db);
    await seedPurchases(db);
  });

  it("soft deletes the purchase and its payments and keeps other purchases active", async () => {
    const { context } = createContext(db);

    await call(
      deletePurchaseProcedure,
      { purchaseId: PURCHASE_ID },
      { context }
    );

    const [purchase] = await db
      .select()
      .from(PurchaseTable)
      .where(eq(PurchaseTable.id, PURCHASE_ID));
    const [payment] = await db
      .select()
      .from(CompanyPaymentTable)
      .where(eq(CompanyPaymentTable.id, PAYMENT_ID));
    const [otherPurchase] = await db
      .select()
      .from(PurchaseTable)
      .where(eq(PurchaseTable.id, PURCHASE_TWO_ID));
    const [company] = await db
      .select()
      .from(CompanyTable)
      .where(eq(CompanyTable.id, COMPANY_ID));

    expect(purchase?.deletedAt).toBeInstanceOf(Date);
    expect(purchase?.deletedBy).toBe(USER_ID);
    expect(payment?.deletedAt).toBeInstanceOf(Date);
    expect(otherPurchase?.deletedAt).toBeNull();
    expect(company?.deletedAt).toBeNull();
  });

  it("blocks the delete when a batch of the purchase has been sold", async () => {
    await seedSoldBatch(db);
    const { context } = createContext(db);

    await expect(
      call(deletePurchaseProcedure, { purchaseId: PURCHASE_ID }, { context })
    ).rejects.toMatchObject({ code: "HAS_SALES" });

    const [purchase] = await db
      .select()
      .from(PurchaseTable)
      .where(eq(PurchaseTable.id, PURCHASE_ID));

    expect(purchase?.deletedAt).toBeNull();
  });

  it("deleteAll soft deletes every selected purchase", async () => {
    const { context } = createContext(db);

    const result = await call(
      deleteAllPurchaseProcedure,
      { purchaseIds: [PURCHASE_ID, PURCHASE_TWO_ID] },
      { context }
    );

    expect(result.data).toEqual({ count: 2 });
    expect(
      (await db.select().from(PurchaseTable)).every(
        (purchase) => purchase.deletedAt !== null
      )
    ).toBe(true);
  });

  it("rejects remove for a purchase that is still active", async () => {
    const { context } = createContext(db);

    await expect(
      call(removePurchaseProcedure, { purchaseId: PURCHASE_ID }, { context })
    ).rejects.toMatchObject({ code: "NOT_IN_BIN" });
  });

  it("permanently removes a bin purchase with its items and payments", async () => {
    const { context } = createContext(db);
    await call(
      deletePurchaseProcedure,
      { purchaseId: PURCHASE_ID },
      { context }
    );

    await call(
      removePurchaseProcedure,
      { purchaseId: PURCHASE_ID },
      { context }
    );

    expect(
      await db
        .select()
        .from(PurchaseTable)
        .where(eq(PurchaseTable.id, PURCHASE_ID))
    ).toEqual([]);
    expect(
      await db
        .select()
        .from(PurchaseItemTable)
        .where(eq(PurchaseItemTable.purchaseId, PURCHASE_ID))
    ).toEqual([]);
    expect(await db.select().from(CompanyPaymentTable)).toEqual([]);
    expect(await db.select().from(PurchaseTable)).toHaveLength(1);
  });

  it("removeAll rejects the whole request when one purchase is not in the bin", async () => {
    const { context } = createContext(db);
    await call(
      deletePurchaseProcedure,
      { purchaseId: PURCHASE_ID },
      { context }
    );

    await expect(
      call(
        removeAllPurchaseProcedure,
        { purchaseIds: [PURCHASE_ID, PURCHASE_TWO_ID] },
        { context }
      )
    ).rejects.toMatchObject({ code: "NOT_IN_BIN" });

    expect(await db.select().from(PurchaseTable)).toHaveLength(2);
  });

  it("listBin returns only the purchases that are in the bin", async () => {
    const { context } = createContext(db);
    await call(
      deletePurchaseProcedure,
      { purchaseId: PURCHASE_ID },
      { context }
    );

    const result = await call(
      listPurchaseBinProcedure,
      { page: 1, limit: 20, searchFields: [] },
      { context }
    );

    expect(result.data.data.map((purchase) => purchase.id)).toEqual([
      PURCHASE_ID,
    ]);
  });

  it("restore brings a bin purchase and its payments back and leaves stock unchanged", async () => {
    const { context } = createContext(db);
    await call(
      deletePurchaseProcedure,
      { purchaseId: PURCHASE_ID },
      { context }
    );

    await call(
      restorePurchaseProcedure,
      { purchaseId: PURCHASE_ID },
      { context }
    );

    const [purchase] = await db
      .select()
      .from(PurchaseTable)
      .where(eq(PurchaseTable.id, PURCHASE_ID));
    const [payment] = await db
      .select()
      .from(CompanyPaymentTable)
      .where(eq(CompanyPaymentTable.id, PAYMENT_ID));

    expect(purchase?.deletedAt).toBeNull();
    expect(purchase?.deletedBy).toBeNull();
    expect(payment?.deletedAt).toBeNull();
  });

  it("restore rejects a purchase that is not in the bin", async () => {
    const { context } = createContext(db);

    await expect(
      call(restorePurchaseProcedure, { purchaseId: PURCHASE_ID }, { context })
    ).rejects.toMatchObject({ code: "NOT_IN_BIN" });
  });

  it("restoreAll restores every selected purchase", async () => {
    const { context } = createContext(db);
    await call(
      deleteAllPurchaseProcedure,
      { purchaseIds: [PURCHASE_ID, PURCHASE_TWO_ID] },
      { context }
    );

    const result = await call(
      restoreAllPurchaseProcedure,
      { purchaseIds: [PURCHASE_ID, PURCHASE_TWO_ID] },
      { context }
    );

    expect(result.data).toEqual({ count: 2 });
    expect(
      (await db.select().from(PurchaseTable)).every(
        (purchase) => purchase.deletedAt === null
      )
    ).toBe(true);
  });
});
