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
  CompanyTable,
  CustomerPaymentTable,
  CustomerTable,
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
  deleteAllSaleProcedure,
  deleteSaleProcedure,
  listSaleBinProcedure,
  removeAllSaleProcedure,
  removeSaleProcedure,
  restoreAllSaleProcedure,
  restoreSaleProcedure,
} from "./saleDelete.procedure";

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
const MEDICINE_ID = "22222222-2222-4222-8222-222222222222";
const CUSTOMER_ID = "33333333-3333-4333-8333-333333333333";
const SALE_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const SALE_TWO_ID = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const INVOICE_ID = "99999999-9999-4999-8999-999999999999";
const INVOICE_TWO_ID = "98989898-9898-4898-8898-989898989898";
const PAYMENT_ID = "44444444-4444-4444-8444-444444444444";

async function applySchema(db: MockDatabaseType) {
  const schemaPath = path.resolve(process.cwd(), "full-schema.sql");
  await db.$client.exec(readFileSync(schemaPath, "utf8"));
}

async function seedSale(db: MockDatabaseType) {
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
    paidAmount: 100,
  });
  await db.insert(PurchaseItemTable).values({
    id: PURCHASE_ITEM_ID,
    purchaseId: PURCHASE_ID,
    medicineId: MEDICINE_ID,
    qtyPurchased: 10,
    qtyRemaining: 5,
    costPerUnit: 5,
    sellPerUnit: 10,
  });
  await db.insert(CustomerTable).values({ id: CUSTOMER_ID, name: "Rahim" });
  await db.insert(SaleInvoiceTable).values([
    { id: INVOICE_ID, number: "0001" },
    { id: INVOICE_TWO_ID, number: "0002" },
  ]);
  await db.insert(SaleTable).values([
    {
      id: SALE_ID,
      customerId: CUSTOMER_ID,
      invoiceId: INVOICE_ID,
      subtotal: 40,
      totalAmount: 40,
      paidAmount: 20,
    },
    {
      id: SALE_TWO_ID,
      invoiceId: INVOICE_TWO_ID,
      subtotal: 10,
      totalAmount: 10,
      paidAmount: 10,
    },
  ]);
  await db.insert(SaleItemTable).values([
    {
      saleId: SALE_ID,
      medicineId: MEDICINE_ID,
      purchaseItemId: PURCHASE_ITEM_ID,
      qty: 4,
      unitPrice: 10,
      unitCost: 5,
      lineTotal: 40,
    },
    {
      saleId: SALE_TWO_ID,
      medicineId: MEDICINE_ID,
      purchaseItemId: PURCHASE_ITEM_ID,
      qty: 1,
      unitPrice: 10,
      unitCost: 5,
      lineTotal: 10,
    },
  ]);
  await db.insert(CustomerPaymentTable).values({
    id: PAYMENT_ID,
    customerId: CUSTOMER_ID,
    saleId: SALE_ID,
    amount: 20,
  });
}

function createContext(db: MockDatabaseType) {
  return {
    context: {
      reqHeaders: new Headers(),
      db,
      user: { id: USER_ID },
      session: { id: "session-id" },
      permissions: [{ level: "system", resource: "sale", action: "delete" }],
      roles: [{ roleName: "ADMIN" }],
    } as unknown as ORPCContext,
  };
}

async function getBatchStock(db: MockDatabaseType) {
  const [batch] = await db
    .select({ qtyRemaining: PurchaseItemTable.qtyRemaining })
    .from(PurchaseItemTable)
    .where(eq(PurchaseItemTable.id, PURCHASE_ITEM_ID));

  return batch?.qtyRemaining;
}

