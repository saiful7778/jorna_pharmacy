import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
} from "@tanstack/react-router";

import { SiteLogo } from "@/components/SiteLogo";
import { FieldDescription } from "@/components/ui/field";
import { APP_NAME, DEFAULT_AUTH_PATH } from "@/constants";
import { head } from "@/lib/head";

export const Route = createFileRoute("/(auth)/_authLayout")({
  beforeLoad: async ({ context }) => {
    if (context.session && context.user) {
      throw redirect({ to: DEFAULT_AUTH_PATH, replace: true });
    }
  },
  head: ({ match }) =>
    head({
      titleByTemplate: "Authentication",
      pathname: match.pathname,
      description: `Authentication pages for ${APP_NAME}`,
    }),
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <SiteLogo />
        <div>
          <Outlet />
        </div>
        <FieldDescription className="px-6 text-center">
          By clicking continue, you agree to our{" "}
          <Link className="link" to=".">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link className="link" to=".">
            Privacy Policy
          </Link>
        </FieldDescription>
      </div>
    </div>
  );
}
