import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { endOfDay, startOfDay } from "date-fns";
import { describe, expect, it, vi } from "vitest";

import { DateRangeSelect } from "./date-range-select";

vi.mock("@/zustand/auth/AuthStoreContext", () => ({
  useAuthStore: (selector: (state: unknown) => unknown) =>
    selector({ user: { timezone: "UTC" } }),
}));

function dayButton(date: Date) {
  return document.querySelector<HTMLButtonElement>(
    `[data-day="${date.toLocaleDateString()}"]`
  );
}

describe("DateRangeSelect", () => {
  it("applies the chosen days as whole-day boundaries", async () => {
    const onApply = vi.fn();
    const user = userEvent.setup();
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 10);
    const end = new Date(today.getFullYear(), today.getMonth(), 20);

    render(<DateRangeSelect onApply={onApply} />);

    await user.click(dayButton(start)!);
    await user.click(dayButton(end)!);
    await user.click(screen.getByRole("button", { name: "Apply Range" }));

    expect(onApply).toHaveBeenCalledWith({
      start: startOfDay(start).toISOString(),
      end: endOfDay(end).toISOString(),
    });
  });

  it("shows the supplied default range and clears it", async () => {
    const onClear = vi.fn();
    const user = userEvent.setup();

    render(
      <DateRangeSelect
        defaultRange={{
          start: "2026-03-10T00:00:00.000Z",
          end: "2026-03-20T23:59:59.999Z",
        }}
        onClear={onClear}
      />
    );

    expect(screen.getByText("Selected Range")).toBeInTheDocument();
    expect(screen.getByText("March 10, 2026")).toBeInTheDocument();
    expect(screen.getByText("March 20, 2026")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear" }));

    expect(onClear).toHaveBeenCalledOnce();
    expect(screen.queryByText("Selected Range")).not.toBeInTheDocument();
  });
});
