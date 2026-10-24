import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { Field } from "./field";
import { Slider } from "./slider";

const meta = {
  title: "UI/Slider",
  component: Slider,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    min: {
      control: { type: "number" },
    },
    max: {
      control: { type: "number" },
    },
    step: {
      control: { type: "number" },
    },
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleValue: Story = {
  args: {
    min: 0,
    max: 100,
    defaultValue: 50,
  },
  render: (args) => {
    return (
      <Field className="w-50">
        <Slider {...args} />
      </Field>
    );
  },
};

export const Range: Story = {
  args: {
    min: 0,
    max: 100,
    defaultValue: [25, 75],
  },
  render: (args) => {
    return (
      <Field className="w-50">
        <Slider {...args} />
      </Field>
    );
  },
};
