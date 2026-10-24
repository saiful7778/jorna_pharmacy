import { Link, type LinkProps } from "@tanstack/react-router";

import { Button, type ButtonProps } from "./ui/button";

interface LinkButtonProps extends LinkProps {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
}

export function LinkButton({
  variant = "ghost",
  size = "default",
  ...props
}: LinkButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      nativeButton={false}
      render={<Link {...props} />}
    />
  );
}
