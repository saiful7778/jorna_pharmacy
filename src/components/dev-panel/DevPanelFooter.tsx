import { useDevPanelContext } from "./DevPanelContext";

export function DevPanelFooter() {
  const { logs } = useDevPanelContext();
  return (
    <div className="flex items-center justify-between border-t bg-neutral-950 px-3.5 py-1.5">
      <span className="text-[9px] tracking-widest text-muted-foreground">
        {typeof window !== "undefined" ? window.location.pathname : ""}
      </span>
      <span className="text-[9px] text-muted-foreground">
        {logs.length} entries
      </span>
    </div>
  );
}
