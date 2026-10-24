/** @jsxRuntime automatic */
import { Button } from "react-email";

export function EmailButton({
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      className="inline-flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-primary px-2.5 text-sm text-primary-foreground"
      {...props}
    >
      {children}
    </Button>
  );
}
