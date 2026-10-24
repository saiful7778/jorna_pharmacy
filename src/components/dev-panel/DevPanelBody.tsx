import { cn } from "cn";

import { AuthPanel } from "./AuthPanel";
import { ConsoleDevPanel } from "./ConsoleDevPanel";
import type { TabType } from "./DevPanelContext";
import { useDevPanelContext } from "./DevPanelContext";
import { DevPanelFooter } from "./DevPanelFooter";
import { EnvVarPanel } from "./EnvVarPanel";
import { PerformancePanel } from "./PerformancePanel";
import { StoragePanel } from "./StoragePanel";

export function DevPanelBody() {
  const { currentEnv, isOpen, errorCount, activeTab, addActiveTab } =
    useDevPanelContext();

  const tabs: { id: TabType; label: string }[] = [
    {
      id: "console",
      label: errorCount ? `console (${errorCount})` : "console",
    },
    { id: "auth", label: "Auth" },
    { id: "env", label: "env" },
    { id: "perf", label: "performance" },
    { id: "storage", label: "storage" },
  ];

  return (
    <div
      className={cn(
        "fixed top-1/2 right-0 z-999 flex h-screen w-100 -translate-y-1/2 flex-col overflow-hidden border border-r-0 bg-neutral-950 font-mono shadow-md transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
      aria-label="Developer Panel"
    >
      {/* Header */}
      <div className="border-b bg-neutral-950 px-3.5 pt-3 pb-0">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] text-neutral-200">
            ◈ DEV PANEL
          </span>
          <span className="rounded border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[9px] tracking-widest text-emerald-400">
            {currentEnv}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => addActiveTab(t.id)}
              className={cn(
                "rounded-t px-3 py-1.5 text-[9px] font-bold tracking-widest uppercase transition-all",
                activeTab === t.id
                  ? "bg-neutral-800 text-neutral-100"
                  : "text-neutral-600 hover:bg-neutral-900 hover:text-neutral-400"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex min-h-0 flex-1 flex-col">
        {/* ── CONSOLE ── */}
        {activeTab === "console" && <ConsoleDevPanel />}

        {/* ── AUTH ── */}
        {activeTab === "auth" && <AuthPanel />}

        {/* ── ENV ── */}
        {activeTab === "env" && <EnvVarPanel />}

        {/* ── PERF ── */}
        {activeTab === "perf" && <PerformancePanel />}

        {/* ── STORAGE ── */}
        {activeTab === "storage" && <StoragePanel />}
      </div>

      <DevPanelFooter />
    </div>
  );
}
