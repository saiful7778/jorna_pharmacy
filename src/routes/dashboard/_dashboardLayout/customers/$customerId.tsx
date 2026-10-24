import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import z from "zod";

import { LinkButton } from "@/components/LinkButton";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { DashboardShellHeader } from "@/components/shared/dashboard-shell/DashboardShellHeader";
import { DashboardShellSkeleton } from "@/components/shared/dashboard-shell/DashboardShellSkeleton";
import {
  TabNavigation,
  TabNavigationContent,
  TabNavigationList,
  TabNavigationTrigger,
} from "@/components/tab-navigation";
import { Badge } from "@/components/ui/badge";
import { ButtonSkeleton } from "@/components/ui/button-skeleton";
import { requirePermissions } from "@/features/auth/auth.functions";
import {
  CustomerDetailsSkeleton,
  CustomerDetailsTab,
} from "@/features/customer/components/customer-details/CustomerDetailsTab";
import { CustomerPaymentsTab } from "@/features/customer/components/customer-details/CustomerPaymentsTab";
import { CustomerPurchasesTab } from "@/features/customer/components/customer-details/CustomerPurchasesTab";
import { head } from "@/lib/head";
import { orpcTQClient } from "@/oRPC/orpc";

export const Route = createFileRoute(
  "/dashboard/_dashboardLayout/customers/$customerId"
)({
  beforeLoad: ({ context }) => {
    requirePermissions(
      context.permissions,
      [
        { level: "system", resource: "customer", action: "manage" },
        { level: "system", resource: "customer", action: "read" },
      ],
      context.user.id
    );
  },
  validateSearch: z.object({
    tab: z
      .enum(["details", "purchase", "payment"] as const)
      .optional()
      .default("details"),
  }),
  loader: async ({ context: { queryClient }, params: { customerId } }) => {
    return queryClient.query(
      orpcTQClient.customer.details.queryOptions({
        input: { customerId },
      })
    );
  },
  head: ({ match, loaderData }) =>
    head({
      pathname: match.pathname,
      titleByTemplate: loaderData
        ? `"${loaderData.data.name}" customer`
        : "Customer",
    }),
  pendingComponent: LoadingComponent,
  component: RouteComponent,
});

function RouteComponent() {
  const { customerId } = Route.useParams();
  const { data } = Route.useLoaderData();

  return (
    <DashboardShell
      header={
        <DashboardShellHeader>
          <LinkButton to="/dashboard/customers">
            <ArrowLeft />
            <span>Go Back</span>
          </LinkButton>
        </DashboardShellHeader>
      }
    >
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-semibold tracking-tight">{data.name}</h2>
        <Badge variant={data.isActive ? "default" : "secondary"}>
          {data.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      <TabNavigation
        defaultTab="details"
        routeId="/dashboard/_dashboardLayout/customers/$customerId"
      >
        <TabNavigationList variant="line">
          <TabNavigationTrigger value="details">Details</TabNavigationTrigger>
          <TabNavigationTrigger value="purchase">Purchase</TabNavigationTrigger>
          <TabNavigationTrigger value="payment">Payments</TabNavigationTrigger>
        </TabNavigationList>
        <TabNavigationContent value="details">
          <CustomerDetailsTab customerId={customerId} />
        </TabNavigationContent>
        <TabNavigationContent value="purchase">
          <CustomerPurchasesTab customerId={customerId} />
        </TabNavigationContent>
        <TabNavigationContent value="payment">
          <CustomerPaymentsTab customerId={customerId} />
        </TabNavigationContent>
      </TabNavigation>
    </DashboardShell>
  );
}

function LoadingComponent() {
  return (
    <DashboardShellSkeleton
      header={
        <DashboardShellHeader>
          <ButtonSkeleton />
        </DashboardShellHeader>
      }
    >
      <CustomerDetailsSkeleton />
    </DashboardShellSkeleton>
  );
}
