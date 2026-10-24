import { createFileRoute } from "@tanstack/react-router";

import { DashboardShell } from "@/components/shared/dashboard-shell";
import {
  DashboardShellDescription,
  DashboardShellHeader,
  DashboardShellTitle,
} from "@/components/shared/dashboard-shell/DashboardShellHeader";

export const Route = createFileRoute("/dashboard/_dashboardLayout/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = Route.useRouteContext();

  return (
    <DashboardShell
      header={
        <DashboardShellHeader>
          <DashboardShellTitle>{`Welcome back, ${user.name}`}</DashboardShellTitle>
          <DashboardShellDescription>
            Manage your world and flex your power
          </DashboardShellDescription>
        </DashboardShellHeader>
      }
    ></DashboardShell>
  );
}
