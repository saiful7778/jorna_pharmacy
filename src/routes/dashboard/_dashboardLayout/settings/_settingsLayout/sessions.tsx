import { createFileRoute } from "@tanstack/react-router";

import { Spinner } from "@/components/ui/spinner";
import { getSessions } from "@/features/auth/auth.functions";
import { SessionManagement } from "@/features/auth/components/SessionManagement";

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
