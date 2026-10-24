import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { Button } from "./button";
import { Portal, PortalBackdrop } from "./portal";

const meta = {
  title: "UI/Portal",
  component: Portal,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Portal>;

export default meta;
type Story = StoryObj<typeof meta>;

function PortalDemo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open portal
      </Button>
      {open && (
        <Portal className="items-center justify-center">
          <PortalBackdrop />
          <div className="relative flex flex-col items-center gap-4 rounded-xl bg-popover p-6 text-popover-foreground ring-1 ring-foreground/10">
            <p className="text-sm font-medium">Rendered in a portal</p>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </div>
        </Portal>
      )}
    </>
  );
}

export const Default: Story = {
  render: () => <PortalDemo />,
};
