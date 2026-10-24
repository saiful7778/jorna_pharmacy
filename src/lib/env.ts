import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
  server: {
    ENVIRONMENT: z
      .enum(["development", "production", "staging", "test"] as const)
      .default("development"),
    MAIL_USER: z.string(),
    MAIL_PASS: z.string(),
    BETTER_AUTH_SECRET: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
  },
  clientPrefix: "VITE_",
  client: {
    VITE_ENVIRONMENT: z
      .enum(["development", "production", "staging", "test"] as const)
      .default("development"),
    VITE_SITE_URL: z.url(),
    VITE_MAIL: z.email(),
    VITE_GOOGLE_CLIENT_ID: z.string(),
  },
  runtimeEnv: typeof window === "undefined" ? process.env : import.meta.env,
  emptyStringAsUndefined: true,
});
