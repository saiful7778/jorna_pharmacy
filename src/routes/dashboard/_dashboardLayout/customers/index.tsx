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
import { CustomerManagementTable } from "@/features/customer/components/customer-table/CustomerManagementTable";
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
  validateSearch: querySearchSchema,
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
      <CustomerManagementTable searchFields={searchFields} />
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
