import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { authErrors } from "@/features/auth/authErrors";
import { head } from "@/lib/head";

export const Route = createFileRoute("/(auth)/_authLayout/auth-error")({
  head: ({ match }) =>
    head({
      titleByTemplate: "Error Page",
      pathname: match.pathname,
    }),
  validateSearch: z.object({
    error: z.string().optional(),
  }),
  component: AuthErrorPage,
});

function AuthErrorPage() {
  const { error } = Route.useSearch();

  const errorInfo = error
    ? (authErrors[error] ?? {
        title: "Authentication Error",
        message: "An unexpected error occurred during authentication.",
      })
    : {
        title: "Authentication Error",
        message: "An unexpected error occurred during authentication.",
      };

  return (
    <Card>
      <div className="flex flex-col items-center justify-center">
        <AlertCircle className="size-12 text-destructive" />
        <h2 className="mb-2 text-2xl font-bold text-destructive">
          {errorInfo.title}
        </h2>
      </div>
      <CardContent className="my-4 text-center">
        <p className="mb-4 text-muted-foreground">{errorInfo.message}</p>
        <p className="mt-4 text-xs text-gray-400">{`Error code: ${error}`}</p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button
          className="flex-1"
          nativeButton={false}
          render={<Link to="/sign-in">Return to Sign In</Link>}
        />
        <Button
          className="flex-1"
          variant="outline"
          nativeButton={false}
          render={<Link to="/">Go to Homepage</Link>}
        />
      </CardFooter>
    </Card>
  );
}
