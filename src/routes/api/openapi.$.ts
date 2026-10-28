import { createFileRoute } from "@tanstack/react-router";

import { db } from "@/lib/db.server";
import { openAPIHandler } from "@/oRPC/orpc.handler";

export const Route = createFileRoute("/api/openapi/$")({
  server: {
    handlers: {
      ANY: async ({ request }) => {
        const { response } = await openAPIHandler.handle(request, {
          prefix: "/api/openapi",
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
