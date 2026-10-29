import { createFileRoute } from "@tanstack/react-router";

import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbarSkeleton } from "@/components/data-table/data-table-toolbar-skeleton";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import {
  DashboardShellDescription,
  DashboardShellHeader,
  DashboardShellHeaderActive,
  DashboardShellTitle,
} from "@/components/shared/dashboard-shell/DashboardShellHeader";
import {
  DashboardShellDescriptionSkeleton,
  DashboardShellTitleSkeleton,
} from "@/components/shared/dashboard-shell/DashboardShellHeaderSkeleton";
import { DashboardShellSkeleton } from "@/components/shared/dashboard-shell/DashboardShellSkeleton";
import { requirePermissions } from "@/features/auth/auth.functions";
import { SaleClosingCreateButton } from "@/features/sale-closings/components/SaleClosingCreateDialog";
import { SaleClosingManagementTable } from "@/features/sale-closings/components/sale-closing-table/SaleClosingManagementTable";
import { usePermissionCheck } from "@/hooks/use-permission-check";
import { head } from "@/lib/head";
import { querySearchSchema, rangeFilterSchema } from "@/lib/querySearchSchema";
import { orpcTQClient } from "@/oRPC/orpc";
import { buildDateRangeFilter } from "@/utils/buildDateRangeFilter";

export const Route = createFileRoute(
  "/dashboard/_dashboardLayout/sale-closings"
)({
  beforeLoad: ({ context }) => {
    requirePermissions(
      context.permissions,
      [
        { level: "system", resource: "sale_closing", action: "manage" },
        { level: "system", resource: "sale_closing", action: "list" },
      ],
      context.user.id
    );
  },
  validateSearch: querySearchSchema.extend(rangeFilterSchema.shape),
  loaderDeps: ({ search }) => search,
  head: ({ match }) =>
    head({
      pathname: match.pathname,
      titleByTemplate: "Sale Closings",
      description: "Review sale closings, cash reconciliation and variances",
    }),
  loader: async ({ context: { queryClient }, deps }) => {
    await queryClient.query(
      orpcTQClient.saleClosing.list.queryOptions({
        input: {
          page: deps.page,
          limit: deps.limit,
          order: deps.order,
          orderField: deps.orderField,
          filter: {
            periodEnd: buildDateRangeFilter(deps.startTime, deps.endTime),
          },
        },
      })
    );
  },
  pendingComponent: LoadingComponent,
  component: RouteComponent,
});

function RouteComponent() {
  const isAllowCreate = usePermissionCheck([
    { level: "system", resource: "sale_closing", action: "create" },
  ]);

  return (
    <DashboardShell
      header={
        <DashboardShellHeader>
          <DashboardShellTitle>Sale Closings</DashboardShellTitle>
          <DashboardShellDescription>
            Review sale closings, cash reconciliation and variances
          </DashboardShellDescription>
          <DashboardShellHeaderActive>
            {isAllowCreate && <SaleClosingCreateButton />}
          </DashboardShellHeaderActive>
        </DashboardShellHeader>
      }
    >
      <SaleClosingManagementTable />
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
