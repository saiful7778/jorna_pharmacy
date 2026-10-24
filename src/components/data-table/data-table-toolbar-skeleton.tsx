import { cn } from "cn";

import { ButtonSkeleton } from "../ui/button-skeleton";

export function DataTableToolbarSkeleton({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      role="toolbar"
      aria-orientation="horizontal"
      className={cn("flex w-full items-start justify-between gap-2", className)}
      {...props}
    >
      <ButtonSkeleton />
      <div className="flex items-center gap-2">
        {children}
        <ButtonSkeleton />
      </div>
    </div>
  );
}
