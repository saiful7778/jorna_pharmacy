/** @jsxRuntime automatic */
import { Column, Row, Section, Text } from "react-email";

import { EmailButton } from "../../components/EmailButton";
import {
  EmailHeading,
  EmailInfoCard,
  EmailLayout,
} from "../../components/EmailLayout";
import { EmailLink } from "../../components/EmailLink";

export interface SuspiciousLoginMailProps {
  userName: string;
  appName: string;
  supportMail: string;
  attemptTimestamp: string;
  ipAddress: string;
  location: string; // e.g., "Lagos, Nigeria"
  deviceInfo: string;
  secureAccountUrl: string;
}

export default function SuspiciousLoginMail({
  userName,
  appName,
  supportMail,
  attemptTimestamp,
  ipAddress,
  location,
  deviceInfo,
  secureAccountUrl,
}: SuspiciousLoginMailProps) {
  return (
    <EmailLayout
      appName={appName}
      previewText="Suspicious login attempt blocked"
      supportMail={supportMail}
    >
      <EmailHeading>🚨 Suspicious Login Attempt</EmailHeading>
      <Text>Hello {userName},</Text>
      <Text>
        We noticed a suspicious login attempt to your {appName} account. Because
        the device or location was unrecognized, we blocked the sign-in attempt
        to protect your account.
      </Text>

      <EmailInfoCard>
        <Row className="mb-2">
          <Column className="text-xs text-muted-foreground">
            Attempted On
          </Column>
          <Column className="text-right text-xs font-bold text-foreground">
            {attemptTimestamp}
          </Column>
        </Row>
        <Row className="mb-2">
          <Column className="text-xs text-muted-foreground">Location</Column>
          <Column className="text-right text-xs font-bold text-foreground">
            {location}
          </Column>
        </Row>
        <Row className="mb-2">
          <Column className="text-xs text-muted-foreground">Device</Column>
          <Column className="text-right text-xs font-bold text-foreground">
            {deviceInfo}
          </Column>
        </Row>
        <Row>
          <Column className="text-xs text-muted-foreground">IP Address</Column>
          <Column className="text-right font-mono text-xs font-bold text-foreground">
            {ipAddress}
          </Column>
        </Row>
      </EmailInfoCard>

      <Text className="text-sm font-semibold text-foreground">
        Was this you? If this was you, you can ignore this message. If not,
        please secure your account immediately.
      </Text>

      <Section className="my-6 text-center">
        <EmailButton href={secureAccountUrl}>Secure My Account</EmailButton>
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

SuspiciousLoginMail.PreviewProps = {
  userName: "John Doe",
  appName: "App name",
  supportMail: "help@app-name.com",
  attemptTimestamp: "Oct 25, 2023 at 2:30 AM",
  ipAddress: "102.89.23.11",
  location: "Lagos, Nigeria",
  deviceInfo: "Firefox on Linux",
  secureAccountUrl: "http://localhost:3000/security/lock",
};
