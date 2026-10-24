import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Toaster } from "react-hot-toast";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { TanstackQueryProvider } from "@/components/tanstack-query/tanstack-query-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { requireSessions } from "@/features/auth/auth.functions";
import { globalHead } from "@/lib/head";

interface RouterContextProps {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContextProps>()({
  beforeLoad: async () => {
    const result = await requireSessions();

    return {
      user: result?.user,
      session: result?.session,
      roles: result?.roles,
      permissions: result?.permissions,
    };
  },
  head: () => globalHead(),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const context = Route.useRouteContext();

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <TanstackQueryProvider queryClient={context.queryClient}>
          <ThemeProvider defaultTheme="system" storageKey="theme">
            <TooltipProvider>{children}</TooltipProvider>
            <Toaster
              position="top-center"
              reverseOrder={true}
              gutter={6}
              toastOptions={{
                duration: 3000,
                removeDelay: 2000,
                className: "__react-hot-toast",
              }}
            />
            <TanStackDevtools
              config={{
                position: "bottom-right",
              }}
              plugins={[
                {
                  name: "Tanstack Router",
                  render: <TanStackRouterDevtoolsPanel />,
                },
                {
                  name: "Tanstack Query",
                  render: <ReactQueryDevtoolsPanel />,
                },
              ]}
            />
          </ThemeProvider>
        </TanstackQueryProvider>
        <Scripts />
      </body>
    </html>
  );
}
