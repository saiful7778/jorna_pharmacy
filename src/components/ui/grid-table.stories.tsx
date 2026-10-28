import type { Meta, StoryObj } from "@storybook/tanstack-react";

import {
  GridTable,
  GridTableBody,
  GridTableCell,
  GridTableHead,
  GridTableHeader,
  GridTableRow,
} from "./grid-table";
import { Input } from "./input";
import { Label } from "./label";

const meta = {
  title: "UI/GridTable",
  component: GridTable,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof GridTable>;

export default meta;
type Story = StoryObj<typeof meta>;

const rows = [
  { name: "Paracetamol 500mg", qty: "10", cost: "2.50", sell: "3.00" },
  { name: "Amoxicillin 250mg", qty: "5", cost: "8.00", sell: "10.00" },
  { name: "Cetirizine 10mg", qty: "20", cost: "1.20", sell: "1.80" },
];

export const Default: Story = {
  render: () => (
    <div className="w-full max-w-3xl">
      <GridTable>
        <GridTableHeader>
          <GridTableRow>
            <GridTableHead span={6}>
              <Label>Medicine name</Label>
            </GridTableHead>
            <GridTableHead span={2}>
              <Label>Qty</Label>
            </GridTableHead>
            <GridTableHead span={2}>
              <Label>Cost / unit</Label>
            </GridTableHead>
            <GridTableHead span={2}>
              <Label>Sell / unit</Label>
            </GridTableHead>
          </GridTableRow>
        </GridTableHeader>
        <GridTableBody>
          {rows.map((row) => (
            <div key={row.name} className="border-t">
              <GridTableRow>
                <GridTableCell span={6}>
                  <Input
                    defaultValue={row.name}
                    className="rounded-none border-none"
                  />
                </GridTableCell>
                <GridTableCell span={2}>
                  <Input
                    defaultValue={row.qty}
                    className="rounded-none border-none"
                  />
                </GridTableCell>
                <GridTableCell span={2}>
                  <Input
                    defaultValue={row.cost}
                    className="rounded-none border-none"
                  />
                </GridTableCell>
                <GridTableCell span={2}>
                  <Input
                    defaultValue={row.sell}
                    className="rounded-none border-none"
                  />
                </GridTableCell>
              </GridTableRow>
            </div>
          ))}
        </GridTableBody>
      </GridTable>
    </div>
  ),
};

export const WithExpandedRow: Story = {
  render: () => (
    <div className="w-full max-w-3xl">
      <GridTable>
        <GridTableHeader>
          <GridTableRow>
            <GridTableHead span={4}>
              <Label>Medicine name</Label>
            </GridTableHead>
            <GridTableHead span={4}>
              <Label>Generic name</Label>
            </GridTableHead>
            <GridTableHead span={4}>
              <Label>Strength</Label>
            </GridTableHead>
          </GridTableRow>
        </GridTableHeader>
        <GridTableBody>
          <div className="border-t">
            <GridTableRow>
              <GridTableCell span={4}>
                <Input
                  defaultValue="Paracetamol"
                  className="rounded-none border-none"
                />
              </GridTableCell>
              <GridTableCell span={4}>
                <Input
                  defaultValue="Acetaminophen"
                  className="rounded-none border-none"
                />
              </GridTableCell>
              <GridTableCell span={4}>
                <Input
                  defaultValue="500mg"
                  className="rounded-none border-none"
                />
              </GridTableCell>
            </GridTableRow>
            <GridTableRow className="items-start border-t">
              <GridTableCell span={12}>
                <span className="block p-2 text-xs text-muted-foreground">
                  Additional details row spans the full width.
                </span>
              </GridTableCell>
            </GridTableRow>
          </div>
        </GridTableBody>
      </GridTable>
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div className="w-full max-w-3xl">
      <GridTable>
        <GridTableHeader>
          <GridTableRow>
            <GridTableHead span={12}>
              <Label>Medicine name</Label>
            </GridTableHead>
          </GridTableRow>
        </GridTableHeader>
        <GridTableBody>
          <GridTableRow>
            <GridTableCell span={12}>
              <span className="block p-2 text-xs text-muted-foreground">
                No items added yet.
              </span>
            </GridTableCell>
          </GridTableRow>
        </GridTableBody>
      </GridTable>
    </div>
  ),
};
