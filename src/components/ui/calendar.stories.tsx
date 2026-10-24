import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { Calendar } from "./calendar";

const meta = {
  title: "UI/Calendar",
  component: Calendar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  args: {
    mode: "single",
    className: "rounded-lg border shadow-sm",
  },
};

export const MultipleMonths: Story = {
  args: {
    mode: "single",
    numberOfMonths: 2,
    className: "rounded-lg border shadow-sm",
  },
};
