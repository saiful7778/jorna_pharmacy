import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { Status, StatusIndicator, StatusLabel } from "./status";

const meta = {
  title: "UI/Status",
  component: Status,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      options: ["default", "success", "error", "warning", "info"],
      control: { type: "radio" },
    },
  },
} satisfies Meta<typeof Status>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultStatus: Story = {
  render: () => (
    <Status variant="default">
      <StatusIndicator />
      <StatusLabel>Draft</StatusLabel>
    </Status>
  ),
};

export const Success: Story = {
  render: () => (
    <Status variant="success">
      <StatusIndicator />
      <StatusLabel>Active</StatusLabel>
    </Status>
  ),
};

export const Error: Story = {
  render: () => (
    <Status variant="error">
      <StatusIndicator />
      <StatusLabel>Failed</StatusLabel>
    </Status>
  ),
};

export const Warning: Story = {
  render: () => (
    <Status variant="warning">
      <StatusIndicator />
      <StatusLabel>Pending</StatusLabel>
    </Status>
  ),
};

export const Info: Story = {
  render: () => (
    <Status variant="info">
      <StatusIndicator />
      <StatusLabel>In progress</StatusLabel>
    </Status>
  ),
};
