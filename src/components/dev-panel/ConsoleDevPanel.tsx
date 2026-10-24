import { useEffect, useState } from "react";

import { cn } from "cn";

import type { LogType } from "./DevPanelContext";
import { useDevPanelContext } from "./DevPanelContext";

type FilterType = "all" | LogType;

const LOG_BADGE_STYLES: Record<LogType, string> = {
  log: "text-emerald-400 border-emerald-400/40",
  warn: "text-amber-400 border-amber-400/40",
  error: "text-red-400 border-red-400/40",
  info: "text-sky-400 border-sky-400/40",
};

const filters: Array<FilterType> = ["all", "log", "warn", "error", "info"];

const orig = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  info: console.info,
};

export function ConsoleDevPanel() {
  const [logFilter, setLogFilter] = useState<FilterType>("all");

  const { incrementErrorCount, logEndRef, logs, addLog, clearLogs } =
    useDevPanelContext();

  useEffect(() => {
    console.log = (...a) => {
      orig.log(...a);
      addLog("log", a);
    };
    console.warn = (...a) => {
      orig.warn(...a);
      incrementErrorCount();
      addLog("warn", a);
    };
    console.error = (...a) => {
      orig.error(...a);
      addLog("error", a);
    };
    console.info = (...a) => {
      orig.info(...a);
      addLog("info", a);
    };

    return () => {
      Object.assign(console, orig);
    };
  }, [incrementErrorCount, addLog]);

  const filteredLogs = logs.filter(
    (l) => logFilter === "all" || l.type === logFilter
  );

  return (
    <>
      {/* Filter bar */}
      <div className="flex items-center gap-1.5 border-b bg-neutral-950 px-3.5 py-1.5">
        {filters.map((f) => {
          const isActive = logFilter === f;
          const isAll = f === "all";
          return (
            <button
              key={f}
              type="button"
              onClick={() => setLogFilter(f)}
              className={cn(
                "rounded border px-2 py-0.5 text-[9px] tracking-widest uppercase transition-all hover:border-current",
                isActive &&
                  "border-neutral-600 bg-neutral-800 text-neutral-200",
                !isActive &&
                  isAll &&
                  "border-neutral-800 text-neutral-600 hover:border-neutral-700 hover:text-neutral-400",
                !isActive && !isAll && LOG_BADGE_STYLES[f]
              )}
            >
              {f}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => clearLogs()}
          className="ml-auto text-[9px] tracking-widest text-neutral-700 transition-colors hover:text-red-400"
        >
          CLEAR
        </button>
      </div>

      {/* Log list */}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-2 py-1.5">
        {filteredLogs.length === 0 ? (
          <p className="mt-10 text-center text-[10px] text-neutral-700">
            no logs yet
          </p>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className={cn(
                "rounded-r border-l-2 py-0.5 pr-1 pl-2 hover:bg-neutral-900/60",
                log.type === "log" && "border-l-emerald-400 text-emerald-400",
                log.type === "warn" && "border-l-amber-400 text-amber-400",
                log.type === "error" && "border-l-red-400 text-red-400",
                log.type === "info" && "border-l-sky-400 text-sky-400"
              )}
            >
              <span className="mt-px shrink-0 text-[9px] text-neutral-600">
                {log.time}
              </span>
              <pre className="m-0 text-[10px] leading-relaxed break-all whitespace-pre-wrap">
                {log.message}
              </pre>
            </div>
          ))
        )}
        <div ref={logEndRef} />
      </div>
    </>
  );
}
