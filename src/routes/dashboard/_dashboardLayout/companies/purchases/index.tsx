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
import { PurchaseBinManagementTable } from "@/features/purchase/components/purchase-bin-table/PurchaseBinManagementTable";
import { PurchaseManagementTable } from "@/features/purchase/components/purchase-table/PurchaseManagementTable";
import { usePermissionCheck } from "@/hooks/use-permission-check";
import { head } from "@/lib/head";
import { querySearchSchema, rangeFilterSchema } from "@/lib/querySearchSchema";
import { orpcTQClient } from "@/oRPC/orpc";
import { buildDateRangeFilter } from "@/utils/buildDateRangeFilter";

const searchFields: string[] = [];

export const Route = createFileRoute(
  "/dashboard/_dashboardLayout/companies/purchases/"
)({
  beforeLoad: ({ context }) => {
    requirePermissions(
      context.permissions,
      [
        { level: "system", resource: "purchase", action: "manage" },
        { level: "system", resource: "purchase", action: "list" },
      ],
      context.user.id
    );
  },
  validateSearch: querySearchSchema.extend(rangeFilterSchema.shape).extend({
    unpaidOnly: z.boolean().optional(),
    purchaseCreateDialog: z.boolean().optional().default(false),
    view: z.enum(["active", "bin"]).default("active"),
  }),
  loaderDeps: ({ search }) => search,
  head: ({ match }) =>
    head({
      pathname: match.pathname,
      titleByTemplate: "Company Purchases",
      description: "Manage your company purchases",
    }),
  loader: async ({ context: { queryClient }, deps }) => {
    await queryClient.query(
      orpcTQClient.purchase.list.queryOptions({
        input: {
          page: deps.page,
          limit: deps.limit,
          search: deps.search,
          searchFields,
          order: deps.order,
          orderField: deps.orderField,
          unpaidOnly: deps.unpaidOnly,
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
    { level: "system", resource: "purchase", action: "delete" },
  ]);

  return (
    <DashboardShell
      header={
        <DashboardShellHeader>
          <DashboardShellTitle>Purchase Management</DashboardShellTitle>
          <DashboardShellDescription>
            Manage your company purchases
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
          <PurchaseManagementTable searchFields={searchFields} />
        </TabNavigationContent>
        {isAllowDelete && (
          <TabNavigationContent value="bin">
            <PurchaseBinManagementTable searchFields={searchFields} />
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
