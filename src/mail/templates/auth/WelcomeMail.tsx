/** @jsxRuntime automatic */
import { Section, Text } from "react-email";

import { EmailButton } from "../../components/EmailButton";
import { EmailHeading, EmailLayout } from "../../components/EmailLayout";
import { EmailLink } from "../../components/EmailLink";

export interface WelcomeMailProps {
  userName: string;
  appName: string;
  supportMail: string;
  dashboardUrl: string;
}

export default function WelcomeMail({
  userName,
  appName,
  supportMail,
  dashboardUrl,
}: WelcomeMailProps) {
  return (
    <EmailLayout
      appName={appName}
      previewText="Welcome! Your account is ready."
      supportMail={supportMail}
    >
      <EmailHeading>👋 Welcome to {appName}!</EmailHeading>

      <Text>Hello {userName},</Text>

      <Text>
        Your account has been successfully created. We&apos;re thrilled to have
        you on board!
      </Text>

      <Section className="my-6 text-center">
        <EmailButton href={dashboardUrl}>Go to Dashboard</EmailButton>
      </Section>

      <Section className="my-6">
        <Text className="text-sm text-muted-foreground">
          If the button above doesn&apos;t work, click the following link:
        </Text>
        <EmailLink href={dashboardUrl}>{dashboardUrl}</EmailLink>
      </Section>

      <Text className="text-sm text-muted-foreground">
        If you have any questions or need help getting set up, our support team
        is always here to help. Just reply to this email or reach out at{" "}
        <EmailLink href={`mailto:${supportMail}`}>{supportMail}</EmailLink>.
      </Text>
    </EmailLayout>
  );
}

WelcomeMail.PreviewProps = {
  userName: "Jane Smith",
  appName: "App name",
  supportMail: "help@app-name.com",
  dashboardUrl: "http://localhost:3000/dashboard",
};
