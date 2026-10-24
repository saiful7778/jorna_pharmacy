import { createFileRoute, Outlet } from "@tanstack/react-router";

import { DashboardShell } from "@/components/shared/dashboard-shell";
import {
  DashboardShellDescription,
  DashboardShellHeader,
  DashboardShellTitle,
} from "@/components/shared/dashboard-shell/DashboardShellHeader";
import { SettingsSidebar } from "@/components/shared/sidebar/SettingsSidebar";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute(
  "/dashboard/_dashboardLayout/settings/_settingsLayout"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <DashboardShell
      header={
        <DashboardShellHeader>
          <DashboardShellTitle>Settings</DashboardShellTitle>
          <DashboardShellDescription>
            Manage your account and platform settings.
          </DashboardShellDescription>
        </DashboardShellHeader>
      }
    >
      <div className="flex flex-col gap-8 lg:flex-row">
        <SettingsSidebar />
        <Separator orientation="vertical" className="hidden lg:block" />
        <div className="w-full flex-1 lg:max-w-2xl">
          <Outlet />
        </div>
      </div>
    </DashboardShell>
  );
}
