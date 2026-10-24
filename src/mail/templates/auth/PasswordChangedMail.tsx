/** @jsxRuntime automatic */
import { Column, Row, Text } from "react-email";

import {
  EmailHeading,
  EmailInfoCard,
  EmailLayout,
} from "../../components/EmailLayout";

export interface PasswordChangedMailProps {
  userName: string;
  appName: string;
  supportMail: string;
  changeTimestamp: string;
  ipAddress: string;
  deviceInfo: string; // e.g., "Chrome on Windows"
}

export default function PasswordChangedMail({
  userName,
  appName,
  supportMail,
  changeTimestamp,
  ipAddress,
  deviceInfo,
}: PasswordChangedMailProps) {
  return (
    <EmailLayout
      appName={appName}
      previewText="Your password was changed successfully"
      supportMail={supportMail}
    >
      <EmailHeading>Password Changed Successfully</EmailHeading>
      <Text>Hello {userName},</Text>
      <Text>
        Your {appName} account password was successfully updated. If you made
        this change, you can safely ignore this email.
      </Text>

      <EmailInfoCard>
        <Row className="mb-2">
          <Column className="text-xs text-muted-foreground">Time</Column>
          <Column className="text-right text-xs font-bold text-foreground">
            {changeTimestamp}
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

      <Text className="text-sm font-semibold text-destructive">
        If you did not make this change, your account may be compromised. Please
        contact our support team immediately.
      </Text>
    </EmailLayout>
  );
}

PasswordChangedMail.PreviewProps = {
  userName: "John Doe",
  appName: "App name",
  supportMail: "help@pp-name.com",
  changeTimestamp: "Oct 25, 2023 at 10:45 AM",
  ipAddress: "192.168.1.105",
  deviceInfo: "Chrome on Windows",
};
