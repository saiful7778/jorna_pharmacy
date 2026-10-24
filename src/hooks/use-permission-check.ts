import { hasPermission } from "@/features/auth/permission";
import type { PermissionType } from "@/types";
import { useAuthStore } from "@/zustand/auth/AuthStoreContext";

export function usePermissionCheck(permissions: Array<PermissionType>) {
  const userPermissions = useAuthStore((state) => state.permissions);
  const authUser = useAuthStore((state) => state.user);

  const isAllowd = hasPermission(userPermissions, permissions, {
    userId: authUser.id,
  });

  return isAllowd;
}
