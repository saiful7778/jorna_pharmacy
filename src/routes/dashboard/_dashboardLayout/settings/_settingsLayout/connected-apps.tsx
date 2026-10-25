import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { Spinner } from "@/components/ui/spinner";
import { getAuth } from "@/features/auth/auth.server";
import LinkingApps from "@/features/auth/components/LinkingApps";
import { head } from "@/lib/head";

const getConnectedAccounts = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = getRequestHeaders();
    return getAuth().api.listUserAccounts({ headers });
  }
);

export const Route = createFileRoute(
  "/dashboard/_dashboardLayout/settings/_settingsLayout/connected-apps"
)({
  loader: () => getConnectedAccounts(),
  head: ({ match }) =>
    head({
      pathname: match.pathname,
      titleByTemplate: "Connections",
    }),
  pendingComponent: LoadingComponent,
  component: RouteComponent,
});

function RouteComponent() {
  const accounts = Route.useLoaderData();

  const nonCredentialAccounts = accounts.filter(
    (a) => a.providerId !== "credential"
  );
  return (
    <div>
      <h2 className="mb-2 text-2xl font-semibold">Connected apps</h2>
      <LinkingApps currentAccounts={nonCredentialAccounts} />
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
