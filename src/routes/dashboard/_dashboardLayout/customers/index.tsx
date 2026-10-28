import { createFileRoute } from "@tanstack/react-router";
import { Trash2, Users } from "lucide-react";
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
import { CustomerBinManagementTable } from "@/features/customer/components/customer-bin-table/CustomerBinManagementTable";
import { CustomerManagementTable } from "@/features/customer/components/customer-table/CustomerManagementTable";
import { usePermissionCheck } from "@/hooks/use-permission-check";
import { head } from "@/lib/head";
import { querySearchSchema } from "@/lib/querySearchSchema";
import { orpcTQClient } from "@/oRPC/orpc";

const searchFields = ["name", "phone", "address"];

export const Route = createFileRoute("/dashboard/_dashboardLayout/customers/")({
  beforeLoad: ({ context }) => {
    requirePermissions(
      context.permissions,
      [
        { level: "system", resource: "customer", action: "manage" },
        { level: "system", resource: "customer", action: "list" },
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
      titleByTemplate: "Customers",
      description: "Manage your customers",
    }),
  loader: async ({ context: { queryClient }, deps }) => {
    await queryClient.query(
      orpcTQClient.customer.list.queryOptions({
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
    { level: "system", resource: "customer", action: "delete" },
  ]);

  return (
    <DashboardShell
      header={
        <DashboardShellHeader>
          <DashboardShellTitle>Customer Management</DashboardShellTitle>
          <DashboardShellDescription>
            Manage your customers and track their outstanding dues
          </DashboardShellDescription>
        </DashboardShellHeader>
      }
    >
      <TabNavigation paramName="view" routeId={Route.id} defaultTab="active">
        <TabNavigationList>
          <TabNavigationTrigger value="active">
            <Users />
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
          <CustomerManagementTable searchFields={searchFields} />
        </TabNavigationContent>
        {isAllowDelete && (
          <TabNavigationContent value="bin">
            <CustomerBinManagementTable searchFields={searchFields} />
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
