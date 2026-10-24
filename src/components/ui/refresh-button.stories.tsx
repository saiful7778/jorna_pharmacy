import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { RefreshButton } from "./refresh-button";

const meta = {
  title: "UI/RefreshButton",
  component: RefreshButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      options: ["default", "xs", "sm", "lg", "icon", "icon-xs", "icon-sm"],
      control: { type: "radio" },
    },
  },
} satisfies Meta<typeof RefreshButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isLoading: false,
    onButtonClick: () => {},
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
    onButtonClick: () => {},
  },
};
