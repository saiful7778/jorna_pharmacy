import { readFileSync } from "node:fs";
import path from "node:path";

import { call } from "@orpc/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createMockDrizzleClient,
  type MockDatabaseType,
} from "@/db/clients/drizzle-client.mock";
import { SaleClosingTable, UserTable } from "@/db/schemas";
import type { ORPCContext } from "@/types/orpc.types";

import { saleClosingCreateSchema } from "../saleClosing.schema";
import { saleClosingCreateProcedure } from "./saleClosing.procedure";

vi.mock("@/oRPC/middleware/auth.middleware", async () => {
  const { os } = await import("@orpc/server");
  const passThrough = os.middleware(({ next }) => next());

  return {
    authMiddleware: passThrough,
    userPermissionMiddleware: () => passThrough,
  };
});

const USER_ID = "11111111-1111-4111-8111-111111111111";

// full-schema.sql predates sale_closings, so the table comes from its migrations
const SALE_CLOSING_MIGRATIONS = [
  "0006_add_sale_close.sql",
  "0007_update_name.sql",
];

async function applySchema(db: MockDatabaseType) {
  const schemaPath = path.resolve(process.cwd(), "full-schema.sql");
  await db.$client.exec(readFileSync(schemaPath, "utf8"));

  for (const migration of SALE_CLOSING_MIGRATIONS) {
    const migrationPath = path.resolve(process.cwd(), "migrations", migration);
    await db.$client.exec(readFileSync(migrationPath, "utf8"));
  }
}

function createContext(db: MockDatabaseType) {
  return {
    context: {
      reqHeaders: new Headers(),
      db,
      user: { id: USER_ID },
      session: { id: "session-id" },
      permissions: [
        { level: "system", resource: "sale_closing", action: "create" },
      ],
      roles: [{ roleName: "ADMIN" }],
    } as unknown as ORPCContext,
  };
}

function createClosing(
  db: MockDatabaseType,
  input: { totalSales: number; totalSalary: number }
) {
  const { context } = createContext(db);
  return call(saleClosingCreateProcedure, input, { context });
}

describe("sale closing create procedure", () => {
  let db: MockDatabaseType;

  beforeEach(async () => {
    db = createMockDrizzleClient();
    await applySchema(db);
    await db.insert(UserTable).values({
      id: USER_ID,
      name: "John",
      email: "john@mail.com",
      role: "ADMIN",
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("stores totals, uses totalSales as cash received, and records the user", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-29T10:00:00.000Z"));

    const result = await createClosing(db, {
      totalSales: 12500,
      totalSalary: 3000,
    });

    expect(result.data).toMatchObject({
      totalSales: 12500,
      cashReceived: 12500,
      totalSalary: 3000,
      closedBy: USER_ID,
      periodStart: new Date("2026-10-29T00:00:00.000Z"),
      periodEnd: new Date("2026-10-29T10:00:00.000Z"),
    });
  });

  it("rejects a second closing on the same day", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-29T10:00:00.000Z"));
    await createClosing(db, { totalSales: 100, totalSalary: 10 });

    vi.setSystemTime(new Date("2026-10-29T18:00:00.000Z"));
    await expect(
      createClosing(db, { totalSales: 200, totalSalary: 20 })
    ).rejects.toMatchObject({ code: "ALREADY_CLOSED_TODAY" });

    const rows = await db.select().from(SaleClosingTable);
    expect(rows).toHaveLength(1);
  });

  it("starts the next closing where the previous closing ended", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-29T20:00:00.000Z"));
    await createClosing(db, { totalSales: 100, totalSalary: 10 });

    vi.setSystemTime(new Date("2026-10-30T09:00:00.000Z"));
    const result = await createClosing(db, {
      totalSales: 300,
      totalSalary: 30,
    });

    expect(result.data.periodStart).toEqual(
      new Date("2026-10-29T20:00:00.000Z")
    );
    expect(result.data.periodEnd).toEqual(new Date("2026-10-30T09:00:00.000Z"));
  });
});

describe("sale closing create schema", () => {
  it("accepts non-negative amounts entered as strings", () => {
    expect(
      saleClosingCreateSchema.parse({ totalSales: "1500.5", totalSalary: "0" })
    ).toEqual({ totalSales: 1500.5, totalSalary: 0 });
  });

  it("rejects empty and negative amounts", () => {
    expect(
      saleClosingCreateSchema.safeParse({ totalSales: "", totalSalary: 10 })
        .success
    ).toBe(false);
    expect(
      saleClosingCreateSchema.safeParse({ totalSales: 10, totalSalary: -1 })
        .success
    ).toBe(false);
  });
});
