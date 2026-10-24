import {
  adminClient,
  inferAdditionalFields,
  oneTapClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { env } from "@/lib/env";

import { systemAc, systemRoles } from "./access-control";
import type { AuthType } from "./auth.server";

export const authClient = createAuthClient({
  baseURL: env.VITE_SITE_URL,
  fetchOptions: {
    credentials: "include",
  },
  plugins: [
    inferAdditionalFields<AuthType>(),
    adminClient({ ac: systemAc, roles: systemRoles }),
    oneTapClient({
      clientId: env.VITE_GOOGLE_CLIENT_ID,
      autoSelect: false,
      cancelOnTapOutside: false,
      context: "signin",
    }),
  ],
});
