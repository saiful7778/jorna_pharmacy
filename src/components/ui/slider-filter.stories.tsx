import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { SliderFilter, type SliderFilterProps } from "./slider-filter";

const meta = {
  title: "UI/slider-filter",
  component: SliderFilter,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof SliderFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Range",
    min: 0,
    max: 1000,
    step: 10,
    unit: "$",
  },
  render: DefaultSliderFilter,
};

function DefaultSliderFilter(args: SliderFilterProps) {
  const [value, setValue] = useState<[number, number] | undefined>([100, 500]);

  return <SliderFilter {...args} value={value} onValueChange={setValue} />;
}

export const LargeRange: Story = {
  args: {
    placeholder: "Score",
    min: 0,
    max: 100,
    step: 1,
  },
  render: LargeRangeSliderFilter,
};

function LargeRangeSliderFilter(args: SliderFilterProps) {
  const [value, setValue] = useState<[number, number] | undefined>([20, 80]);

  return <SliderFilter {...args} value={value} onValueChange={setValue} />;
}
