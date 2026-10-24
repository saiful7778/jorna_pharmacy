import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Building2,
  CalendarDays,
  Check,
  Mail,
  Pencil,
  Shield,
  User,
} from "lucide-react";
import z from "zod";

import { FormatDateCell } from "@/components/FormatDateCell";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatEnumValue } from "@/utils/formatEnum";
import { resolveUserImage } from "@/utils/resolveUserImage";
import { strInitials } from "@/utils/strInitials";

export const Route = createFileRoute("/dashboard/_dashboardLayout/profile")({
  validateSearch: z.object({
    tab: z
      .enum(["details", "roles", "permissions"] as const)
      .optional()
      .default("details"),
  }),
  pendingComponent: LoadingComponent,
  component: RouteComponent,
});

function RouteComponent() {
  const { user, roles, permissions } = Route.useRouteContext();

  return (
    <DashboardShell
      className="mx-auto w-full max-w-5xl"
      header={
        <DashboardShellHeader>
          <DashboardShellTitle>Profile</DashboardShellTitle>
          <DashboardShellDescription>
            Your personal profile details
          </DashboardShellDescription>
        </DashboardShellHeader>
      }
    >
      <div className="flex items-center gap-4">
        <Avatar className="size-12 shrink-0">
          <AvatarImage src={resolveUserImage(user.image)} alt={user.name} />
          <AvatarFallback>{strInitials(user.name)}</AvatarFallback>
        </Avatar>

        <div>
          <h2 className="text-base font-semibold">{user.name}</h2>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Mail className="size-3" />
            <span className="text-xs">{user.email}</span>
          </div>
        </div>
      </div>

      <TabNavigation
        defaultTab="details"
        routeId="/dashboard/_dashboardLayout/profile"
      >
        <TabNavigationList variant="line">
          <TabNavigationTrigger value="details">
            <User />
            <span>Details</span>
          </TabNavigationTrigger>

          <TabNavigationTrigger value="roles">
            <Shield />
            <span>Roles</span>
          </TabNavigationTrigger>

          <TabNavigationTrigger value="permissions">
            <Building2 />
            <span>Permissions</span>
          </TabNavigationTrigger>
        </TabNavigationList>

        <TabNavigationContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
              <CardAction>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        size="icon"
                        nativeButton={false}
                        render={<Link to="/dashboard/settings/profile" />}
                      />
                    }
                  >
                    <Pencil />
                    <span className="sr-only">update profile</span>
                  </TooltipTrigger>

                  <TooltipContent>
                    <p>Update Profile</p>
                  </TooltipContent>
                </Tooltip>
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-2">
                <div>
                  <h4 className="font-semibold">Name</h4>
                  <div className="flex items-center gap-1">
                    <User className="size-3.5" />
                    <span>{user.name}</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold">Email</h4>
                  <div className="flex items-center gap-1">
                    <Mail className="size-3.5" />
                    <span>{user.email}</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold">Joined At</h4>
                  <div className="flex items-center gap-1">
                    <CalendarDays className="size-3.5" />
                    <FormatDateCell format="PP" value={user.createdAt} />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold">Email Verified</h4>
                  <Badge
                    variant={user.emailVerified ? "default" : "outline"}
                    className="text-xs"
                  >
                    <Check className="size-3.5" />
                    <span>
                      {user.emailVerified ? "Verified" : "Not Verified"}
                    </span>
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabNavigationContent>
        <TabNavigationContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle>Roles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <section>
                <h3 className="flex items-center gap-1.5 text-muted-foreground">
                  <Shield className="size-3" />
                  <span className="text-xs font-medium">SYSTEM</span>
                </h3>
                <Separator className="my-2" />
                <div className="flex flex-wrap items-center gap-2">
                  {roles.map((role) => (
                    <Badge key={role.roleName}>
                      <User className="size-3.5" />
                      <span>{formatEnumValue(role.roleName)}</span>
                    </Badge>
                  ))}
                </div>
              </section>
            </CardContent>
          </Card>
        </TabNavigationContent>
        <TabNavigationContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <section>
                <h3 className="flex items-center gap-1.5 text-muted-foreground">
                  <Shield className="size-3" />
                  <span className="text-xs font-medium">SYSTEM</span>
                </h3>
                <Separator className="my-2" />
                <div className="flex flex-wrap items-center gap-2">
                  {permissions.map((perm) => (
                    <Badge
                      key={`${perm.level}.${perm.resource}.${perm.action}`}
                      variant="outline"
                      className="font-mono text-xs"
                    >
                      <User className="size-3.5" />
                      <span className="capitalize">{`${perm.resource} - ${perm.action}`}</span>
                    </Badge>
                  ))}
                </div>
              </section>
            </CardContent>
          </Card>
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
