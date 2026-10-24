import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ForgetPasswordForm } from "@/features/auth/components/forms/ForgetPasswordForm";
import { head } from "@/lib/head";

export const Route = createFileRoute("/(auth)/_authLayout/forgot-password")({
  head: ({ match }) =>
    head({
      titleByTemplate: "Forgot Password",
      pathname: match.pathname,
    }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  return (
    <Card>
      <div className="-mb-6 px-6">
        <Link to="/sign-in">
          <ArrowLeft className="text-muted-foreground" />
        </Link>
      </div>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Forgot Your Password?</CardTitle>
        <CardDescription>
          No worries! Let&apos;s help you get back on track.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ForgetPasswordForm />
      </CardContent>
    </Card>
  );
}
