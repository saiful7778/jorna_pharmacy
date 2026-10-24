import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { TrendingUpIcon, UsersIcon } from "lucide-react";

import {
  Stat,
  StatDescription,
  StatIndicator,
  StatLabel,
  StatSeparator,
  StatTrend,
  StatValue,
} from "./stat";

const meta = {
  title: "UI/Stat",
  component: Stat,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof Stat>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Stat className="w-64">
      <StatLabel>Total revenue</StatLabel>
      <StatIndicator variant="badge" color="success">
        +12%
      </StatIndicator>
      <StatValue>$45,231</StatValue>
      <StatTrend trend="up">
        <TrendingUpIcon />
        +20.1% from last month
      </StatTrend>
    </Stat>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <Stat className="w-64">
      <StatLabel>Active users</StatLabel>
      <StatIndicator variant="icon" color="info">
        <UsersIcon />
      </StatIndicator>
      <StatValue>2,350</StatValue>
      <StatSeparator />
      <StatDescription>Updated 5 minutes ago</StatDescription>
    </Stat>
  ),
};
