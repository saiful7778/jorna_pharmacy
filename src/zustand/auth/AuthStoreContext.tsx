import { createContext, useContext, useState } from "react";

import { useStore } from "zustand";
import type { StoreApi } from "zustand";

import type { AuthSession, AuthUser } from "@/features/auth/auth.server";
import type { PermissionType, RoleType } from "@/types";

import { authStore } from "./authStore";
import type { AuthStoreAction, AuthStoreState } from "./authStore";

const AuthStoreContext = createContext<StoreApi<
  AuthStoreState & AuthStoreAction
> | null>(null);

export function AuthStoreProvider({
  children,
  user,
  session,
  roles,
  permissions,
  isAdminUser,
}: {
  children: React.ReactNode;
  user: AuthUser;
  session: AuthSession;
  roles: Array<RoleType>;
  permissions: Array<PermissionType>;
  isAdminUser: boolean;
}) {
  const [store] = useState<StoreApi<AuthStoreState & AuthStoreAction>>(() =>
    authStore(user, session, roles, permissions, isAdminUser)
  );

  return (
    <AuthStoreContext.Provider value={store}>
      {children}
    </AuthStoreContext.Provider>
  );
}

export function useAuthStore<T>(
  selector: (state: AuthStoreState & AuthStoreAction) => T
) {
  const store = useContext(AuthStoreContext);
  if (!store) {
    throw new Error("AuthStoreProvider is not found");
  }
  return useStore(store, selector);
}
