import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

import { env } from "@/lib/env";

const STORAGE_KEY = "settings";

export interface SettingState {
  sidebar: {
    open: boolean;
  };
}

export interface SettingAction {
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarOpen: () => void;
}

export type SettingStore = SettingState & SettingAction;

const initialState: SettingState = {
  sidebar: {
    open: true,
  },
};

export const useSettingStore = create<SettingStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        setSidebarOpen: (open) =>
          set(
            (state) => ({
              sidebar: { ...state.sidebar, open },
            }),
            false,
            `${STORAGE_KEY}/setSidebarOpen`
          ),
        toggleSidebarOpen: () =>
          set(
            (state) => ({
              sidebar: { ...state.sidebar, open: !state.sidebar.open },
            }),
            false,
            `${STORAGE_KEY}/toggleSidebarOpen`
          ),
      }),
      {
        name: STORAGE_KEY,
        version: 0,
        storage: createJSONStorage(() => window.localStorage),
      }
    ),
    {
      name: STORAGE_KEY,
      enabled: env.VITE_ENVIRONMENT === "development",
    }
  )
);
