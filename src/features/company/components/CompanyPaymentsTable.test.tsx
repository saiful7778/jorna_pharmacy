import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CompanyPaymentsTable } from "./CompanyPaymentsTable";

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    params,
  }: {
    children: React.ReactNode;
    to: string;
    params: Record<string, string>;
  }) => (
    <a href={to.replace("$companyId", params.companyId ?? "")}>{children}</a>
  ),
}));

vi.mock("@/components/FormatDateCell", () => ({
  FormatDateCell: ({ value }: { value: Date | string | number }) => (
    <time>{new Date(value).toISOString()}</time>
  ),
}));

vi.mock("@/features/purchase/components/PurchaseStatusBadge", () => ({
  PurchaseStatusBadge: () => null,
}));

vi.mock("./company-details/CompanyPaymentRowAction", () => ({
  CompanyPaymentRowAction: () => null,
}));

const COMPANY_A = "11111111-1111-4111-8111-111111111111";
const COMPANY_B = "22222222-2222-4222-8222-222222222222";

const META = {
  isFirstPage: true,
  isLastPage: true,
  currentPage: 1,
  previousPage: null,
  nextPage: null,
  pageCount: 1,
  queryCount: 2,
  totalCount: 2,
};

function buildPayments() {
  return {
    meta: META,
    data: [
      {
        id: "payment-1",
        companyId: COMPANY_A,
        companyName: "Square Pharma",
        companyPhone: "01711111111",
        purchaseId: null,
        amount: 500,
        note: null,
        createdAt: new Date("2026-10-01T00:00:00.000Z"),
        purchase: null,
      },
      {
        id: "payment-2",
        companyId: COMPANY_B,
        companyName: "Beximco",
        companyPhone: null,
        purchaseId: null,
        amount: 250,
        note: null,
        createdAt: new Date("2026-10-02T00:00:00.000Z"),
        purchase: null,
      },
    ],
  };
}

describe("CompanyPaymentsTable", () => {
  it("shows the company name and phone linking to the company when enabled", () => {
    render(
      <CompanyPaymentsTable
        paymentsData={buildPayments()}
        onPageChange={vi.fn()}
        showCompany
      />
    );

    expect(screen.getByRole("columnheader", { name: "Company" })).toBeVisible();

    const companyLink = screen.getByRole("link", { name: "Square Pharma" });
    expect(companyLink).toHaveAttribute(
      "href",
      `/dashboard/companies/${COMPANY_A}`
    );
    expect(screen.getByText("01711111111")).toBeVisible();
    expect(screen.getByText("No phone")).toBeVisible();
  });

  it("hides the company column when the list is already scoped to one company", () => {
    const { container } = render(
      <CompanyPaymentsTable
        paymentsData={buildPayments()}
        onPageChange={vi.fn()}
      />
    );

    expect(
      screen.queryByRole("columnheader", { name: "Company" })
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Square Pharma")).not.toBeInTheDocument();

    const headerCells = container.querySelectorAll("thead th");
    expect(headerCells).toHaveLength(5);
  });

  it("spans the empty state across the company column when it is shown", () => {
    render(
      <CompanyPaymentsTable
        paymentsData={{ meta: META, data: [] }}
        onPageChange={vi.fn()}
        showCompany
      />
    );

    const cell = screen.getByRole("cell", { name: "No payments yet" });
    expect(cell).toHaveAttribute("colspan", "6");
  });
});
