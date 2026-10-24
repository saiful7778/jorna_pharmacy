import { cn } from "cn";

import { Skeleton } from "@/components/ui/skeleton";

export function DashboardShellTitleSkeleton({
  className,
  ...props
}: React.ComponentProps<typeof Skeleton>) {
  return (
    <Skeleton className={cn("h-8 w-56 max-w-full", className)} {...props} />
  );
}

export function DashboardShellDescriptionSkeleton({
  className,
  ...props
}: React.ComponentProps<typeof Skeleton>) {
  return (
    <Skeleton className={cn("h-4 w-72 max-w-full", className)} {...props} />
  );
}
