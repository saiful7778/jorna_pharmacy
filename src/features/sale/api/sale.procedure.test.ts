import { call } from "@orpc/server";
import { describe, expect, it, vi } from "vitest";

import type { ORPCContext } from "@/types/orpc.types";

import { saleStatsProcedure } from "./sale.procedure";

vi.mock("@/oRPC/middleware/auth.middleware", async () => {
  const { os } = await import("@orpc/server");
  const passThrough = os.middleware(({ next }) => next());

  return {
    authMiddleware: passThrough,
    userPermissionMiddleware: () => passThrough,
  };
});

function createContext(row?: {
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
    user: { id: "11111111-1111-4111-8111-111111111111" },
    session: { id: "session-id" },
    permissions: [{ level: "system", resource: "sale", action: "list" }],
    roles: [{ roleName: "admin" }],
  } as unknown as ORPCContext;

  return { context, select };
}

describe("sale stats procedure", () => {
  it("returns the aggregated sale totals", async () => {
    const { context } = createContext({
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
    const { context } = createContext();

    const result = await call(saleStatsProcedure, {}, { context });

    expect(result.data).toEqual({
      saleCount: 0,
      totalRevenue: 0,
      totalPaid: 0,
      dueAmount: 0,
    });
  });
});
