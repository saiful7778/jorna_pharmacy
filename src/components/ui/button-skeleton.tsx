import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

import { Skeleton } from "./skeleton";

const buttonVariants = cva("inline-block", {
  variants: {
    size: {
      default: "h-7 min-w-21.5",
      xs: "h-5 min-w-21.5",
      sm: "h-6 min-w-21.5",
      lg: "h-8 min-w-21.5",
      icon: "size-7",
      "icon-xs": "size-5",
      "icon-sm": "size-6",
      "icon-lg": "size-8",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

function ButtonSkeleton({
  className,
  size,
  ...props
}: React.ComponentProps<typeof Skeleton> &
  VariantProps<typeof buttonVariants>) {
  return (
    <Skeleton
      data-slot="button"
      className={cn(buttonVariants({ size, className }))}
      {...props}
    />
  );
}

export { ButtonSkeleton };
