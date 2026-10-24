import type * as EffectAtom from "@effect-atom/atom-react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CustomerPaymentCreateDialog } from "./CustomerPaymentCreateDialog";

const { mutate } = vi.hoisted(() => ({ mutate: vi.fn() }));

vi.mock("../api/customerPayment.api.hook", () => ({
  useCreateCustomerPayment: () => ({ mutate, isPending: false }),
}));

vi.mock("@/features/sale/components/SaleSelectorField", () => ({
  SaleSelectorField: () => null,
}));

vi.mock("@effect-atom/atom-react", async (importOriginal) => {
  const actual = await importOriginal<typeof EffectAtom>();

  return {
    ...actual,
    useAtom: () => [true, vi.fn()],
  };
});

const CUSTOMER_A = "11111111-1111-4111-8111-111111111111";
const CUSTOMER_B = "22222222-2222-4222-8222-222222222222";

describe("CustomerPaymentCreateDialog", () => {
  beforeEach(() => {
    mutate.mockClear();
  });

  it("submits the payment for the currently selected customer", async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <CustomerPaymentCreateDialog customerId={CUSTOMER_A} />
    );

    rerender(<CustomerPaymentCreateDialog customerId={CUSTOMER_B} />);

    await user.type(screen.getByLabelText("Amount"), "100");
    await user.click(screen.getByRole("button", { name: "Record" }));

    await waitFor(() => expect(mutate).toHaveBeenCalledTimes(1));
    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({ customerId: CUSTOMER_B, amount: 100 })
    );
  });

  it("clears an in-progress payment when the customer changes", async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <CustomerPaymentCreateDialog customerId={CUSTOMER_A} />
    );

    const amountInput = screen.getByLabelText("Amount");
    await user.type(amountInput, "100");
    expect(amountInput).toHaveValue(100);

    rerender(<CustomerPaymentCreateDialog customerId={CUSTOMER_B} />);

    await waitFor(() => expect(amountInput).toHaveValue(null));
  });
});
