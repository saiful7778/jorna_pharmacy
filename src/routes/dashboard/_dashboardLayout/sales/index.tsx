import { createFileRoute } from "@tanstack/react-router";
import { ReceiptText, Trash2 } from "lucide-react";
import z from "zod";

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
import { SaleBinManagementTable } from "@/features/sale/components/sale-bin-table/SaleBinManagementTable";
import { SaleManagementTable } from "@/features/sale/components/sale-table/SaleManagementTable";
import { usePermissionCheck } from "@/hooks/use-permission-check";
import { head } from "@/lib/head";
import { querySearchSchema, rangeFilterSchema } from "@/lib/querySearchSchema";
import { orpcTQClient } from "@/oRPC/orpc";
import { buildDateRangeFilter } from "@/utils/buildDateRangeFilter";

const searchFields = ["invoiceNo", "customerPhone", "customerName"];

export const Route = createFileRoute("/dashboard/_dashboardLayout/sales/")({
  beforeLoad: ({ context }) => {
    requirePermissions(
      context.permissions,
      [
        { level: "system", resource: "sale", action: "manage" },
        { level: "system", resource: "sale", action: "list" },
      ],
      context.user.id
    );
  },
  validateSearch: querySearchSchema.extend(rangeFilterSchema.shape).extend({
    saleCreateDialog: z.boolean().optional().default(false),
    view: z.enum(["active", "bin"]).default("active"),
  }),
  loaderDeps: ({ search }) => search,
  head: ({ match }) =>
    head({
      pathname: match.pathname,
      titleByTemplate: "Sales",
      description: "Manage your sales and track outstanding dues",
    }),
  loader: async ({ context: { queryClient }, deps }) => {
    await queryClient.query(
      orpcTQClient.sale.list.queryOptions({
        input: {
          page: deps.page,
          limit: deps.limit,
          search: deps.search,
          searchFields,
          order: deps.order,
          orderField: deps.orderField,
          filter: {
            createdAt: buildDateRangeFilter(deps.startTime, deps.endTime),
          },
        },
      })
    );

    await queryClient.query(
      orpcTQClient.sale.stats.queryOptions({
        input: {
          filter: {
            createdAt: buildDateRangeFilter(deps.startTime, deps.endTime),
          },
        },
      })
    );
  },
  pendingComponent: LoadingComponent,
  component: RouteComponent,
});

function RouteComponent() {
  const isAllowDelete = usePermissionCheck([
    { level: "system", resource: "sale", action: "delete" },
  ]);

  return (
    <DashboardShell
      header={
        <DashboardShellHeader>
          <DashboardShellTitle>Sale Management</DashboardShellTitle>
          <DashboardShellDescription>
            Browse sales, track payments, and follow up on outstanding dues
          </DashboardShellDescription>
        </DashboardShellHeader>
      }
    >
      <TabNavigation paramName="view" routeId={Route.id} defaultTab="active">
        <TabNavigationList>
          <TabNavigationTrigger value="active">
            <ReceiptText />
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
          <SaleManagementTable searchFields={searchFields} />
        </TabNavigationContent>
        {isAllowDelete && (
          <TabNavigationContent value="bin">
            <SaleBinManagementTable searchFields={searchFields} />
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
