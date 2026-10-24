import {
  ActionTypeEnumSchema,
  PermissionLevelEnumSchema,
  type ActionTypeEnumType,
} from "@/db/schemas/enums/zod-db-enums";
import type { PermissionType } from "@/types";

function buildPermissionMap(
  permissions: Array<PermissionType>
): Map<string, Set<ActionTypeEnumType>> {
  const permissionMap = new Map<string, Set<ActionTypeEnumType>>();

  for (const p of permissions) {
    const key = `${p.level}:${p.resource}`;

    if (!permissionMap.has(key)) {
      permissionMap.set(key, new Set());
    }

    // Handle manage wildcard
    if (p.action === ActionTypeEnumSchema.enum.manage) {
      for (const action of ActionTypeEnumSchema.options) {
        permissionMap.get(key)!.add(action);
      }
    } else {
      permissionMap.get(key)!.add(p.action);
    }
  }

  return permissionMap;
}

export function hasPermission(
  userPermissions: Array<PermissionType>,
  requiredPermissions: Array<PermissionType>,
  context: { userId?: string; resourceId?: string }
): boolean {
  if (requiredPermissions.length === 0) return true;
  if (userPermissions.length === 0) return false;

  const permissionMap = buildPermissionMap(userPermissions);

  for (const { level, resource, action } of requiredPermissions) {
    // Handle self-level permissions
    if (level === PermissionLevelEnumSchema.enum.self) {
      if (
        context.userId &&
        context.resourceId &&
        context.userId !== context.resourceId
      ) {
        continue;
      }
    }

    const key = `${level}:${resource}`;
    const actions = permissionMap.get(key);

    if (actions && actions.has(action)) {
      return true;
    }
  }

  return false;
}
