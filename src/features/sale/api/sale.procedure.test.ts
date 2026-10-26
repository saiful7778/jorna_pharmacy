import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { call } from "@orpc/server";
import { asc, eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createMockDrizzleClient,
  type MockDatabaseType,
} from "@/db/clients/drizzle-client.mock";
import {
  CompanyTable,
  CustomerTable,
  MedicineTable,
  PurchaseItemTable,
  PurchaseTable,
  SaleItemTable,
  SaleTable,
  UserTable,
} from "@/db/schemas";
import type { ORPCContext } from "@/types/orpc.types";

import { saleCreateProcedure, saleStatsProcedure } from "./sale.procedure";

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
const MEDICINE_ID = "22222222-2222-4222-8222-222222222222";
const CUSTOMER_ID = "33333333-3333-4333-8333-333333333333";

async function applyMigrations(db: MockDatabaseType) {
  const migrationsDir = path.resolve(process.cwd(), "migrations");
  const files = readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    await db.$client.exec(readFileSync(path.join(migrationsDir, file), "utf8"));
  }
}

async function seedBase(db: MockDatabaseType) {
  await db.insert(UserTable).values({
    id: USER_ID,
    name: "John",
    email: "john@mail.com",
    role: "ADMIN",
  });
  await db
    .insert(CompanyTable)
    .values({ id: COMPANY_ID, name: "Square Pharma" });
  await db.insert(PurchaseTable).values({
    id: PURCHASE_ID,
    companyId: COMPANY_ID,
    subtotal: 0,
    totalAmount: 0,
  });
  await db.insert(CustomerTable).values({
    id: CUSTOMER_ID,
    name: "Rahim Uddin",
  });
  await db.insert(MedicineTable).values({
    id: MEDICINE_ID,
    name: "Napa",
    genericName: "Paracetamol",
    strength: "500mg",
    type: "tablet",
    baseUnit: "strip",
  });
}

type BatchSeed = {
  id: string;
  qtyRemaining: number;
  sellPerUnit: number;
  costPerUnit: number;
  expiryDate: Date | null;
  createdAt: Date;
};

async function seedBatches(db: MockDatabaseType, batches: Array<BatchSeed>) {
  await db.insert(PurchaseItemTable).values(
    batches.map((batch) => ({
      ...batch,
      purchaseId: PURCHASE_ID,
      medicineId: MEDICINE_ID,
      qtyPurchased: batch.qtyRemaining,
    }))
  );
}

function createContext(db: MockDatabaseType) {
  return {
    context: {
      reqHeaders: new Headers(),
      db,
      user: { id: USER_ID },
      session: { id: "session-id" },
      permissions: [{ level: "system", resource: "sale", action: "create" }],
      roles: [{ roleName: "ADMIN" }],
    } as unknown as ORPCContext,
  };
}

function createSaleInput({
  quantity,
  totalAmount,
}: {
  quantity: number;
  totalAmount: number;
}) {
  return {
    customerId: CUSTOMER_ID,
    customerName: "Rahim Uddin",
    items: [{ medicineId: MEDICINE_ID, quantity }],
    totalAmount,
    discountAmount: 0,
    paidAmount: totalAmount,
  };
}

function createStatsContext(row?: {
  saleCount: number;
  totalRevenue: number;
  totalPaid: number;
  dueAmount: number;
}) {
  const where = vi.fn().mockResolvedValue(row ? [row] : []);
  const from = vi.fn().mockReturnValue({ where });
  const select = vi.fn().mockReturnValue({ from });

  const context = {
    reqHeaders: new Headers(),
    db: { select },
    user: { id: USER_ID },
    session: { id: "session-id" },
    permissions: [{ level: "system", resource: "sale", action: "list" }],
    roles: [{ roleName: "admin" }],
  } as unknown as ORPCContext;

  return { context };
}

describe("sale stats procedure", () => {
  it("returns the aggregated sale totals", async () => {
    const { context } = createStatsContext({
      saleCount: 3,
      totalRevenue: 12500,
      totalPaid: 10000,
      dueAmount: 2500,
    });

    const result = await call(
      saleStatsProcedure,
      {
        filter: {
          createdAt: {
            from: "2026-10-01T00:00:00.000Z",
            to: "2026-10-31T23:59:59.999Z",
          },
        },
      },
      { context }
    );

    expect(result.data).toEqual({
      saleCount: 3,
      totalRevenue: 12500,
      totalPaid: 10000,
      dueAmount: 2500,
    });
  });

  it("returns zeroed stats when no sales match", async () => {
    const { context } = createStatsContext();

    const result = await call(saleStatsProcedure, {}, { context });

    expect(result.data).toEqual({
      saleCount: 0,
      totalRevenue: 0,
      totalPaid: 0,
      dueAmount: 0,
    });
  });
});

