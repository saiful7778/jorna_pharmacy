import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  GridTable,
  GridTableBody,
  GridTableCell,
  GridTableHead,
  GridTableHeader,
  GridTableRow,
} from "@/components/ui/grid-table";

describe("GridTable", () => {
  it("renders header and body rows with ARIA table roles", () => {
    render(
      <GridTable>
        <GridTableHeader>
          <GridTableRow>
            <GridTableHead span={4}>Name</GridTableHead>
          </GridTableRow>
        </GridTableHeader>
        <GridTableBody>
          <GridTableRow>
            <GridTableCell span={4}>Paracetamol</GridTableCell>
          </GridTableRow>
        </GridTableBody>
      </GridTable>
    );

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getAllByRole("rowgroup")).toHaveLength(2);
    expect(screen.getAllByRole("row")).toHaveLength(2);
    expect(
      screen.getByRole("columnheader", { name: "Name" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("cell", { name: "Paracetamol" })
    ).toBeInTheDocument();
  });

  it("maps span to the matching col-span class", () => {
    render(<GridTableCell span={3}>cell</GridTableCell>);
    expect(screen.getByRole("cell")).toHaveClass("col-span-3");
  });

  it("merges custom class names onto the table", () => {
    const { container } = render(<GridTable className="custom-class" />);
    expect(container.firstChild).toHaveClass("border", "custom-class");
  });
});
