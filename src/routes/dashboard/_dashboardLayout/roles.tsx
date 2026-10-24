import { createFileRoute } from "@tanstack/react-router";

import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbarSkeleton } from "@/components/data-table/data-table-toolbar-skeleton";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import {
  DashboardShellDescription,
  DashboardShellHeader,
  DashboardShellTitle,
} from "@/components/shared/dashboard-shell/DashboardShellHeader";
import {
  DashboardShellDescriptionSkeleton,
  DashboardShellTitleSkeleton,
} from "@/components/shared/dashboard-shell/DashboardShellHeaderSkeleton";
import { DashboardShellSkeleton } from "@/components/shared/dashboard-shell/DashboardShellSkeleton";
import { requirePermissions } from "@/features/auth/auth.functions";
import { RoleManagementTable } from "@/features/role/components/role-table/RoleManagementTable";
import { querySearchSchema } from "@/lib/querySearchSchema";

export const Route = createFileRoute("/dashboard/_dashboardLayout/roles")({
  beforeLoad: ({ context }) => {
    requirePermissions(
      context.permissions,
      [{ level: "system", resource: "role_permission", action: "list" }],
      context.user.id
    );
  },
  validateSearch: querySearchSchema,
  pendingComponent: LoadingComponent,
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <DashboardShell
      header={
        <DashboardShellHeader>
          <DashboardShellTitle>Roles & Permissions</DashboardShellTitle>
          <DashboardShellDescription>
            Manage application user roles and permissions
          </DashboardShellDescription>
        </DashboardShellHeader>
      }
    >
      <RoleManagementTable />
    </DashboardShell>
  );
}

function LoadingComponent() {
  return (
    <DashboardShellSkeleton
      header={
        <DashboardShellHeader>
          <DashboardShellTitleSkeleton />
          <DashboardShellDescriptionSkeleton />
        </DashboardShellHeader>
      }
    >
      <DataTableSkeleton>
        <DataTableToolbarSkeleton />
      </DataTableSkeleton>
    </DashboardShellSkeleton>
  );
}
