import { useEffect, useState } from "react";

import { useDevPanelContext } from "./DevPanelContext";

export function StoragePanel() {
  const [storage, setStorage] = useState<Record<string, string>>({});
  const { activeTab } = useDevPanelContext();

  useEffect(() => {
    if (activeTab !== "storage") return;

    const items: Record<string, string> = {};

    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) items[k] = localStorage.getItem(k) ?? "";
    }

    queueMicrotask(() => {
      setStorage(items);
    });
  }, [activeTab]);

  return (
    <div className="flex-1 space-y-1.5 overflow-y-auto p-3.5">
      {Object.keys(storage).length === 0 ? (
        <p className="mt-10 text-center text-[10px] text-neutral-700">
          localStorage is empty
        </p>
      ) : (
        Object.entries(storage).map(([key, value]) => (
          <div
            key={key}
            className="rounded-md border border-neutral-800 bg-neutral-900/60 px-3 py-2"
          >
            <div className="mb-1 flex items-start justify-between gap-2">
              <span className="text-[9px] tracking-widest text-sky-400">
                {key}
              </span>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem(key);
                  setStorage((p) => {
                    const n = { ...p };
                    delete n[key];
                    return n;
                  });
                }}
                className="text-[10px] leading-none text-neutral-700 transition-colors hover:text-red-400"
                title="Delete"
              >
                ✕
              </button>
            </div>
            <p className="max-h-14 overflow-hidden text-[10px] break-all text-neutral-400">
              {value}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
