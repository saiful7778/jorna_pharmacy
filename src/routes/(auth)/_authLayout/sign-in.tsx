import { createFileRoute, Link } from "@tanstack/react-router";
import z from "zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DEFAULT_AUTH_PATH } from "@/constants";
import { SocialAuth } from "@/features/auth/components/SocialAuth";
import { SignInForm } from "@/features/auth/components/forms/SignInForm";
import { head } from "@/lib/head";

export const Route = createFileRoute("/(auth)/_authLayout/sign-in")({
  head: ({ match }) =>
    head({
      titleByTemplate: "Sign In",
      pathname: match.pathname,
    }),
  validateSearch: z.object({
    redirect: z.string().optional(),
    invitationId: z.uuid().optional(),
  }),
  component: SignInPage,
});

function SignInPage() {
  const { redirect, invitationId } = Route.useSearch();

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Welcome back!</CardTitle>
        <CardDescription>
          Sign in to access your account and continue your journey.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SocialAuth
          redirect={redirect ?? DEFAULT_AUTH_PATH}
          invitationId={invitationId}
        />
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-card px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
        <SignInForm
          redirect={redirect ?? DEFAULT_AUTH_PATH}
          invitationId={invitationId}
        />
      </CardContent>
      <CardFooter>
        <div className="w-full text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link to="/sign-up" search={{ invitationId }} className="link">
            Sign up
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
