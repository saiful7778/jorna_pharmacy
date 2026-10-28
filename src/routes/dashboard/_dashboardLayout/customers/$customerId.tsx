import { useState } from "react";

import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeft,
  Banknote,
  BookAlert,
  CreditCard,
  Edit,
  Trash2,
} from "lucide-react";
import z from "zod";

import { LinkButton } from "@/components/LinkButton";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import {
  DashboardShellHeader,
  DashboardShellHeaderActive,
  DashboardShellTitle,
} from "@/components/shared/dashboard-shell/DashboardShellHeader";
import { DashboardShellSkeleton } from "@/components/shared/dashboard-shell/DashboardShellSkeleton";
import {
  TabNavigation,
  TabNavigationContent,
  TabNavigationList,
  TabNavigationTrigger,
} from "@/components/tab-navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonSkeleton } from "@/components/ui/button-skeleton";
import { requirePermissions } from "@/features/auth/auth.functions";
import { CustomerDeleteDialog } from "@/features/customer/components/CustomerDeleteDialog";
import { CustomerUpdateDialog } from "@/features/customer/components/CustomerUpdateDialog";
import {
  CustomerDetailsSkeleton,
  CustomerDetailsTab,
} from "@/features/customer/components/customer-details/CustomerDetailsTab";
import { CustomerPaymentsTab } from "@/features/customer/components/customer-details/CustomerPaymentsTab";
import { CustomerPurchasesTab } from "@/features/customer/components/customer-details/CustomerPurchasesTab";
import { usePermissionCheck } from "@/hooks/use-permission-check";
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
  loaderDeps: ({ search }) => search,
  loader: async ({ context: { queryClient }, params: { customerId } }) => {
    return queryClient.query(
      orpcTQClient.customer.details.queryOptions({
        input: {
          customerId,
        },
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
  const navigate = Route.useNavigate();
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const isAllowUpdate = usePermissionCheck([
    { level: "system", resource: "customer", action: "update" },
  ]);
  const isAllowDelete = usePermissionCheck([
    { level: "system", resource: "customer", action: "delete" },
  ]);

  return (
    <DashboardShell
      header={
        <DashboardShellHeader>
          <LinkButton to="/dashboard/customers">
            <ArrowLeft />
            <span>Go Back</span>
          </LinkButton>
          <div className="flex flex-wrap items-center gap-3">
            <DashboardShellTitle>{data.name}</DashboardShellTitle>
            <Badge variant={data.isActive ? "default" : "secondary"}>
              {data.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <DashboardShellHeaderActive>
            <div className="flex flex-wrap items-center gap-2">
              {isAllowUpdate && (
                <Button
                  variant="outline"
                  onClick={() => setOpenUpdateDialog(true)}
                >
                  <Edit />
                  <span>Update</span>
                </Button>
              )}
              {isAllowDelete && (
                <Button
                  variant="destructive"
                  onClick={() => setOpenDeleteDialog(true)}
                >
                  <Trash2 />
                  <span>Delete</span>
                </Button>
              )}
            </div>
            {isAllowUpdate && (
              <CustomerUpdateDialog
                open={openUpdateDialog}
                setOpen={setOpenUpdateDialog}
                customerId={customerId}
                customerData={{
                  name: data.name,
                  isActive: data.isActive,
                  address: data.address,
                  note: data.note,
                  phone: data.phone,
                }}
              />
            )}
            {isAllowDelete && (
              <CustomerDeleteDialog
                open={openDeleteDialog}
                setOpen={setOpenDeleteDialog}
                customerId={customerId}
                onSuccess={() => navigate({ to: "/dashboard/customers" })}
              />
            )}
          </DashboardShellHeaderActive>
        </DashboardShellHeader>
      }
    >
      <TabNavigation defaultTab="details" routeId={Route.id}>
        <TabNavigationList variant="line">
          <TabNavigationTrigger value="details">
            <BookAlert />
            <span>Details</span>
          </TabNavigationTrigger>
          <TabNavigationTrigger value="purchase">
            <CreditCard />
            <span>Purchases</span>
          </TabNavigationTrigger>
          <TabNavigationTrigger value="payment">
            <Banknote />
            <span>Payments</span>
          </TabNavigationTrigger>
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