describe("sale create procedure", () => {
  let db: MockDatabaseType;

  beforeEach(async () => {
    db = createMockDrizzleClient();
    await applyMigrations(db);
    await seedBase(db);
  });

  it("splits a sale line across the earliest-expiry batches and decrements their stock", async () => {
    await seedBatches(db, [
      {
        id: "batch-later",
        qtyRemaining: 10,
        sellPerUnit: 12,
        costPerUnit: 7,
        expiryDate: new Date("2027-06-01T00:00:00.000Z"),
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
      },
      {
        id: "batch-earlier",
        qtyRemaining: 2,
        sellPerUnit: 10,
        costPerUnit: 6,
        expiryDate: new Date("2027-01-01T00:00:00.000Z"),
        createdAt: new Date("2026-02-01T00:00:00.000Z"),
      },
    ]);

    const { context } = createContext(db);
    const result = await call(
      saleCreateProcedure,
      createSaleInput({ quantity: 4, totalAmount: 44 }),
      { context }
    );

    expect(result.data).toMatchObject({ subtotal: 44, totalAmount: 44 });

    const items = await db
      .select()
      .from(SaleItemTable)
      .where(eq(SaleItemTable.saleId, result.data.id))
      .orderBy(asc(SaleItemTable.unitPrice));

    expect(items).toMatchObject([
      {
        medicineId: MEDICINE_ID,
        purchaseItemId: "batch-earlier",
        qty: 2,
        unitPrice: 10,
        unitCost: 6,
        lineTotal: 20,
      },
      {
        medicineId: MEDICINE_ID,
        purchaseItemId: "batch-later",
        qty: 2,
        unitPrice: 12,
        unitCost: 7,
        lineTotal: 24,
      },
    ]);

    const batches = await db
      .select({
        id: PurchaseItemTable.id,
        qtyRemaining: PurchaseItemTable.qtyRemaining,
      })
      .from(PurchaseItemTable)
      .orderBy(asc(PurchaseItemTable.id));

    expect(batches).toEqual([
      { id: "batch-earlier", qtyRemaining: 0 },
      { id: "batch-later", qtyRemaining: 8 },
    ]);
  });

  it("aggregates duplicate medicine lines before allocating batches", async () => {
    await seedBatches(db, [
      {
        id: "batch-1",
        qtyRemaining: 10,
        sellPerUnit: 10,
        costPerUnit: 6,
        expiryDate: new Date("2027-01-01T00:00:00.000Z"),
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
      },
    ]);

    const { context } = createContext(db);
    const result = await call(
      saleCreateProcedure,
      {
        ...createSaleInput({ quantity: 1, totalAmount: 30 }),
        items: [
          { medicineId: MEDICINE_ID, quantity: 1 },
          { medicineId: MEDICINE_ID, quantity: 2 },
        ],
      },
      { context }
    );

    const items = await db
      .select()
      .from(SaleItemTable)
      .where(eq(SaleItemTable.saleId, result.data.id));

    expect(items).toMatchObject([
      { purchaseItemId: "batch-1", qty: 3, lineTotal: 30 },
    ]);
  });

  it("rejects the sale without writing when the aggregated quantity exceeds available stock", async () => {
    await seedBatches(db, [
      {
        id: "batch-1",
        qtyRemaining: 3,
        sellPerUnit: 10,
        costPerUnit: 6,
        expiryDate: new Date("2027-01-01T00:00:00.000Z"),
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
      },
    ]);

    const { context } = createContext(db);

    await expect(
      call(
        saleCreateProcedure,
        createSaleInput({ quantity: 4, totalAmount: 40 }),
        { context }
      )
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });

    expect(await db.select().from(SaleTable)).toEqual([]);
    expect(await db.select().from(SaleItemTable)).toEqual([]);

    const [batch] = await db
      .select({ qtyRemaining: PurchaseItemTable.qtyRemaining })
      .from(PurchaseItemTable);
    expect(batch?.qtyRemaining).toBe(3);
  });

  it("rejects an unknown medicine", async () => {
    const { context } = createContext(db);

    await expect(
      call(
        saleCreateProcedure,
        {
          ...createSaleInput({ quantity: 1, totalAmount: 10 }),
          items: [
            {
              medicineId: "77777777-7777-4777-8777-777777777777",
              quantity: 1,
            },
          ],
        },
        { context }
      )
    ).rejects.toMatchObject({ code: "NOT_FOUND" });

    expect(await db.select().from(SaleTable)).toEqual([]);
  });
});
