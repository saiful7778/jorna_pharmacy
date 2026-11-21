import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CustomerPaymentsTable } from "./CustomerPaymentsTable";

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
    <a href={to.replace("$customerId", params.customerId ?? "")}>{children}</a>
  ),
}));

vi.mock("@/components/FormatDateCell", () => ({
  FormatDateCell: ({ value }: { value: Date | string | number }) => (
    <time>{new Date(value).toISOString()}</time>
  ),
}));

vi.mock("../customer-details/CustomerPaymentRowAction", () => ({
  CustomerPaymentRowAction: () => null,
}));

const CUSTOMER_A = "11111111-1111-4111-8111-111111111111";
const CUSTOMER_B = "22222222-2222-4222-8222-222222222222";

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

const FILTERS = { page: 1, limit: 20 };
const setFilters = vi.fn();

function buildPayments() {
  return {
    meta: META,
    data: [
      {
        id: "payment-1",
        customerId: CUSTOMER_A,
        customerName: "Rahim Uddin",
        customerPhone: "01711111111",
        saleId: null,
        invoiceNo: null,
        saleTotalAmount: null,
        saleCreatedAt: null,
        amount: 500,
        note: null,
        createdAt: new Date("2026-10-01T00:00:00.000Z"),
      },
      {
        id: "payment-2",
        customerId: CUSTOMER_B,
        customerName: "Karim Mia",
        customerPhone: null,
        saleId: null,
        invoiceNo: null,
        saleTotalAmount: null,
        saleCreatedAt: null,
        amount: 250,
        note: null,
        createdAt: new Date("2026-10-02T00:00:00.000Z"),
      },
    ],
  };
}

describe("CustomerPaymentsTable", () => {
  it("shows the customer name and phone linking to the customer when enabled", () => {
    render(
      <CustomerPaymentsTable
        data={buildPayments()}
        filters={FILTERS}
        setFilters={setFilters}
        showCustomer
      />
    );

    expect(
      screen.getByRole("columnheader", { name: "Customer" })
    ).toBeVisible();

    const customerLink = screen.getByRole("link", { name: "Rahim Uddin" });
    expect(customerLink).toHaveAttribute(
      "href",
      `/dashboard/customers/${CUSTOMER_A}`
    );
    expect(screen.getByText("01711111111")).toBeVisible();
    expect(screen.getByText("No phone")).toBeVisible();
  });

  it("hides the customer column when the list is already scoped to one customer", () => {
    const { container } = render(
      <CustomerPaymentsTable
        data={buildPayments()}
        filters={FILTERS}
        setFilters={setFilters}
      />
    );

    expect(
      screen.queryByRole("columnheader", { name: "Customer" })
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Rahim Uddin")).not.toBeInTheDocument();

    const headerCells = container.querySelectorAll("thead th");
    expect(headerCells).toHaveLength(5);
  });

  it("renders date, sale, amount, and note for every payment", () => {
    render(
      <CustomerPaymentsTable
        data={buildPayments()}
        filters={FILTERS}
        setFilters={setFilters}
      />
    );

    expect(screen.getAllByText("General payment")).toHaveLength(2);
    expect(screen.getAllByRole("columnheader")).toHaveLength(5);
  });

  it("spans the empty state across the customer column when it is shown", () => {
    render(
      <CustomerPaymentsTable
        data={{ meta: META, data: [] }}
        filters={FILTERS}
        setFilters={setFilters}
        showCustomer
      />
    );

    const cell = screen.getByRole("cell", { name: "No payments yet" });
    expect(cell).toHaveAttribute("colspan", "6");
  });

  it("spans the empty state across five columns without the customer column", () => {
    render(
      <CustomerPaymentsTable
        data={{ meta: META, data: [] }}
        filters={FILTERS}
        setFilters={setFilters}
      />
    );

    const cell = screen.getByRole("cell", { name: "No payments yet" });
    expect(cell).toHaveAttribute("colspan", "5");
  });
});
