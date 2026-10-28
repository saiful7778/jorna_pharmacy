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
  CustomerPaymentTable,
  CustomerTable,
  SaleInvoiceTable,
  SaleTable,
  UserTable,
} from "@/db/schemas";
import type { ORPCContext } from "@/types/orpc.types";

import {
  deleteCustomerProcedure,
  removeCustomerProcedure,
  restoreCustomerProcedure,
} from "./customerDelete.procedure";

vi.mock("@/oRPC/middleware/auth.middleware", async () => {
  const { os } = await import("@orpc/server");
  const passThrough = os.middleware(({ next }) => next());

  return {
    authMiddleware: passThrough,
    userPermissionMiddleware: () => passThrough,
  };
});

const USER_ID = "11111111-1111-4111-8111-111111111111";
const CUSTOMER_ID = "33333333-3333-4333-8333-333333333333";
const PAYMENT_ID = "44444444-4444-4444-8444-444444444444";
const INVOICE_ID = "99999999-9999-4999-8999-999999999999";
const SALE_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

async function applySchema(db: MockDatabaseType) {
  const schemaPath = path.resolve(process.cwd(), "full-schema.sql");
  await db.$client.exec(readFileSync(schemaPath, "utf8"));
}

async function seedCustomer(db: MockDatabaseType) {
  await db.insert(UserTable).values({
    id: USER_ID,
    name: "John",
    email: "john@mail.com",
    role: "ADMIN",
  });
  await db.insert(CustomerTable).values({
    id: CUSTOMER_ID,
    name: "Rahim Uddin",
  });
  await db.insert(CustomerPaymentTable).values({
    id: PAYMENT_ID,
    customerId: CUSTOMER_ID,
    amount: 100,
  });
}

async function seedSale(db: MockDatabaseType) {
  await db.insert(SaleInvoiceTable).values({ id: INVOICE_ID, number: "0001" });
  await db.insert(SaleTable).values({
    id: SALE_ID,
    customerId: CUSTOMER_ID,
    invoiceId: INVOICE_ID,
    subtotal: 100,
    totalAmount: 100,
    paidAmount: 0,
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
        { level: "system", resource: "customer", action: "delete" },
      ],
      roles: [{ roleName: "ADMIN" }],
    } as unknown as ORPCContext,
  };
}

describe("customer delete procedure", () => {
  let db: MockDatabaseType;

  beforeEach(async () => {
    db = createMockDrizzleClient();
    await applySchema(db);
    await seedCustomer(db);
  });

  it("soft deletes the customer together with its payments", async () => {
    const { context } = createContext(db);

    await call(
      deleteCustomerProcedure,
      { customerId: CUSTOMER_ID },
      { context }
    );

    const [customer] = await db
      .select()
      .from(CustomerTable)
      .where(eq(CustomerTable.id, CUSTOMER_ID));
    const [payment] = await db
      .select()
      .from(CustomerPaymentTable)
      .where(eq(CustomerPaymentTable.id, PAYMENT_ID));

    expect(customer?.deletedAt).toBeInstanceOf(Date);
    expect(customer?.deletedBy).toBe(USER_ID);
    expect(payment?.deletedAt).toBeInstanceOf(Date);
  });

  it("blocks the delete when the customer has a sale", async () => {
    await seedSale(db);
    const { context } = createContext(db);

    await expect(
      call(deleteCustomerProcedure, { customerId: CUSTOMER_ID }, { context })
    ).rejects.toMatchObject({ code: "HAS_SALES" });

    const [customer] = await db
      .select()
      .from(CustomerTable)
      .where(eq(CustomerTable.id, CUSTOMER_ID));
    const [payment] = await db
      .select()
      .from(CustomerPaymentTable)
      .where(eq(CustomerPaymentTable.id, PAYMENT_ID));

    expect(customer?.deletedAt).toBeNull();
    expect(payment?.deletedAt).toBeNull();
  });

  it("restores the customer with the payments deleted with it", async () => {
    const { context } = createContext(db);
    await call(
      deleteCustomerProcedure,
      { customerId: CUSTOMER_ID },
      { context }
    );

    await call(
      restoreCustomerProcedure,
      { customerId: CUSTOMER_ID },
      { context }
    );

    const [customer] = await db
      .select()
      .from(CustomerTable)
      .where(eq(CustomerTable.id, CUSTOMER_ID));
    const [payment] = await db
      .select()
      .from(CustomerPaymentTable)
      .where(eq(CustomerPaymentTable.id, PAYMENT_ID));

    expect(customer?.deletedAt).toBeNull();
    expect(payment?.deletedAt).toBeNull();
  });

  it("permanently removes the customer and its payments", async () => {
    const { context } = createContext(db);
    await call(
      deleteCustomerProcedure,
      { customerId: CUSTOMER_ID },
      { context }
    );

    await call(
      removeCustomerProcedure,
      { customerId: CUSTOMER_ID },
      { context }
    );

    expect(
      await db
        .select()
        .from(CustomerTable)
        .where(eq(CustomerTable.id, CUSTOMER_ID))
    ).toEqual([]);
    expect(await db.select().from(CustomerPaymentTable)).toEqual([]);
  });
});
