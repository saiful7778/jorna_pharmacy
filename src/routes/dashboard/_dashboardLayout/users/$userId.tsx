import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import z from "zod";

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ButtonSkeleton } from "@/components/ui/button-skeleton";
import { Spinner } from "@/components/ui/spinner";
import { requirePermissions } from "@/features/auth/auth.functions";
import { DetailsStep } from "@/features/user/components/user-details/DetailsStep";
import { head } from "@/lib/head";
import { orpcTQClient } from "@/oRPC/orpc";
import { resolveUserImage } from "@/utils/resolveUserImage";
import { strInitials } from "@/utils/strInitials";

export const Route = createFileRoute(
  "/dashboard/_dashboardLayout/users/$userId"
)({
  beforeLoad: ({ context }) => {
    requirePermissions(
      context.permissions,
      [
        { level: "system", resource: "user", action: "manage" },
        { level: "system", resource: "user", action: "read" },
      ],
      context.user.id
    );
  },
  validateSearch: z.object({
    tab: z
      .enum(["details"] as const)
      .optional()
      .default("details"),
  }),
  loader: ({ context: { queryClient }, params: { userId } }) =>
    queryClient.query(
      orpcTQClient.user.details.queryOptions({
        input: {
          userId,
        },
      })
    ),
  head: ({ match, loaderData }) =>
    head({
      pathname: match.pathname,
      titleByTemplate: loaderData ? `'${loaderData.data.name}' user` : "Users",
    }),
  pendingComponent: LoadingComponent,
  component: RouteComponent,
});

function RouteComponent() {
  const { data } = Route.useLoaderData();
  const { userId } = Route.useParams();

  return (
    <DashboardShell
      className="mx-auto w-full max-w-5xl"
      header={
        <DashboardShellHeader>
          <Button
            variant="ghost"
            nativeButton={false}
            render={<Link to="/dashboard/users" />}
          >
            <ArrowLeft />
            <span>Go Back</span>
          </Button>
          <DashboardShellTitle>User Details</DashboardShellTitle>
          <DashboardShellDescription>
            View and manage user account details
          </DashboardShellDescription>
        </DashboardShellHeader>
      }
    >
      <div className="flex flex-col items-center gap-4 md:flex-row">
        <Avatar className="size-24">
          <AvatarImage src={resolveUserImage(data.image)} alt={data.name} />
          <AvatarFallback className="text-xs font-semibold uppercase">
            {strInitials(data.name)}
          </AvatarFallback>
        </Avatar>
        <div className="text-left leading-tight">
          <div className="text-2xl font-semibold">{data.name}</div>
          <div className="truncate text-sm text-muted-foreground">
            {data.email}
          </div>
        </div>
      </div>
      <TabNavigation
        defaultTab="details"
        routeId="/dashboard/_dashboardLayout/users/$userId"
      >
        <TabNavigationList variant="line">
          <TabNavigationTrigger value="details">
            <span>Details</span>
          </TabNavigationTrigger>
        </TabNavigationList>
        <TabNavigationContent value="details">
          <DetailsStep userId={userId} />
        </TabNavigationContent>
      </TabNavigation>
    </DashboardShell>
  );
}

function LoadingComponent() {
  return (
    <DashboardShellSkeleton
      className="mx-auto w-full max-w-5xl"
      header={
        <DashboardShellHeader>
          <ButtonSkeleton />
          <DashboardShellTitleSkeleton />
          <DashboardShellDescriptionSkeleton />
        </DashboardShellHeader>
      }
    >
      <div className="flex w-full items-center justify-center p-4">
        <Spinner className="size-14 text-primary" strokeWidth={1} />
      </div>
    </DashboardShellSkeleton>
  );
}
