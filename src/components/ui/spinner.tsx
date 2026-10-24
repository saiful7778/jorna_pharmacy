import { cn } from "cn";
import { Loader2Icon } from "lucide-react";

function Spinner({
  className,
  size = 16,
  ...props
}: React.ComponentProps<"svg"> & { size?: number }) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn("animate-spin", className)}
      size={size}
      {...props}
    />
  );
}

export { Spinner };
