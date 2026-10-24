import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "cn";

interface PortalProps extends React.ComponentProps<"div"> {
  container?: Element | DocumentFragment | null;
}

function Portal({
  className,
  container: containerProp,
  ...props
}: PortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setMounted(true);
    });

    const originalStyle = window.getComputedStyle(document.body).overflow;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const originalPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalStyle;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, []);

  const container =
    containerProp ?? (mounted ? globalThis.document.body : null);

  if (!container) return null;

  return createPortal(
    <div
      className={cn("fixed inset-0 isolate z-50 flex flex-col", className)}
      {...props}
    />,
    container
  );
}

function PortalBackdrop({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "fixed inset-0 -z-1 bg-background/95 backdrop-blur-sm duration-500 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 supports-backdrop-filter:bg-background/60",
        className
      )}
      {...props}
    />
  );
}

export { Portal, PortalBackdrop };
export type { PortalProps };
