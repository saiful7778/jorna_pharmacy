import { useDevPanelContext } from "./DevPanelContext";

export function EnvVarPanel() {
  const { envVars } = useDevPanelContext();
  return (
    <div className="flex-1 space-y-2 overflow-y-auto p-3.5">
      {envVars.length === 0 ? (
        <p className="mt-10 text-center text-[10px] text-muted-foreground">
          no public env vars
        </p>
      ) : (
        envVars.map(({ key, value }) => (
          <div
            key={key}
            className="rounded-md border bg-neutral-900/60 px-3 py-2"
          >
            <p className="mb-1 text-[9px] tracking-widest text-sky-400">
              {key}
            </p>
            <p className="text-[10px] break-all text-muted-foreground">
              {value || <span>empty</span>}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
