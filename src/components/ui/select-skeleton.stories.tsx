import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { SelectSkeleton } from "./select-skeleton";

const meta = {
  title: "UI/SelectSkeleton",
  component: SelectSkeleton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      options: ["default", "sm"],
      control: { type: "radio" },
    },
  },
} satisfies Meta<typeof SelectSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: "default",
    className: "w-36",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
    className: "w-36",
  },
};
