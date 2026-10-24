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
import { SignUpForm } from "@/features/auth/components/forms/SignUpForm";
import { head } from "@/lib/head";

export const Route = createFileRoute("/(auth)/_authLayout/sign-up")({
  head: ({ match }) =>
    head({
      titleByTemplate: "Sign Up",
      pathname: match.pathname,
    }),
  validateSearch: z.object({
    redirect: z.string().optional(),
    invitationId: z.uuid().optional(),
  }),
  component: SignUpPage,
});

function SignUpPage() {
  const { redirect, invitationId } = Route.useSearch();

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Let&apos;s Get Started!</CardTitle>
        <CardDescription>Sign up to explore amazing features.</CardDescription>
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
        <SignUpForm
          redirect={redirect ?? DEFAULT_AUTH_PATH}
          invitationId={invitationId}
        />
      </CardContent>
      <CardFooter>
        <div className="w-full text-center text-sm">
          Already have an account?{" "}
          <Link to="/sign-in" search={{ invitationId }} className="link">
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