describe("sale delete procedure", () => {
  let db: MockDatabaseType;

  beforeEach(async () => {
    db = createMockDrizzleClient();
    await applySchema(db);
    await seedSale(db);
  });

  it("soft deletes the sale, its payments, and returns its quantities to stock", async () => {
    const { context } = createContext(db);

    await call(deleteSaleProcedure, { saleId: SALE_ID }, { context });

    const [sale] = await db
      .select()
      .from(SaleTable)
      .where(eq(SaleTable.id, SALE_ID));
    const [payment] = await db
      .select()
      .from(CustomerPaymentTable)
      .where(eq(CustomerPaymentTable.id, PAYMENT_ID));

    expect(sale?.deletedAt).toBeInstanceOf(Date);
    expect(sale?.deletedBy).toBe(USER_ID);
    expect(payment?.deletedAt).toBeInstanceOf(Date);
    expect(await getBatchStock(db)).toBe(5 + 4);
    expect(await db.select().from(SaleItemTable)).toHaveLength(2);
  });

  it("deleteAll returns the quantities of every selected sale", async () => {
    const { context } = createContext(db);

    const result = await call(
      deleteAllSaleProcedure,
      { saleIds: [SALE_ID, SALE_TWO_ID] },
      { context }
    );

    expect(result.data).toEqual({ count: 2 });
    expect(await getBatchStock(db)).toBe(10);
  });

  it("listBin returns only the sales that are in the bin", async () => {
    const { context } = createContext(db);
    await call(deleteSaleProcedure, { saleId: SALE_ID }, { context });

    const result = await call(
      listSaleBinProcedure,
      { page: 1, limit: 20, searchFields: [] },
      { context }
    );

    expect(result.data.data.map((sale) => sale.id)).toEqual([SALE_ID]);
  });

  it("restore brings a bin sale and its payments back and takes its quantities out of stock again", async () => {
    const { context } = createContext(db);
    await call(deleteSaleProcedure, { saleId: SALE_ID }, { context });

    await call(restoreSaleProcedure, { saleId: SALE_ID }, { context });

    const [sale] = await db
      .select()
      .from(SaleTable)
      .where(eq(SaleTable.id, SALE_ID));
    const [payment] = await db
      .select()
      .from(CustomerPaymentTable)
      .where(eq(CustomerPaymentTable.id, PAYMENT_ID));

    expect(sale?.deletedAt).toBeNull();
    expect(sale?.deletedBy).toBeNull();
    expect(payment?.deletedAt).toBeNull();
    expect(await getBatchStock(db)).toBe(5);
  });

  it("restore is refused when a batch no longer has the sold quantity", async () => {
    const { context } = createContext(db);
    await call(deleteSaleProcedure, { saleId: SALE_ID }, { context });
    await db
      .update(PurchaseItemTable)
      .set({ qtyRemaining: 3 })
      .where(eq(PurchaseItemTable.id, PURCHASE_ITEM_ID));

    await expect(
      call(restoreSaleProcedure, { saleId: SALE_ID }, { context })
    ).rejects.toMatchObject({ code: "NOT_ENOUGH_STOCK_TO_RESTORE" });

    const [sale] = await db
      .select()
      .from(SaleTable)
      .where(eq(SaleTable.id, SALE_ID));

    expect(sale?.deletedAt).toBeInstanceOf(Date);
    expect(await getBatchStock(db)).toBe(3);
  });

  it("restore rejects a sale that is not in the bin", async () => {
    const { context } = createContext(db);

    await expect(
      call(restoreSaleProcedure, { saleId: SALE_ID }, { context })
    ).rejects.toMatchObject({ code: "NOT_IN_BIN" });
  });

  it("restoreAll restores every selected sale and takes their quantities out of stock", async () => {
    const { context } = createContext(db);
    await call(
      deleteAllSaleProcedure,
      { saleIds: [SALE_ID, SALE_TWO_ID] },
      { context }
    );

    const result = await call(
      restoreAllSaleProcedure,
      { saleIds: [SALE_ID, SALE_TWO_ID] },
      { context }
    );

    expect(result.data).toEqual({ count: 2 });
    expect(
      (await db.select().from(SaleTable)).every(
        (sale) => sale.deletedAt === null
      )
    ).toBe(true);
    expect(await getBatchStock(db)).toBe(5);
  });

  it("rejects a sale that is already in the bin", async () => {
    const { context } = createContext(db);
    await call(deleteSaleProcedure, { saleId: SALE_ID }, { context });

    await expect(
      call(deleteSaleProcedure, { saleId: SALE_ID }, { context })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("rejects remove for a sale that is still active", async () => {
    const { context } = createContext(db);

    await expect(
      call(removeSaleProcedure, { saleId: SALE_ID }, { context })
    ).rejects.toMatchObject({ code: "NOT_IN_BIN" });
  });

  it("permanently removes a bin sale with its items and payments without changing stock", async () => {
    const { context } = createContext(db);
    await call(deleteSaleProcedure, { saleId: SALE_ID }, { context });
    const stockAfterDelete = await getBatchStock(db);

    await call(removeSaleProcedure, { saleId: SALE_ID }, { context });

    expect(
      await db.select().from(SaleTable).where(eq(SaleTable.id, SALE_ID))
    ).toEqual([]);
    expect(
      await db
        .select()
        .from(SaleItemTable)
        .where(eq(SaleItemTable.saleId, SALE_ID))
    ).toEqual([]);
    expect(await db.select().from(CustomerPaymentTable)).toEqual([]);
    expect(await getBatchStock(db)).toBe(stockAfterDelete);
  });

  it("removeAll rejects the whole request when one sale is not in the bin", async () => {
    const { context } = createContext(db);
    await call(deleteSaleProcedure, { saleId: SALE_ID }, { context });

    await expect(
      call(
        removeAllSaleProcedure,
        { saleIds: [SALE_ID, SALE_TWO_ID] },
        { context }
      )
    ).rejects.toMatchObject({ code: "NOT_IN_BIN" });

    expect(await db.select().from(SaleTable)).toHaveLength(2);
  });
});
