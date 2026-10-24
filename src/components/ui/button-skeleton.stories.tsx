import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { ButtonSkeleton } from "./button-skeleton";

const meta = {
  title: "UI/Button/ButtonSkeleton",
  component: ButtonSkeleton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      options: [
        "default",
        "xs",
        "sm",
        "lg",
        "icon",
        "icon-xs",
        "icon-sm",
        "icon-lg",
      ],
      control: { type: "radio" },
    },
  },
} satisfies Meta<typeof ButtonSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: "default",
  },
};

export const Icon: Story = {
  args: {
    size: "icon",
  },
};
