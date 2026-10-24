import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SaleStats } from "./SaleStats";

const { queryOptions, useQuery } = vi.hoisted(() => ({
  queryOptions: vi.fn(() => ({})),
  useQuery: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({ useQuery }));

vi.mock("@/oRPC/orpc", () => ({
  orpcTQClient: { sale: { stats: { queryOptions } } },
}));

const STATS = {
  saleCount: 7,
  totalRevenue: 12500,
  totalPaid: 10000,
  dueAmount: 2500,
};

describe("SaleStats", () => {
  beforeEach(() => {
    queryOptions.mockClear();
    useQuery.mockReturnValue({
      data: STATS,
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  it("shows the sale count, revenue, collected amount, and outstanding due", () => {
    render(<SaleStats />);

    expect(screen.getByText("Total Sales")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("Revenue")).toBeInTheDocument();
    expect(screen.getByText("12,500 ৳")).toBeInTheDocument();
    expect(screen.getByText("Collected")).toBeInTheDocument();
    expect(screen.getByText("10,000 ৳")).toBeInTheDocument();
    expect(screen.getByText("Outstanding Due")).toBeInTheDocument();
    expect(screen.getByText("2,500 ৳")).toBeInTheDocument();
  });

  it("requests stats for the active date range", () => {
    const startTime = "2026-10-01T00:00:00.000Z";
    const endTime = "2026-10-31T23:59:59.999Z";

    render(<SaleStats startTime={startTime} endTime={endTime} />);

    expect(queryOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          filter: { createdAt: { from: startTime, to: endTime } },
        },
      })
    );
  });

  it("requests unfiltered stats when no date range is active", () => {
    render(<SaleStats />);

    expect(queryOptions).toHaveBeenCalledWith(
      expect.objectContaining({ input: { filter: { createdAt: undefined } } })
    );
  });
});
