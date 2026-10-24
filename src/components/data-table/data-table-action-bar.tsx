import { useCallback, useEffect } from "react";

import type { Table } from "@tanstack/react-table";
import { cn } from "cn";
import { Loader, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { Button } from "../ui/button";
import { Portal } from "../ui/portal";
import { Separator } from "../ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface DataTableActionBarProps<TData> extends React.ComponentProps<
  typeof motion.div
> {
  table: Table<TData>;
  visible?: boolean;
  portalContainer?: Element | DocumentFragment | null;
}

function DataTableActionBar<TData>({
  table,
  visible: visibleProp,
  portalContainer: portalContainerProp,
  children,
  className,
  ...props
}: DataTableActionBarProps<TData>) {
  "use no memo";

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        table.toggleAllRowsSelected(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [table]);

  const portalContainer = portalContainerProp ?? globalThis.document.body;

  const visible =
    visibleProp ?? table.getFilteredSelectedRowModel().rows.length > 0;

  return (
    <Portal container={portalContainer} className="pointer-events-none">
      <AnimatePresence>
        {visible && (
          <motion.div
            role="toolbar"
            aria-orientation="horizontal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className={cn(
              "pointer-events-auto fixed inset-x-0 bottom-6 z-50 mx-auto flex w-fit flex-wrap items-center justify-center gap-2 rounded-md border bg-background p-2 text-foreground shadow-sm",
              className
            )}
            {...props}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </Portal>
  );
}

interface DataTableActionBarActionProps extends React.ComponentProps<
  typeof Button
> {
  tooltip?: string;
  isPending?: boolean;
}

function DataTableActionBarAction({
  size = "default",
  tooltip,
  isPending,
  disabled,
  className,
  children,
  ...props
}: DataTableActionBarActionProps) {
  "use no memo";
  const trigger = (
    <Button
      variant="secondary"
      size={size}
      className={cn(
        "gap-1.5 border border-secondary bg-secondary/50 hover:bg-secondary/70",
        className
      )}
      disabled={disabled || isPending}
      {...props}
    >
      {isPending ? <Loader className="animate-spin" /> : children}
    </Button>
  );

  if (!tooltip) return trigger;

  return (
    <Tooltip>
      <TooltipTrigger render={trigger} />
      <TooltipContent
        sideOffset={6}
        className="border bg-accent font-semibold text-foreground dark:bg-zinc-900 [&>span]:hidden"
      >
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}

interface DataTableActionBarSelectionProps<TData> {
  table: Table<TData>;
}

function DataTableActionBarSelection<TData>({
  table,
}: DataTableActionBarSelectionProps<TData>) {
  "use no memo";
  const onClearSelection = useCallback(() => {
    table.toggleAllRowsSelected(false);
  }, [table]);

  return (
    <div className="flex h-7 items-center justify-center rounded-md border pr-1 pl-2.5">
      <span className="text-xs whitespace-nowrap">
        {table.getFilteredSelectedRowModel().rows.length} selected
      </span>
      <Separator orientation="vertical" className="mr-1 ml-2" />
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="size-5"
              onClick={onClearSelection}
            />
          }
        >
          <X />
        </TooltipTrigger>
        <TooltipContent
          sideOffset={10}
          className="flex items-center gap-2 px-2 py-1 font-semibold"
        >
          <p>Clear selection</p>
          <kbd className="rounded border-input bg-muted px-1.5 py-px font-mono text-xs font-normal text-muted-foreground shadow-xs select-none">
            <abbr title="Escape" className="no-underline">
              Esc
            </abbr>
          </kbd>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

export {
  DataTableActionBar,
  DataTableActionBarAction,
  DataTableActionBarSelection,
};
