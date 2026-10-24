import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { Checkbox } from "./checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "./field";
import { Input } from "./input";

const meta = {
  title: "UI/Field",
  component: Field,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "select",
      options: ["vertical", "horizontal", "responsive"],
    },
  },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    orientation: "vertical",
  },
  render: (args) => (
    <div className="w-80">
      <Field {...args}>
        <FieldLabel htmlFor="patient-name">Patient name</FieldLabel>
        <Input id="patient-name" placeholder="Jane Doe" />
        <FieldDescription>Enter the name as shown on the ID.</FieldDescription>
      </Field>
    </div>
  ),
};

export const WithError: Story = {
  render: () => (
    <div className="w-80">
      <Field data-invalid="true">
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input id="email" aria-invalid="true" defaultValue="invalid-email" />
        <FieldError
          errors={[{ message: "Please enter a valid email address." }]}
        />
      </Field>
    </div>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <div className="w-96">
      <Field orientation="horizontal">
        <Checkbox id="newsletter" />
        <FieldContent>
          <FieldLabel htmlFor="newsletter">Email me offers</FieldLabel>
          <FieldDescription>
            Receive occasional updates about promotions and new products.
          </FieldDescription>
        </FieldContent>
      </Field>
    </div>
  ),
};

export const Responsive: Story = {
  args: {
    orientation: "responsive",
  },
  render: (args) => (
    <div className="w-96">
      <FieldGroup>
        <Field {...args}>
          <FieldLabel htmlFor="first-name">First name</FieldLabel>
          <Input id="first-name" />
        </Field>
        <Field {...args}>
          <FieldLabel htmlFor="last-name">Last name</FieldLabel>
          <Input id="last-name" />
        </Field>
      </FieldGroup>
    </div>
  ),
};

export const Group: Story = {
  render: () => (
    <div className="w-80">
      <FieldSet>
        <FieldLegend>Delivery details</FieldLegend>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="address">Address</FieldLabel>
            <Input id="address" />
          </Field>
          <FieldSeparator>or</FieldSeparator>
          <Field>
            <FieldLabel htmlFor="pickup">Pickup location</FieldLabel>
            <Input id="pickup" />
          </Field>
        </FieldGroup>
      </FieldSet>
    </div>
  ),
};

export const WithTitle: Story = {
  render: () => (
    <div className="w-80">
      <Field orientation="horizontal">
        <FieldContent>
          <FieldTitle>Auto-refill</FieldTitle>
          <FieldDescription>
            Automatically reorder prescriptions when they are due.
          </FieldDescription>
        </FieldContent>
      </Field>
    </div>
  ),
};
