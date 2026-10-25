import { createFileRoute, Navigate } from "@tanstack/react-router";

import { head } from "@/lib/head";

export const Route = createFileRoute(
  "/dashboard/_dashboardLayout/settings/_settingsLayout/"
)({
  head: ({ match }) =>
    head({
      pathname: match.pathname,
      titleByTemplate: "Settings",
    }),
  component: RouteComponent,
});

function RouteComponent() {
  return <Navigate to="/dashboard/settings/profile" />;
}
