import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { AppSidebar } from "@/components/shared/sidebar/AppSidebar";
import { Topbar } from "@/components/shared/topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DEFAULT_UNAUTH_PATH } from "@/constants";
import { RoleEnumSchema } from "@/db/schemas/enums/zod-db-enums";
import { AuthStoreProvider } from "@/zustand/auth/AuthStoreContext";
import { useSettingStore } from "@/zustand/setting/settingStore";

export const Route = createFileRoute("/dashboard/_dashboardLayout")({
  beforeLoad: async ({ location, context }) => {
    const user = context.user;
    const session = context.session;
    const roles = context.roles;
    const permissions = context.permissions;

    if (!user || !session || !roles || !permissions) {
      throw redirect({
        href: DEFAULT_UNAUTH_PATH,
        search: { redirect: location.pathname },
        replace: true,
      });
    }

    return {
      user,
      session,
      roles,
      permissions,
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { session, user, roles, permissions } = Route.useRouteContext();

  const sidebarOpen = useSettingStore((state) => state.sidebar.open);
  const setSidebarOpen = useSettingStore((state) => state.setSidebarOpen);

  const isAdminUser = roles.some(
    ({ roleName }) =>
      roleName === RoleEnumSchema.enum.ADMIN ||
      roleName === RoleEnumSchema.enum.SUPER_ADMIN
  );

  return (
    <AuthStoreProvider
      session={session}
      user={user}
      permissions={permissions}
      roles={roles}
      isAdminUser={isAdminUser}
    >
      <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <AppSidebar />
        <SidebarInset>
          <Topbar />
          <main className="min-h-[calc(100vh-84px)] flex-1">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AuthStoreProvider>
  );
}
