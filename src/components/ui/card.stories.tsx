import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { Button } from "./button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

const meta = {
  title: "UI/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-72">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>You have 3 unread messages.</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm">
            Mark all read
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>Card content goes here.</CardContent>
      <CardFooter>
        <Button size="sm">Submit</Button>
      </CardFooter>
    </Card>
  ),
};

export const Small: Story = {
  args: {
    size: "sm",
  },
  render: (args) => (
    <Card {...args} className="w-64">
      <CardHeader>
        <CardTitle>Small card</CardTitle>
        <CardDescription>Compact spacing variant.</CardDescription>
      </CardHeader>
      <CardContent>Card content goes here.</CardContent>
    </Card>
  ),
};
