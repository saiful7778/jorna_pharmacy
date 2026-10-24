import { useEffect, useState } from "react";

import { formatBytes } from "@/utils/formatBytes";
import { formatDuration } from "@/utils/formatDuration";

export interface PerfEntry {
  label: string;
  value: string;
}

export function PerformancePanel() {
  const [perf, setPerf] = useState<Array<PerfEntry>>([]);

  useEffect(() => {
    const calculatePerf = () => {
      const nav = window.performance.getEntriesByType("navigation")[0] as
        PerformanceNavigationTiming | undefined;

      const mem = (
        window.performance as unknown as {
          memory?: { usedJSHeapSize: number };
        }
      ).memory;

      // ✅ JS resource calculation
      const resources = window.performance.getEntriesByType(
        "resource"
      ) as PerformanceResourceTiming[];

      const jsResources = resources.filter(
        (r) => r.initiatorType === "script" || r.name.endsWith(".js")
      );

      const jsTotals = jsResources.reduce(
        (acc, r) => {
          acc.transfer += r.transferSize || 0;
          acc.encoded += r.encodedBodySize || 0;
          acc.decoded += r.decodedBodySize || 0;
          return acc;
        },
        { transfer: 0, encoded: 0, decoded: 0 }
      );

      setPerf([
        {
          label: "DNS Lookup",
          value: nav
            ? formatDuration(nav.domainLookupEnd - nav.domainLookupStart)
            : "N/A",
        },
        {
          label: "TCP Connect",
          value: nav
            ? formatDuration(nav.connectEnd - nav.connectStart)
            : "N/A",
        },
        {
          label: "TTFB",
          value: nav
            ? formatDuration(nav.responseStart - nav.requestStart)
            : "N/A",
        },
        {
          label: "DOM Load",
          value: nav
            ? formatDuration(nav.domContentLoadedEventEnd - nav.startTime)
            : "N/A",
        },
        {
          label: "Page Load",
          value: nav ? formatDuration(nav.loadEventEnd - nav.startTime) : "N/A",
        },
        {
          label: "JS Transfer",
          value: formatBytes(jsTotals.transfer),
        },
        {
          label: "JS (gzipped)",
          value: formatBytes(jsTotals.encoded),
        },
        {
          label: "JS (parsed)",
          value: formatBytes(jsTotals.decoded),
        },
        {
          label: "JS Heap",
          value: mem ? formatBytes(mem.usedJSHeapSize) : "N/A",
        },
        {
          label: "Viewport",
          value: `${window.innerWidth} × ${window.innerHeight}px · ${window.devicePixelRatio}x`,
        },
      ]);
    };

    // Run after full load for better accuracy
    if (document.readyState === "complete") {
      calculatePerf();
    } else {
      window.addEventListener("load", calculatePerf);
      return () => window.removeEventListener("load", calculatePerf);
    }
  }, []);

  return (
    <div className="flex-1 space-y-1.5 overflow-y-auto p-3.5 text-muted-foreground">
      {perf.map(({ label, value }) => (
        <div
          key={label}
          className="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-900/60 px-3 py-2"
        >
          <span className="text-[10px] tracking-wide">{label}</span>
          <span className="text-[11px] font-bold text-amber-400">{value}</span>
        </div>
      ))}

      <div className="rounded-md border border-neutral-800 bg-neutral-900/60 px-3 py-2">
        <p className="mb-1.5 text-[9px] tracking-widest">USER AGENT</p>
        <p className="text-[9px] leading-relaxed break-all">
          {navigator.userAgent}
        </p>
      </div>
    </div>
  );
}
