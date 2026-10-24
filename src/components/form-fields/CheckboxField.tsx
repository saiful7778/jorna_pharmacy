import { useCallback, useId } from "react";

import { Asterisk, Info } from "lucide-react";
import type {
  Control,
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  Path,
} from "react-hook-form";
import { Controller } from "react-hook-form";

import { Checkbox } from "../ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "../ui/field";

interface CheckboxFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  label: string;
  description?: string;
  isDescriptionInfoIconShow?: boolean;
  requiredField?: boolean;
  disabled?: boolean;
  onValueChange?: (value: boolean) => void;
}

export function CheckboxField<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  description,
  isDescriptionInfoIconShow = false,
  requiredField = false,
  disabled,
  onValueChange,
}: CheckboxFieldProps<TFieldValues>) {
  const fieldId = useId();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} orientation="horizontal">
          <CheckboxFieldRender
            id={fieldId}
            field={field}
            fieldState={fieldState}
            onValueChange={onValueChange}
            disabled={disabled}
          />
          <FieldContent>
            <FieldLabel htmlFor={fieldId} aria-disabled={disabled}>
              {label}
              {requiredField && (
                <Asterisk className="-mt-2 size-3 text-destructive" />
              )}
            </FieldLabel>
            {description && (
              <FieldDescription
                className="flex items-start gap-1.5"
                aria-disabled={disabled}
              >
                {isDescriptionInfoIconShow && (
                  <Info className="mt-0.5 size-4" />
                )}
                {description}
              </FieldDescription>
            )}
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </FieldContent>
        </Field>
      )}
    />
  );
}

interface CheckboxFieldRenderProps<TFieldValues extends FieldValues> {
  field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>;
  fieldState: ControllerFieldState;
  id: string;
  onValueChange?: (value: boolean) => void;
  disabled?: boolean;
}

function CheckboxFieldRender<TFieldValues extends FieldValues>({
  field,
  fieldState,
  id,
  onValueChange,
  disabled,
}: CheckboxFieldRenderProps<TFieldValues>) {
  const handleCheckedChange = useCallback(
    (checked: boolean | "indeterminate") => {
      field.onChange(checked);
      onValueChange?.(checked === true);
    },
    [field, onValueChange]
  );

  return (
    <Checkbox
      id={id}
      checked={field.value}
      onCheckedChange={handleCheckedChange}
      aria-invalid={fieldState.invalid}
      disabled={disabled}
    />
  );
}
