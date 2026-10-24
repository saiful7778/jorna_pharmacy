import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import { SearchableInputField } from "./SearchableInputField";

interface Medicine {
  id: string;
  name: string;
}

interface FormValues {
  medicine: string;
}

const medicines: Medicine[] = [
  { id: "1", name: "Napa 500" },
  { id: "2", name: "Napa Extend" },
];

interface HarnessProps {
  options: Medicine[] | undefined;
  onSearch?: (query: string) => void;
  onOptionSelect?: (option: Medicine) => void;
  onValueChange?: (value: string) => void;
}

function Harness({
  options,
  onSearch,
  onOptionSelect,
  onValueChange,
}: HarnessProps) {
  const { control } = useForm<FormValues>({ defaultValues: { medicine: "" } });

  return (
    <SearchableInputField
      control={control}
      name="medicine"
      label="Medicine"
      options={options}
      onSearch={onSearch}
      onOptionSelect={onOptionSelect}
      onValueChange={onValueChange}
      getOptionKey={(option) => option.id}
      getOptionLabel={(option) => option.name}
      searchDebounceMs={0}
    />
  );
}

describe("SearchableInputField", () => {
  it("shows only a text input and no list before the user types", () => {
    render(<Harness options={medicines} />);

    expect(screen.getByRole("combobox", { name: "Medicine" })).toBeVisible();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("searches with the typed text after the debounce", async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();
    render(<Harness options={medicines} onSearch={onSearch} />);

    await user.type(screen.getByRole("combobox", { name: "Medicine" }), "nap");

    await waitFor(() => expect(onSearch).toHaveBeenLastCalledWith("nap"));
  });

  it("opens a list below the input when results are returned", async () => {
    const user = userEvent.setup();
    render(<Harness options={medicines} />);

    await user.type(screen.getByRole("combobox", { name: "Medicine" }), "n");

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(2);
  });

  it("does not open a list when results are empty", async () => {
    const user = userEvent.setup();
    render(<Harness options={[]} />);

    await user.type(screen.getByRole("combobox", { name: "Medicine" }), "zzz");

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(screen.queryByText(/no /i)).not.toBeInTheDocument();
  });

  it("moves highlight with arrow keys and selects with Enter", async () => {
    const onOptionSelect = vi.fn();
    const user = userEvent.setup();
    render(<Harness options={medicines} onOptionSelect={onOptionSelect} />);

    const input = screen.getByRole("combobox", { name: "Medicine" });
    await user.type(input, "nap");
    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");

    expect(input).toHaveValue("Napa Extend");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(onOptionSelect).toHaveBeenCalledWith(medicines[1]);
  });

  it("closes the list when Escape is pressed", async () => {
    const user = userEvent.setup();
    render(<Harness options={medicines} />);

    await user.type(screen.getByRole("combobox", { name: "Medicine" }), "nap");
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("reports typed text through onValueChange but not when an option is picked", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<Harness options={medicines} onValueChange={onValueChange} />);

    await user.type(screen.getByRole("combobox", { name: "Medicine" }), "nap");
    expect(onValueChange).toHaveBeenLastCalledWith("nap");

    const callsBeforeSelect = onValueChange.mock.calls.length;
    await user.click(screen.getByRole("option", { name: "Napa 500" }));

    expect(onValueChange).toHaveBeenCalledTimes(callsBeforeSelect);
  });

  it("fills the input and closes the list when an option is clicked", async () => {
    const user = userEvent.setup();
    render(<Harness options={medicines} />);

    const input = screen.getByRole("combobox", { name: "Medicine" });
    await user.type(input, "nap");
    await user.click(screen.getByRole("option", { name: "Napa 500" }));

    expect(input).toHaveValue("Napa 500");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
