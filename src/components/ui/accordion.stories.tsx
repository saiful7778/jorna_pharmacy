import type { Meta, StoryObj } from "@storybook/tanstack-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion";

const meta = {
  title: "UI/Accordion",
  component: Accordion,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Accordion {...args} className="w-96">
      <AccordionItem value="shipping">
        <AccordionTrigger>Shipping information</AccordionTrigger>
        <AccordionContent>
          Orders are usually delivered within 2-3 business days.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="returns">
        <AccordionTrigger>Return policy</AccordionTrigger>
        <AccordionContent>
          Unopened medicines can be returned within 14 days of purchase.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="prescriptions">
        <AccordionTrigger>Prescription refills</AccordionTrigger>
        <AccordionContent>
          Refills can be requested online or by calling the pharmacy.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Multiple: Story = {
  args: {
    multiple: true,
  },
  render: (args) => (
    <Accordion {...args} className="w-96">
      <AccordionItem value="one">
        <AccordionTrigger>First section</AccordionTrigger>
        <AccordionContent>Content for the first section.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="two">
        <AccordionTrigger>Second section</AccordionTrigger>
        <AccordionContent>Content for the second section.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const DefaultOpen: Story = {
  args: {
    defaultValue: ["two"],
  },
  render: (args) => (
    <Accordion {...args} className="w-96">
      <AccordionItem value="one">
        <AccordionTrigger>First section</AccordionTrigger>
        <AccordionContent>Content for the first section.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="two">
        <AccordionTrigger>Second section</AccordionTrigger>
        <AccordionContent>This section is open by default.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
