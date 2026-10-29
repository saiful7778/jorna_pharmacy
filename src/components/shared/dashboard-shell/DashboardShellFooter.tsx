import { cn } from "cn";

import { DeveloperCredit } from "@/components/shared/DeveloperCredit";
import { APP_NAME } from "@/constants";

export function DashboardShellFooter({
  className,
  ...props
}: React.ComponentProps<"footer">) {
  return (
    <footer
      data-slot="dashboard-shell-footer"
      className={cn(
        "border-t px-4 py-3 text-xs text-muted-foreground sm:px-6 md:flex md:items-center md:justify-between",
        className
      )}
      {...props}
    >
      <span>© {APP_NAME}. All rights reserved.</span>
      <DeveloperCredit className="mt-1 md:mt-0" />
    </footer>
  );
}
