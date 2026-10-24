import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { Separator } from "./separator";

const meta = {
  title: "UI/Separator",
  component: Separator,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <div className="flex w-64 flex-col gap-4">
      <span className="text-xs/relaxed">Content above</span>
      <Separator />
      <span className="text-xs/relaxed">Content below</span>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-8 items-center gap-4">
      <span className="text-xs/relaxed">Left</span>
      <Separator orientation="vertical" />
      <span className="text-xs/relaxed">Right</span>
    </div>
  ),
};
