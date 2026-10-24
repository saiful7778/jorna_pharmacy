import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { Spinner } from "@/components/ui/spinner";
import { getAuth } from "@/features/auth/auth.server";
import { SessionManagement } from "@/features/auth/components/SessionManagement";

const getSessions = createServerFn({ method: "GET" }).handler(async () => {
  const headers = getRequestHeaders();
  return getAuth().api.listSessions({ headers });
});

export const Route = createFileRoute(
  "/dashboard/_dashboardLayout/settings/_settingsLayout/sessions"
)({
  loader: () => getSessions(),
  pendingComponent: LoadingComponent,
  component: RouteComponent,
});

function RouteComponent() {
  const { session } = Route.useRouteContext();
  const sessions = Route.useLoaderData();

  return (
    <div>
      <h2 className="mb-2 text-2xl font-semibold">Sessions</h2>
      <SessionManagement
        sessions={sessions}
        currentSessionToken={session.token}
      />
    </div>
  );
}

function LoadingComponent() {
  return (
    <div className="flex w-full items-center justify-center p-4">
      <Spinner className="size-14 text-primary" strokeWidth={1} />
    </div>
  );
}
