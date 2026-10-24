import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { ScrollArea } from "./scroll-area";

const tags = Array.from({ length: 24 }, (_, i) => `Tag ${i + 1}`);

const meta = {
  title: "UI/ScrollArea",
  component: ScrollArea,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ScrollArea className="h-44 w-52 rounded-md border p-2">
      <div className="flex flex-col gap-2 text-xs/relaxed text-muted-foreground">
        {tags.map((tag) => (
          <div key={tag} className="rounded-md border px-2 py-1.5 shadow-xs">
            {tag}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};
