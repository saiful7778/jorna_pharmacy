import { useCallback, useId, useMemo } from "react";

import { Asterisk } from "lucide-react";
import type {
  Control,
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  Path,
} from "react-hook-form";
import { Controller } from "react-hook-form";
import type { Country } from "react-phone-number-input";

import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";
import { PhoneInput } from "../ui/phone-input";

interface PhoneInputFieldProps<
  TFieldValues extends FieldValues,
> extends React.ComponentProps<"input"> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  label?: string;
  description?: string;
  requiredField?: boolean;
  defaultCountry?: Country;
  onValueChange?: (value: string) => void;
  valueModifier?: (value: string) => string;
}

function PhoneInputField<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  description,
  requiredField = false,
  disabled = false,
  onValueChange,
  valueModifier,
  ...props
}: PhoneInputFieldProps<TFieldValues>) {
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
          <PhoneInputFieldRender
            field={field}
            fieldState={fieldState}
            onValueChange={onValueChange}
            valueModifier={valueModifier}
            id={fieldId}
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

interface PhoneInputFieldRenderProps<
  TFieldValues extends FieldValues,
> extends React.ComponentProps<"input"> {
  field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>;
  fieldState: ControllerFieldState;
  id: string;
  onValueChange?: (value: string) => void;
  valueModifier?: (value: string) => string;
}

function PhoneInputFieldRender<TFieldValues extends FieldValues>({
  field,
  fieldState,
  id,
  onValueChange,
  valueModifier,
  disabled = false,
  ...props
}: PhoneInputFieldRenderProps<TFieldValues>) {
  const filedValue = useMemo(
    () => (valueModifier ? valueModifier(field.value) : field.value),
    [field, valueModifier]
  );

  const handleChange = useCallback(
    (value: string) => {
      field.onChange(value);
      onValueChange?.(value);
    },
    [field, onValueChange]
  );

  return (
    <PhoneInput
      {...props}
      {...field}
      value={filedValue}
      onChange={handleChange}
      id={id}
      aria-invalid={fieldState.invalid}
      disabled={disabled}
    />
  );
}

export { PhoneInputField };
