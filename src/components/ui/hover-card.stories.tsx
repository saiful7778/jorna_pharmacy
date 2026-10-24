import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { Button } from "./button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";

const meta = {
  title: "UI/HoverCard",
  component: HoverCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof HoverCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger render={<Button variant="ghost" />}>
        Hover me
      </HoverCardTrigger>
      <HoverCardContent>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">@shadcn_ui</p>
          <p className="text-xs/relaxed text-muted-foreground">
            The React framework for building design systems and web apps.
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};
