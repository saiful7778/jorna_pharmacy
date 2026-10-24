import { Controller } from "react-hook-form";
import type { Control, FieldValues, Path } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";

interface RememberMeProps<
  TFieldValues extends FieldValues,
> extends React.ComponentProps<"input"> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
}

export function RememberMe<TFieldValues extends FieldValues>({
  control,
  name,
  disabled,
}: RememberMeProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Field orientation="horizontal" aria-disabled={disabled}>
          <Checkbox
            id="remember-me"
            className="size-4 rounded"
            name={field.name}
            checked={field.value}
            onCheckedChange={field.onChange}
            disabled={disabled}
          />
          <FieldLabel
            htmlFor="remember-me"
            className="font-normal"
            aria-disabled={disabled}
          >
            Remember Me
          </FieldLabel>
        </Field>
      )}
    />
  );
}
