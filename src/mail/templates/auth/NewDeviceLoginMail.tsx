/** @jsxRuntime automatic */
import { Column, Row, Section, Text } from "react-email";

import { EmailButton } from "../../components/EmailButton";
import {
  EmailHeading,
  EmailInfoCard,
  EmailLayout,
} from "../../components/EmailLayout";
import { EmailLink } from "../../components/EmailLink";

export interface NewDeviceLoginMailProps {
  userName: string;
  appName: string;
  supportMail: string;
  loginTimestamp: string;
  deviceInfo: string;
  browser: string;
  ipAddress: string;
  approximateLocation: string;
  secureAccountUrl: string;
}

export default function NewDeviceLoginMail({
  userName,
  appName,
  supportMail,
  loginTimestamp,
  deviceInfo,
  browser,
  ipAddress,
  approximateLocation,
  secureAccountUrl,
}: NewDeviceLoginMailProps) {
  return (
    <EmailLayout
      appName={appName}
      previewText="New device signed in to your account"
      supportMail={supportMail}
    >
      <EmailHeading>📱 New Device Login</EmailHeading>
      <Text>Hello {userName},</Text>
      <Text>
        Your {appName} account was successfully signed in to from a new device.
        If this was you, no further action is needed.
      </Text>

      <EmailInfoCard>
        <Row className="mb-2">
          <Column className="text-xs text-muted-foreground">When</Column>
          <Column className="text-right text-xs font-bold text-foreground">
            {loginTimestamp}
          </Column>
        </Row>
        <Row className="mb-2">
          <Column className="text-xs text-muted-foreground">Device</Column>
          <Column className="text-right text-xs font-bold text-foreground">
            {deviceInfo}
          </Column>
        </Row>
        <Row className="mb-2">
          <Column className="text-xs text-muted-foreground">Browser/OS</Column>
          <Column className="text-right text-xs font-bold text-foreground">
            {browser}
          </Column>
        </Row>
        <Row className="mb-2">
          <Column className="text-xs text-muted-foreground">Location</Column>
          <Column className="text-right text-xs font-bold text-foreground">
            {approximateLocation}
          </Column>
        </Row>
        <Row>
          <Column className="text-xs text-muted-foreground">IP Address</Column>
          <Column className="text-right font-mono text-xs font-bold text-foreground">
            {ipAddress}
          </Column>
        </Row>
      </EmailInfoCard>

      <Text className="text-sm text-muted-foreground">
        If you do not recognize this activity, someone else may have access to
        your account. Please secure it now.
      </Text>

      <Section className="my-6 text-center">
        <EmailButton href={secureAccountUrl}>Secure Your Account</EmailButton>
      </Section>

      <Section className="my-6">
        <Text className="text-sm text-muted-foreground">
          If the button above doesn&apos;t work, click the following link:
        </Text>
        <EmailLink href={secureAccountUrl}>{secureAccountUrl}</EmailLink>
      </Section>
    </EmailLayout>
  );
}

NewDeviceLoginMail.PreviewProps = {
  userName: "John Doe",
  appName: "App name",
  supportMail: "help@app-name.com",
  loginTimestamp: "Oct 25, 2023 at 9:15 AM",
  deviceInfo: "MacBook Pro",
  browser: "Safari 17 on macOS",
  ipAddress: "74.125.224.72",
  approximateLocation: "Mountain View, CA",
  secureAccountUrl: "http://localhost:3000/dashboard/settings/reset-password",
};
