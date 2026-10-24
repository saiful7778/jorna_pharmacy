/** @jsxRuntime automatic */
import { Section, Text } from "react-email";

import { EmailButton } from "../../components/EmailButton";
import {
  EmailHeading,
  EmailInfoCard,
  EmailLayout,
} from "../../components/EmailLayout";
import { EmailLink } from "../../components/EmailLink";

export interface ResetPasswordMailProps {
  userName: string;
  resetUrl: string;
  appName: string;
  supportMail: string;
  ipAddress?: string;
}

export default function ResetPasswordMail({
  userName,
  resetUrl,
  appName,
  supportMail,
  ipAddress,
}: ResetPasswordMailProps) {
  return (
    <EmailLayout
      appName={appName}
      previewText="Reset your password"
      supportMail={supportMail}
    >
      <EmailHeading>Reset your password</EmailHeading>
      <Text>Hello {userName},</Text>
      <Text>We received a request to reset your {appName} password.</Text>

      <Section className="my-6 text-center">
        <EmailButton href={resetUrl}>Reset Password</EmailButton>
      </Section>

      <Section className="my-6">
        <Text className="text-sm text-muted-foreground">
          If the button above doesn&apos;t work, click the following link:
        </Text>
        <EmailLink href={resetUrl}>{resetUrl}</EmailLink>
      </Section>

      <Text className="mb-0 text-sm text-muted-foreground">
        This link will expire in 1 hour for security reasons.
      </Text>

      {ipAddress && (
        <EmailInfoCard>
          <Text className="m-0 text-xs text-muted-foreground">
            Request originated from IP:{" "}
            <span className="font-mono">{ipAddress}</span>
          </Text>
        </EmailInfoCard>
      )}

      <Text className="mt-4 text-sm text-muted-foreground">
        If you did not request a password reset, please secure your account
        immediately or contact support.
      </Text>
    </EmailLayout>
  );
}

ResetPasswordMail.PreviewProps = {
  userName: "John Doe",
  resetUrl: "http://localhost:3000/api/auth/reset-password",
  appName: "App Name",
  supportMail: "help@app-name.com",
  ipAddress: "192.168.0.1",
} as ResetPasswordMailProps;
