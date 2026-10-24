import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResetPasswordForm } from "@/features/auth/components/forms/ResetPasswordForm";
import { head } from "@/lib/head";

export const Route = createFileRoute("/(auth)/_authLayout/reset-password")({
  head: ({ match }) =>
    head({
      titleByTemplate: "Reset Password",
      pathname: match.pathname,
    }),
  validateSearch: z.object({
    error: z.string().optional(),
    token: z.string().optional(),
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const { error, token } = Route.useSearch();

  if (error) {
    return (
      <Card>
        <CardContent>
          <div className="rounded-md border-2 border-red-600 bg-destructive p-4 text-center text-xl font-medium text-white shadow-md">
            Something went wrong
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!token) {
    return (
      <Card>
        <CardContent>
          <div className="text-center text-xl font-semibold text-destructive">
            &apos;token&apos; is not found in search | query params
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Reset Password?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ResetPasswordForm token={token} />
      </CardContent>
    </Card>
  );
}
