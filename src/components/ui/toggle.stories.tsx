import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { BoldIcon, ItalicIcon, UnderlineIcon } from "lucide-react";

import { Toggle } from "./toggle";

const meta = {
  title: "UI/Toggle",
  component: Toggle,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline"],
    },
    size: {
      control: "select",
      options: ["sm", "default", "lg"],
    },
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    "aria-label": "Toggle bold",
    children: <BoldIcon />,
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    "aria-label": "Toggle italic",
    children: <ItalicIcon />,
  },
};

export const WithText: Story = {
  args: {
    variant: "outline",
  },
  render: (args) => (
    <Toggle {...args}>
      <UnderlineIcon />
      Underline
    </Toggle>
  ),
};

export const Small: Story = {
  args: {
    size: "sm",
    "aria-label": "Toggle bold",
    children: <BoldIcon />,
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    "aria-label": "Toggle bold",
    children: <BoldIcon />,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    "aria-label": "Toggle bold",
    children: <BoldIcon />,
  },
};
