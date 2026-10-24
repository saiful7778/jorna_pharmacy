import { createFileRoute } from "@tanstack/react-router";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileUpdateForm } from "@/features/user/components/ProfileUpdateForm";

export const Route = createFileRoute(
  "/dashboard/_dashboardLayout/settings/_settingsLayout/profile"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <ProfileUpdateForm />
      </CardContent>
    </Card>
  );
}
