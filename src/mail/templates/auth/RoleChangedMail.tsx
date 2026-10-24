/** @jsxRuntime automatic */
import { Column, Row, Section, Text } from "react-email";

import { EmailButton } from "../../components/EmailButton";
import {
  EmailHeading,
  EmailInfoCard,
  EmailLayout,
} from "../../components/EmailLayout";

export interface RoleChangedMailProps {
  userName: string;
  appName: string;
  supportMail: string;
  oldRole: string;
  newRole: string;
  changedBy: string;
  permissionsUrl: string;
}

export default function RoleChangedMail({
  userName,
  appName,
  supportMail,
  oldRole,
  newRole,
  changedBy,
  permissionsUrl,
}: RoleChangedMailProps) {
  return (
    <EmailLayout
      appName={appName}
      previewText="Your account role has been updated"
      supportMail={supportMail}
    >
      <EmailHeading>Your account permissions have changed</EmailHeading>
      <Text>Hello {userName},</Text>
      <Text>
        Your role within {appName} has been updated by{" "}
        <span className="font-semibold">{changedBy}</span>.
      </Text>

      <EmailInfoCard>
        <Row>
          <Column>
            <Text className="m-0 mb-1 text-xs text-muted-foreground">
              Previous Role
            </Text>
            <Text className="m-0 text-sm font-semibold text-muted-foreground line-through">
              {oldRole}
            </Text>
          </Column>
          <Column className="px-4">
            <Text className="m-0 text-sm">→</Text>
          </Column>
          <Column>
            <Text className="m-0 mb-1 text-xs text-muted-foreground">
              New Role
            </Text>
            <Text className="m-0 text-sm font-semibold text-foreground">
              {newRole}
            </Text>
          </Column>
        </Row>
      </EmailInfoCard>

      <Section className="my-6 text-center">
        <EmailButton href={permissionsUrl}>View Your Permissions</EmailButton>
      </Section>

      <Text className="text-sm text-muted-foreground">
        If you believe this change was made in error, please contact our support
        team.
      </Text>
    </EmailLayout>
  );
}
RoleChangedMail.PreviewProps = {
  userName: "John Doe",
  appName: "App name",
  supportMail: "help@app-name.com",
  oldRole: "User",
  newRole: "System Admin",
  changedBy: "Super Admin",
  permissionsUrl: "https://localhost:3000/dashboard/permissions",
} satisfies RoleChangedMailProps;
