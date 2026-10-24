import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { ButtonSpinner } from "./button-spinner";

const meta = {
  title: "UI/Button/ButtonSpinner",
  component: ButtonSpinner,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      options: [
        "default",
        "outline",
        "secondary",
        "ghost",
        "destructive",
        "link",
      ],
      control: { type: "radio" },
    },
    isLoading: {
      control: { type: "boolean" },
    },
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
} satisfies Meta<typeof ButtonSpinner>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Primary Button
 */
export const Primary: Story = {
  args: {
    variant: "default",
    size: "default",
    children: "Button",
    isLoading: true,
  },
};
