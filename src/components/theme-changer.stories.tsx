import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { ThemeProvider } from "./providers/theme-provider";
import { ThemeChanger } from "./theme-changer";

const meta = {
  title: "Components/ThemeChanger",
  component: ThemeChanger,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <ThemeProvider storageKey="storybook-theme">
        <Story />
      </ThemeProvider>
    ),
  ],
  tags: ["autodocs"],
} satisfies Meta<typeof ThemeChanger>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
