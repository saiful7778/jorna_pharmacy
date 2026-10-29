import { describe, expect, it } from "vitest";

import { calculateExpectedCash } from "./saleClosing.calc";

describe("calculateExpectedCash", () => {
  it("adds received cash to opening cash and subtracts outflows", () => {
    expect(
      calculateExpectedCash({
        openingCash: 1000,
        cashReceived: 5000,
        totalExpenses: 300,
        totalSalary: 1200,
        companyPaid: 500,
      })
    ).toBe(4000);
  });

  it("treats missing opening cash and company payment as zero", () => {
    expect(
      calculateExpectedCash({
        openingCash: null,
        cashReceived: 2000,
        totalExpenses: 100,
        totalSalary: 400,
        companyPaid: null,
      })
    ).toBe(1500);
  });
});
