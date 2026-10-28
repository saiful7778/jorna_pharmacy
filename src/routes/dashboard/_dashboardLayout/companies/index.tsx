import { createFileRoute } from "@tanstack/react-router";
import { Building2, Trash2 } from "lucide-react";
import { z } from "zod";

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
import {
  TabNavigation,
  TabNavigationContent,
  TabNavigationList,
  TabNavigationTrigger,
} from "@/components/tab-navigation";
import { requirePermissions } from "@/features/auth/auth.functions";
import { CompanyBinManagementTable } from "@/features/company/components/company-bin-table/CompanyBinManagementTable";
import { CompanyManagementTable } from "@/features/company/components/company-table/CompanyManagementTable";
import { usePermissionCheck } from "@/hooks/use-permission-check";
import { head } from "@/lib/head";
import { querySearchSchema } from "@/lib/querySearchSchema";
import { orpcTQClient } from "@/oRPC/orpc";

const searchFields = ["name", "phone", "address"];

export const Route = createFileRoute("/dashboard/_dashboardLayout/companies/")({
  beforeLoad: ({ context }) => {
    requirePermissions(
      context.permissions,
      [
        { level: "system", resource: "company", action: "manage" },
        { level: "system", resource: "company", action: "list" },
      ],
      context.user.id
    );
  },
  validateSearch: querySearchSchema.extend({
    view: z.enum(["active", "bin"]).default("active"),
  }),
  loaderDeps: ({ search }) => search,
  head: ({ match }) =>
    head({
      pathname: match.pathname,
      titleByTemplate: "Companies",
      description: "Manage your companies",
    }),
  loader: async ({ context: { queryClient }, deps }) => {
    await queryClient.query(
      orpcTQClient.company.list.queryOptions({
        input: {
          page: deps.page,
          limit: deps.limit,
          search: deps.search,
          searchFields,
          order: deps.order,
          orderField: deps.orderField,
        },
      })
    );
  },
  pendingComponent: LoadingComponent,
  component: RouteComponent,
});

function RouteComponent() {
  const isAllowDelete = usePermissionCheck([
    { level: "system", resource: "company", action: "delete" },
  ]);

  return (
    <DashboardShell
      header={
        <DashboardShellHeader>
          <DashboardShellTitle>Company Management</DashboardShellTitle>
          <DashboardShellDescription>
            Manage your compaines
          </DashboardShellDescription>
        </DashboardShellHeader>
      }
    >
      <TabNavigation paramName="view" routeId={Route.id} defaultTab="active">
        <TabNavigationList>
          <TabNavigationTrigger value="active">
            <Building2 />
            Active
          </TabNavigationTrigger>
          {isAllowDelete && (
            <TabNavigationTrigger value="bin">
              <Trash2 />
              Bin
            </TabNavigationTrigger>
          )}
        </TabNavigationList>
        <TabNavigationContent value="active">
          <CompanyManagementTable searchFields={searchFields} />
        </TabNavigationContent>
        {isAllowDelete && (
          <TabNavigationContent value="bin">
            <CompanyBinManagementTable searchFields={searchFields} />
          </TabNavigationContent>
        )}
      </TabNavigation>
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
