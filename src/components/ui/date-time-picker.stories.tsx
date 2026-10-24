import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { DateTimeDayButton, DateTimePicker } from "./date-time-picker";

const meta = {
  title: "UI/Date-Time-Picker",
  component: DateTimePicker,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    triggerVariant: {
      control: "select",
      options: ["default", "outline", "secondary", "ghost"],
    },
  },
} satisfies Meta<typeof DateTimePicker>;

export default meta;
type Story = StoryObj<typeof DateTimePicker>;

export const Basic: Story = {
  args: {
    value: new Date(),
    onSelectValue: (value) => console.log(value),
    showTimeSelection: true,
  },
  render: (args) => {
    return <DateTimePicker {...args} />;
  },
};

export const WithBookings: Story = {
  args: {
    value: new Date(),
    onSelectValue: (value) => console.log(value),
    showTimeSelection: true,
    calendarProps: {
      components: {
        DayButton: (props) => (
          <DateTimeDayButton
            {...props}
            bookings={{
              "2026-04-24": 5,
              "2026-04-25": 2,
              "2026-04-20": 10,
              "2026-05-01": 1,
            }}
          />
        ),
      },
    },
  },
  render: (args) => {
    return (
      <div>
        <DateTimePicker {...args} />
      </div>
    );
  },
};
