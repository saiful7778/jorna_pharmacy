import * as React from "react";

import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { FacetedFilter, type Option } from "./faceted-filter";

const options: Option[] = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Pending", value: "pending", count: 10 },
  { label: "Suspended", value: "suspended", count: 2 },
];

const meta = {
  title: "UI/FacetedFilter",
  component: FacetedFilter,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      options: [
        "default",
        "secondary",
        "destructive",
        "outline",
        "ghost",
        "link",
      ],
      control: { type: "select" },
    },
    size: {
      options: ["default", "sm", "lg", "icon"],
      control: { type: "select" },
    },
  },
} satisfies Meta<typeof FacetedFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    options,
    placeholder: "Status",
    isMultiple: true,
  },
  render: (args) => {
    const [selectedValues, setSelectedValues] = React.useState<Set<string>>(
      new Set()
    );

    const onSelect = (option: Option, isSelected: boolean) => {
      const newSelectedValues = new Set(selectedValues);
      if (isSelected) {
        newSelectedValues.delete(option.value);
      } else {
        newSelectedValues.add(option.value);
      }
      setSelectedValues(newSelectedValues);
    };

    const onReset = () => setSelectedValues(new Set());

    return (
      <FacetedFilter
        {...args}
        selectedValues={selectedValues}
        onSelect={onSelect}
        onReset={onReset}
      />
    );
  },
};

export const SingleSelect: Story = {
  args: {
    options,
    placeholder: "Status",
    isMultiple: false,
  },
  render: (args) => {
    const [selectedValues, setSelectedValues] = React.useState<Set<string>>(
      new Set()
    );

    const onSelect = (option: Option, isSelected: boolean) => {
      setSelectedValues(isSelected ? new Set() : new Set([option.value]));
    };

    const onReset = () => setSelectedValues(new Set());

    return (
      <FacetedFilter
        {...args}
        selectedValues={selectedValues}
        onSelect={onSelect}
        onReset={onReset}
      />
    );
  },
};

export const WithCounts: Story = {
  args: {
    options: [
      { label: "Critical", value: "critical", count: 5 },
      { label: "High", value: "high", count: 12 },
      { label: "Medium", value: "medium", count: 45 },
      { label: "Low", value: "low", count: 120 },
    ],
    placeholder: "Priority",
    isMultiple: true,
  },
  render: (args) => {
    const [selectedValues, setSelectedValues] = React.useState<Set<string>>(
      new Set()
    );

    const onSelect = (option: Option, isSelected: boolean) => {
      const newSelectedValues = new Set(selectedValues);
      if (isSelected) {
        newSelectedValues.delete(option.value);
      } else {
        newSelectedValues.add(option.value);
      }
      setSelectedValues(newSelectedValues);
    };

    const onReset = () => setSelectedValues(new Set());

    return (
      <FacetedFilter
        {...args}
        selectedValues={selectedValues}
        onSelect={onSelect}
        onReset={onReset}
      />
    );
  },
};
