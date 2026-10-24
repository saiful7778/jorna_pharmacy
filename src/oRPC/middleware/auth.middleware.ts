import { ORPCError } from "@orpc/client";

import type { RoleEnumType } from "@/db/schemas/enums/zod-db-enums";
import {
  getAuth,
  type AuthSession,
  type AuthUser,
} from "@/features/auth/auth.server";
import { getUserRolesAndPermission } from "@/features/auth/getUserPermission";
import { hasPermission } from "@/features/auth/permission";
import type { PermissionType, RoleType } from "@/types";
import type { ORPCContext } from "@/types/orpc.types";

import { baseOs } from "../orpc.base";

type AuthData = {
  session: AuthSession;
  user: AuthUser;
};

type RolePermissionData = {
  roles: Array<RoleType>;
  permissions: Array<PermissionType>;
};

type ResolvedAuthContext = AuthData & RolePermissionData;

export async function getAuthData(
  context: ORPCContext
): Promise<AuthData | null> {
  if (context.session != null && context.user != null) {
    return { session: context.session, user: context.user };
  }

  try {
    const sessionData = await getAuth().api.getSession({
      headers: context.reqHeaders,
    });
    if (!sessionData) return null;

    return { session: sessionData.session, user: sessionData.user };
  } catch (err) {
    if (err instanceof ORPCError) throw err;
    return null;
  }
}

export async function getRolePermissionData(
  userId: string,
  context: ORPCContext
): Promise<RolePermissionData | null> {
  if (context.roles.length > 0 && context.permissions.length > 0) {
    return { roles: context.roles, permissions: context.permissions };
  }
  try {
    return getUserRolesAndPermission(userId, context.db);
  } catch (err) {
    if (err instanceof ORPCError) throw err;
    return null;
  }
}

async function resolveAuthContext(
  context: ORPCContext
): Promise<ResolvedAuthContext | null> {
  const authData = await getAuthData(context);
  if (!authData) return null;

  const rolePermissionData = await getRolePermissionData(
    authData.user.id,
    context
  );
  if (!rolePermissionData) return null;

  return { ...authData, ...rolePermissionData };
}

export function validateRoles(
  requiredRoles: Array<string>,
  userRoles: Array<{ roleName: string }>
): boolean {
  if (requiredRoles.length === 0) return true;

  const userRolesSet = new Set(userRoles.map((role) => role.roleName));
  return requiredRoles.some((role) => userRolesSet.has(role));
}

export const authMiddleware = baseOs.middleware(
  async ({ context, next, errors }) => {
    const authData = await getAuthData(context);

    if (!authData) {
      throw errors.UNAUTHORIZED();
    }

    return next({
      context: {
        session: authData.session,
        user: authData.user,
      },
    });
  }
);

export function userRoleMiddleware(userRoles: Array<RoleEnumType>) {
  return baseOs.middleware(async ({ context, next, errors }) => {
    const resolved = await resolveAuthContext(context);

    if (!resolved) {
      throw errors.UNAUTHORIZED();
    }

    if (!validateRoles(userRoles, resolved.roles)) {
      throw errors.FORBIDDEN();
    }

    return next({ context: resolved });
  });
}

export function userPermissionMiddleware(
  userPermissions: Array<PermissionType>
) {
  return baseOs.middleware(async ({ context, next, errors }) => {
    const resolved = await resolveAuthContext(context);

    if (!resolved) {
      throw errors.UNAUTHORIZED();
    }

    const permitted = hasPermission(resolved.permissions, userPermissions, {
      userId: resolved.user.id,
    });

    if (!permitted) {
      throw errors.FORBIDDEN();
    }

    return next({ context: resolved });
  });
}
