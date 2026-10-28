import { useState } from "react";

import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
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
import { CompanyDeleteDialog } from "@/features/company/components/CompanyDeleteDialog";
import { CompanyUpdateDialog } from "@/features/company/components/CompanyUpdateDialog";
import {
  CompanyDetailsSkeleton,
  CompanyDetailsTab,
} from "@/features/company/components/company-details/CompanyDetailsTab";
import { CompanyPaymentsTab } from "@/features/company/components/company-details/CompanyPaymentsTab";
import { CompanyPurchasesTab } from "@/features/company/components/company-details/CompanyPurchasesTab";
import { usePermissionCheck } from "@/hooks/use-permission-check";
import { head } from "@/lib/head";
import { orpcTQClient } from "@/oRPC/orpc";

export const Route = createFileRoute(
  "/dashboard/_dashboardLayout/companies/$companyId"
)({
  beforeLoad: ({ context }) => {
    requirePermissions(
      context.permissions,
      [
        { level: "system", resource: "company", action: "manage" },
        { level: "system", resource: "company", action: "read" },
      ],
      context.user.id
    );
  },
  validateSearch: z.object({
    tab: z
      .enum(["details", "purchase", "payment"] as const)
      .optional()
      .default("details"),
    purchaseCreateDialog: z.boolean().optional().default(false),
  }),
  loaderDeps: ({ search }) => search,
  loader: async ({ context: { queryClient }, params: { companyId } }) => {
    return queryClient.query(
      orpcTQClient.company.details.queryOptions({
        input: {
          companyId,
        },
      })
    );
  },
  head: ({ match, loaderData }) =>
    head({
      pathname: match.pathname,
      titleByTemplate: loaderData
        ? `"${loaderData.data.name}" company`
        : "Company",
    }),
  pendingComponent: LoadingComponent,
  component: RouteComponent,
});

function RouteComponent() {
  const { data } = Route.useLoaderData();
  const { companyId } = Route.useParams();
  const navigate = Route.useNavigate();
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const isAllowUpdate = usePermissionCheck([
    { level: "system", resource: "company", action: "update" },
  ]);
  const isAllowDelete = usePermissionCheck([
    { level: "system", resource: "company", action: "delete" },
  ]);

  return (
    <DashboardShell
      header={
        <DashboardShellHeader>
          <LinkButton to="/dashboard/companies">
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
              <CompanyUpdateDialog
                open={openUpdateDialog}
                setOpen={setOpenUpdateDialog}
                companyId={companyId}
                companyData={{
                  name: data.name,
                  isActive: data.isActive,
                  address: data.address,
                  note: data.note,
                  phone: data.phone,
                }}
              />
            )}
            {isAllowDelete && (
              <CompanyDeleteDialog
                open={openDeleteDialog}
                setOpen={setOpenDeleteDialog}
                companyId={companyId}
                onSuccess={() => navigate({ to: "/dashboard/companies" })}
              />
            )}
          </DashboardShellHeaderActive>
        </DashboardShellHeader>
      }
    >
      <TabNavigation defaultTab="details" routeId={Route.id}>
        <TabNavigationList variant="line">
          <TabNavigationTrigger value="details">Details</TabNavigationTrigger>
          <TabNavigationTrigger value="purchase">
            Purchases
          </TabNavigationTrigger>
          <TabNavigationTrigger value="payment">Payments</TabNavigationTrigger>
        </TabNavigationList>
        <TabNavigationContent value="details">
          <CompanyDetailsTab companyId={companyId} />
        </TabNavigationContent>
        <TabNavigationContent value="purchase">
          <CompanyPurchasesTab companyId={companyId} />
        </TabNavigationContent>
        <TabNavigationContent value="payment">
          <CompanyPaymentsTab companyId={companyId} />
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
      <CompanyDetailsSkeleton />
    </DashboardShellSkeleton>
  );
}
