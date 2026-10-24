import {
  createRouter as createTanStackRouter,
  ErrorComponent,
} from "@tanstack/react-router";

import { createQueryClient } from "./lib/tanstack-query/query-client.orpc";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: ({ error }) => <ErrorComponent error={error} />,
    context: {
      queryClient: createQueryClient(),
    },
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
