import { Link, type LinkProps } from "@tanstack/react-router";
import { cn } from "cn";

import { Button, type ButtonProps } from "./ui/button";

interface LinkButtonProps extends LinkProps {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
}

export function LinkButton({
  variant = "ghost",
  size = "default",
  className,
  ...props
}: LinkButtonProps) {
  return (
    <Button
      className={cn("w-fit", className)}
      variant={variant}
      size={size}
      nativeButton={false}
      render={<Link {...props} />}
    />
  );
}
