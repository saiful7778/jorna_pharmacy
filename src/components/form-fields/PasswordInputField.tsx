import { useCallback, useId, useMemo } from "react";

import { Asterisk } from "lucide-react";
import {
  type Control,
  Controller,
  type ControllerFieldState,
  type ControllerRenderProps,
  type FieldValues,
  type Path,
} from "react-hook-form";

import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";
import { PasswordInput } from "../ui/password-input";

interface PasswordInputFieldProps<
  TFieldValues extends FieldValues,
> extends React.ComponentProps<"input"> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  label?: string;
  description?: string;
  requiredField?: boolean;
  onValueChange?: (value: string) => void;
  valueModifier?: (value: string) => string;
}

function PasswordInputField<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  description,
  requiredField = false,
  disabled = false,
  onValueChange,
  valueModifier,
  ...props
}: PasswordInputFieldProps<TFieldValues>) {
  const fieldId = useId();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          {label && (
            <FieldLabel htmlFor={fieldId} aria-disabled={disabled}>
              {label}
              {requiredField && (
                <Asterisk className="-mt-2 size-3 text-destructive" />
              )}
            </FieldLabel>
          )}
          <PasswordInputFieldRender
            field={field}
            fieldState={fieldState}
            id={fieldId}
            onValueChange={onValueChange}
            valueModifier={valueModifier}
            disabled={disabled}
            {...props}
          />
          {description && (
            <FieldDescription
              className="flex items-start gap-1.5"
              aria-disabled={disabled}
            >
              {description}
            </FieldDescription>
          )}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

interface PasswordInputFieldRenderProps<
  TFieldValues extends FieldValues,
> extends React.ComponentProps<"input"> {
  field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>;
  fieldState: ControllerFieldState;
  id: string;
  onValueChange?: (value: string) => void;
  valueModifier?: (value: string) => string;
}

function PasswordInputFieldRender<TFieldValues extends FieldValues>({
  field,
  fieldState,
  id,
  onValueChange,
  valueModifier,
  disabled = false,
  ...props
}: PasswordInputFieldRenderProps<TFieldValues>) {
  const filedValue = useMemo(
    () => (valueModifier ? valueModifier(field.value) : field.value),
    [field, valueModifier]
  );

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const value = event.target.value;

      field.onChange(value);
      onValueChange?.(value);
    },
    [field, onValueChange]
  );

  return (
    <PasswordInput
      {...field}
      value={filedValue}
      onChange={handleChange}
      {...props}
      id={id}
      aria-invalid={fieldState.invalid}
      disabled={disabled}
    />
  );
}

export { PasswordInputField };
