import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { SimpleCsrfProtectionLinkPlugin } from "@orpc/client/plugins";
import { createRouterClient } from "@orpc/server";
import type { RouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { db } from "@/lib/db.server";

import { router } from "./orpc.router";

const getORPCClient = createIsomorphicFn()
  .server(() =>
    createRouterClient(router, {
      context: () => ({
        reqHeaders: getRequestHeaders(),
        db,
        user: null,
        session: null,
        roles: [],
        permissions: [],
      }),
    })
  )
  .client((): RouterClient<typeof router> => {
    const link = new RPCLink({
      url: () => {
        if (typeof window === "undefined") {
          throw new Error("RPCLink is not allowed on the server side.");
        }

        return `${window.location.origin}/api/rpc`;
      },
      plugins: [new SimpleCsrfProtectionLinkPlugin()],
    });
    return createORPCClient(link);
  });

export const orpcClient: RouterClient<typeof router> = getORPCClient();

export const orpcTQClient = createTanstackQueryUtils(orpcClient);
