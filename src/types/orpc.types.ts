import type {
  AnyContractRouter,
  InferContractRouterInputs,
  InferContractRouterOutputs,
} from "@orpc/contract";

import type { DatabaseType } from "@/db/clients/drizzle-client";
import type { AuthSession, AuthUser } from "@/features/auth/auth.server";

import type { PermissionType, RoleType } from ".";

export interface ORPCContext {
  reqHeaders: Readonly<Headers>;
  db: DatabaseType;
  user: AuthUser | null;
  session: AuthSession | null;
  permissions: Array<PermissionType>;
  roles: Array<RoleType>;
}

export type InferContractRouterType<T extends AnyContractRouter> = {
  input: InferContractRouterInputs<T>;
  output: InferContractRouterOutputs<T>;
};
