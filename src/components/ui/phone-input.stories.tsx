import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { PhoneInput } from "./phone-input";

const meta = {
  title: "UI/PhoneInput",
  component: PhoneInput,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PhoneInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultCountry: "US",
    placeholder: "Enter phone number",
  },
};

export const International: Story = {
  args: {
    defaultCountry: "US",
    international: true,
    placeholder: "Enter phone number",
  },
};
