import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { usePersistStorage } from "@/hooks/use-persist-storage";
import type { NODE_ENV_TYPE } from "@/types";

export type TabType = "console" | "auth" | "env" | "perf" | "storage";
export type LogType = "log" | "warn" | "error" | "info";
export interface LogEntry {
  id: number;
  type: LogType;
  message: string;
  time: string;
}
export interface EnvVarType {
  key: string;
  value: string;
}

interface DevPanelContextProps {
  envVars: Array<EnvVarType>;
  currentEnv: NODE_ENV_TYPE;
  redirectUrl: string;
  errorCount: number;
  incrementErrorCount: () => void;
  decrementErrorCount: () => void;
  clearErrorCount: () => void;
  isOpen: boolean;
  openOrClosePanel: () => void;
  logEndRef: React.RefObject<HTMLDivElement | null>;
  logs: LogEntry[];
  addLog: (type: LogType, args: unknown[]) => void;
  clearLogs: () => void;
  activeTab: TabType;
  addActiveTab: (tab: TabType) => void;
}

const DevPanelContext = createContext<DevPanelContextProps | null>(null);

interface DevPanelContextProviderProps extends React.PropsWithChildren {
  redirectUrl: string;
  currentEnv: NODE_ENV_TYPE;
  envVars: Array<EnvVarType>;
}

function DevPanelContextProvider({
  redirectUrl,
  currentEnv,
  envVars,
  children,
}: DevPanelContextProviderProps) {
  const [errorCount, setErrorCount] = useState<number>(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isOpen, setIsOpen] = usePersistStorage<boolean>(
    "dev_panel",
    false,
    "local"
  );
  const [activeTab, setActiveTab] = usePersistStorage<TabType>(
    "dev_panel_active_tab",
    "console",
    "local"
  );

  const logIdRef = useRef(0);
  const logEndRef = useRef<HTMLDivElement>(null);

  const incrementErrorCount = useCallback(() => {
    setErrorCount((p) => p + 1);
  }, []);
  const decrementErrorCount = useCallback(() => {
    setErrorCount((p) => Math.max(0, p - 1));
  }, []);
  const clearErrorCount = useCallback(() => {
    setErrorCount(0);
  }, []);

  const openOrClosePanel = useCallback(() => {
    setIsOpen((p) => !p);
  }, [setIsOpen]);

  const addLog = useCallback((type: LogType, args: unknown[]) => {
    const message = args
      .map((a) =>
        typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)
      )
      .join(" ");

    setLogs((p) => [
      ...p.slice(-299),
      {
        id: ++logIdRef.current,
        type,
        message,
        time: new Date().toLocaleTimeString("en-US", { hour12: false }),
      },
    ]);
  }, []);
  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const addActiveTab = useCallback(
    (tab: TabType) => {
      setActiveTab(tab);
    },
    [setActiveTab]
  );

  useEffect(() => {
    if (isOpen) logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs, isOpen]);

  return (
    <DevPanelContext.Provider
      value={{
        currentEnv,
        envVars,
        redirectUrl,
        errorCount,
        incrementErrorCount,
        decrementErrorCount,
        clearErrorCount,
        isOpen,
        openOrClosePanel,
        logEndRef,
        logs,
        addLog,
        clearLogs,
        activeTab,
        addActiveTab,
      }}
    >
      {children}
    </DevPanelContext.Provider>
  );
}

function useDevPanelContext() {
  const context = useContext(DevPanelContext);
  if (context === null) {
    throw new Error(
      "useDevPanelContext must be used within a DevPanelProvider"
    );
  }
  return context;
}

export { DevPanelContextProvider, useDevPanelContext };
