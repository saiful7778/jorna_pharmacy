import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SaleClosingStats } from "./SaleClosingStats";

const { queryOptions, useQuery } = vi.hoisted(() => ({
  queryOptions: vi.fn(() => ({})),
  useQuery: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({ useQuery }));

vi.mock("@/oRPC/orpc", () => ({
  orpcTQClient: { saleClosing: { stats: { queryOptions } } },
}));

const STATS = {
  closingCount: 12,
  uncountedCount: 2,
  totalSales: 12500,
  cashReceived: 10000,
  netVariance: -250,
};

describe("SaleClosingStats", () => {
  beforeEach(() => {
    queryOptions.mockClear();
    useQuery.mockReturnValue({
      data: STATS,
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  it("shows closing count, sales, cash received, and the net variance", () => {
    render(<SaleClosingStats />);

    expect(screen.getByText("Closings")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("Total sales")).toBeInTheDocument();
    expect(screen.getByText("12,500 ৳")).toBeInTheDocument();
    expect(screen.getByText("Cash received")).toBeInTheDocument();
    expect(screen.getByText("10,000 ৳")).toBeInTheDocument();
    expect(screen.getByText("Net variance")).toBeInTheDocument();
    expect(screen.getByText("-250 ৳")).toBeInTheDocument();
    expect(screen.getByText("2 closings not counted")).toBeInTheDocument();
  });

  it("requests stats for the active period-end range", () => {
    const startTime = "2026-10-01T00:00:00.000Z";
    const endTime = "2026-10-31T23:59:59.999Z";

    render(<SaleClosingStats startTime={startTime} endTime={endTime} />);

    expect(queryOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          filter: { periodEnd: { from: startTime, to: endTime } },
        },
      })
    );
  });

  it("requests unfiltered stats when no date range is active", () => {
    render(<SaleClosingStats />);

    expect(queryOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        input: { filter: { periodEnd: undefined } },
      })
    );
  });
});
