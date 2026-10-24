import { createFileRoute } from "@tanstack/react-router";

import { db } from "@/lib/db.server";
import { rpcHandler } from "@/oRPC/orpc.handler";

export const Route = createFileRoute("/api/rpc/$")({
  server: {
    handlers: {
      ANY: async ({ request }) => {
        const { response } = await rpcHandler.handle(request, {
          prefix: "/api/rpc",
          context: {
            reqHeaders: request.headers,
            db,
            user: null,
            session: null,
            roles: [],
            permissions: [],
          },
        });

        return response ?? new Response("Not Found", { status: 404 });
      },
    },
  },
});
