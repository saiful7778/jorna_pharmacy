import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { getAuth } from "@/features/auth/auth.server";
import SetPasswordButton from "@/features/auth/components/SetPasswordButton";
import UpdatePasswordForm from "@/features/auth/components/forms/UpdatePasswordForm";

const getAccounts = createServerFn({ method: "GET" }).handler(async () => {
  const headers = getRequestHeaders();
  return getAuth().api.listUserAccounts({ headers });
});

export const Route = createFileRoute(
  "/dashboard/_dashboardLayout/settings/_settingsLayout/update-password"
)({
  loader: () => getAccounts(),
  pendingComponent: LoadingComponent,
  component: RouteComponent,
});

function RouteComponent() {
  const accounts = Route.useLoaderData();

  const hasPasswordAccount = accounts.some(
    (a) => a.providerId === "credential"
  );

  return (
    <div>
      {hasPasswordAccount ? (
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your password for improved security.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UpdatePasswordForm />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Set Password</CardTitle>
            <CardDescription>
              We will send you a password reset email to set up a password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SetPasswordButton />
          </CardContent>
        </Card>
      )}
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
