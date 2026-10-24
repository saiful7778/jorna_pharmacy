import { useCallback, useId, useMemo } from "react";

import { Asterisk, Info } from "lucide-react";
import {
  type Control,
  Controller,
  type ControllerFieldState,
  type ControllerRenderProps,
  type FieldValues,
  type Path,
} from "react-hook-form";

import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";

interface InputFieldProps<
  TFieldValues extends FieldValues,
> extends React.ComponentProps<"input"> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  onValueChange?: (value: string) => void;
  valueModifier?: (value: string) => string;
  label?: string;
  description?: string;
  isDescriptionInfoIconShow?: boolean;
  requiredField?: boolean;
}

function InputField<TFieldValues extends FieldValues>({
  name,
  control,
  onValueChange,
  valueModifier,
  label,
  description,
  isDescriptionInfoIconShow = false,
  requiredField = false,
  disabled = false,
  ...props
}: InputFieldProps<TFieldValues>) {
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
          <InputFieldRender
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
              {isDescriptionInfoIconShow && <Info className="mt-0.5 size-4" />}
              {description}
            </FieldDescription>
          )}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

interface InputFieldRenderProps<
  TFieldValues extends FieldValues,
> extends React.ComponentProps<"input"> {
  field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>;
  fieldState: ControllerFieldState;
  id: string;
  onValueChange?: (value: string) => void;
  valueModifier?: (value: string) => string;
}

function InputFieldRender<TFieldValues extends FieldValues>({
  field,
  fieldState,
  id,
  onValueChange,
  valueModifier,
  disabled = false,
  ...props
}: InputFieldRenderProps<TFieldValues>) {
  const filedValue = useMemo(
    () => (valueModifier ? valueModifier(field.value) : field.value),
    [field, valueModifier]
  );

  const handleOnChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const value = event.target.value;

      field.onChange(value);
      onValueChange?.(value);
    },
    [field, onValueChange]
  );

  return (
    <Input
      {...field}
      value={filedValue}
      onChange={handleOnChange}
      {...props}
      id={id}
      aria-invalid={fieldState.invalid}
      disabled={disabled}
    />
  );
}

export { InputField };
