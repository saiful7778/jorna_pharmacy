import { cn } from "cn";

export function DashboardShellHeader({
  className,
  ...props
}: React.ComponentProps<"h1">) {
  return (
    <div className={cn("space-y-1 leading-normal", className)} {...props} />
  );
}

export function DashboardShellTitle({
  className,
  ...props
}: React.ComponentProps<"h1">) {
  return (
    <h1 className={cn("text-lg font-bold md:text-3xl", className)} {...props} />
  );
}

export function DashboardShellDescription({
  className,
  ...props
}: React.ComponentProps<"h1">) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props} />
  );
}
