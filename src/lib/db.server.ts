import { env as workerEnv } from "cloudflare:workers";

import { createDrizzleClient } from "@/db/clients/drizzle-client";

export const db = createDrizzleClient(workerEnv.DB);
