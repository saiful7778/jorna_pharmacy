/** @jsxRuntime automatic */
import { Column, Row, Section, Text } from "react-email";

import { EmailButton } from "../../components/EmailButton";
import {
  EmailHeading,
  EmailInfoCard,
  EmailLayout,
} from "../../components/EmailLayout";
import { EmailLink } from "../../components/EmailLink";

export interface AccountLockedMailProps {
  userName: string;
  appName: string;
  supportMail: string;
  lockTimestamp: string;
  failedAttempts: number;
  ipAddress: string;
  unlockUrl: string;
}

export default function AccountLockedMail({
  userName,
  appName,
  supportMail,
  lockTimestamp,
  failedAttempts,
  ipAddress,
  unlockUrl,
}: AccountLockedMailProps) {
  return (
    <EmailLayout
      appName={appName}
      previewText="Your account has been locked"
      supportMail={supportMail}
    >
      <EmailHeading>🔒 Account Locked</EmailHeading>
      <Text>Hello {userName},</Text>
      <Text>
        To protect your account, we have temporarily locked access due to{" "}
        <span className="font-bold">
          {failedAttempts} failed login attempts
        </span>
        . If someone else is trying to access your account, they cannot proceed
        while it is locked.
      </Text>

      <EmailInfoCard>
        <Row className="mb-2">
          <Column className="text-xs text-muted-foreground">Locked On</Column>
          <Column className="text-right text-xs font-bold text-foreground">
            {lockTimestamp}
          </Column>
        </Row>
        <Row>
          <Column className="text-xs text-muted-foreground">
            Attacker IP Address
          </Column>
          <Column className="text-right font-mono text-xs font-bold text-foreground">
            {ipAddress}
          </Column>
        </Row>
      </EmailInfoCard>

      <Text>
        To regain access to your account, please click the button below to
        verify your identity and set a new password.
      </Text>

      <Section className="my-6 text-center">
        <EmailButton href={unlockUrl}>Unlock My Account</EmailButton>
      </Section>

      <Section className="my-6">
        <Text className="text-sm text-muted-foreground">
          If the button above doesn&apos;t work, click the following link:
        </Text>
        <EmailLink href={unlockUrl}>{unlockUrl}</EmailLink>
      </Section>

      <Text className="mt-4 text-sm text-muted-foreground">
        If you are continuously getting locked out, please contact our support
        team for assistance.
      </Text>
    </EmailLayout>
  );
}

AccountLockedMail.PreviewProps = {
  userName: "John Doe",
  appName: "App name",
  supportMail: "help@app-name.com",
  lockTimestamp: "Oct 25, 2023 at 11:00 AM",
  failedAttempts: 5,
  ipAddress: "203.0.113.42",
  unlockUrl: "http://localhost:3000/dashboard",
};
