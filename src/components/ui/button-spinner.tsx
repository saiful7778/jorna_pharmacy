import { Button, type ButtonProps } from "./button";
import { Spinner } from "./spinner";

interface ButtonSpinnerProps extends Omit<ButtonProps, "render"> {
  isLoading: boolean;
}

function ButtonSpinner({
  children,
  isLoading,
  size = "default",
  disabled,
  ...props
}: ButtonSpinnerProps) {
  const isDisabled = isLoading || disabled;

  return (
    <Button
      {...props}
      size={size}
      disabled={isDisabled}
      aria-disabled={isDisabled}
    >
      {isLoading && <Spinner />}
      {isLoading && size?.startsWith("icon") ? null : children}
    </Button>
  );
}

export { ButtonSpinner };
