import { useSyncExternalStore } from "react";

import { cn } from "cn";

import { DEFAULT_AUTH_PATH } from "@/constants";
import type { NODE_ENV_TYPE } from "@/types";

import { DevPanelBody } from "./DevPanelBody";
import type { EnvVarType } from "./DevPanelContext";
import { DevPanelContextProvider, useDevPanelContext } from "./DevPanelContext";

const emptySubscribe = () => () => {};

function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export function DevPanel({
  currentEnv,
  envVars,
}: {
  envVars: Array<EnvVarType>;
  currentEnv: NODE_ENV_TYPE;
}) {
  const isClient = useIsClient();

  if (!isClient) return null;
  if (currentEnv === "production") return null;
  return (
    <DevPanelContextProvider
      redirectUrl={DEFAULT_AUTH_PATH}
      currentEnv={currentEnv}
      envVars={envVars}
    >
      <DevPanelOpener />

      <DevPanelBody />
    </DevPanelContextProvider>
  );
}

function DevPanelOpener() {
  const { isOpen, openOrClosePanel } = useDevPanelContext();
  return (
    <button
      type="button"
      onClick={openOrClosePanel}
      className={cn(
        "fixed top-1/2 z-1000 flex -translate-y-1/2 flex-col items-center justify-center gap-1 border border-r-0 bg-neutral-950 p-2 font-mono text-xs font-bold tracking-widest text-neutral-400 transition-all duration-300 ease-in-out hover:bg-neutral-900 hover:text-neutral-200",
        isOpen ? "right-100" : "right-0"
      )}
      style={{ writingMode: "vertical-rl" }}
      aria-label="Toggle Dev Panel"
    >
      <span className="size-1.5 shrink-0 rounded-full bg-emerald-400 shadow-md" />
      <span>DEV</span>
    </button>
  );
}
