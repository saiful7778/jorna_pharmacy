import { useCallback, useId, useMemo } from "react";

import { Asterisk, Info } from "lucide-react";
import type {
  Control,
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  Path,
} from "react-hook-form";
import { Controller } from "react-hook-form";

import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";

interface InputAddonFieldProps<
  TFieldValues extends FieldValues,
> extends React.ComponentProps<"input"> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  label?: string;
  description?: string;
  isDescriptionInfoIconShow?: boolean;
  requiredField?: boolean;
  firstAddon?: React.ReactNode;
  secondAddon?: React.ReactNode;
  onValueChange?: (value: string) => void;
  valueModifier?: (value: string) => string;
}

function InputAddonField<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  description,
  isDescriptionInfoIconShow = false,
  requiredField = false,
  disabled = false,
  firstAddon,
  secondAddon,
  onValueChange,
  valueModifier,
  ...props
}: InputAddonFieldProps<TFieldValues>) {
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
          <InputAddonFieldRender
            field={field}
            fieldState={fieldState}
            id={fieldId}
            onValueChange={onValueChange}
            valueModifier={valueModifier}
            disabled={disabled}
            firstAddon={firstAddon}
            secondAddon={secondAddon}
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

interface InputAddonFieldRenderProps<
  TFieldValues extends FieldValues,
> extends React.ComponentProps<"input"> {
  field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>;
  fieldState: ControllerFieldState;
  id: string;
  onValueChange?: (value: string) => void;
  valueModifier?: (value: string) => string;
  firstAddon?: React.ReactNode;
  secondAddon?: React.ReactNode;
}

function InputAddonFieldRender<TFieldValues extends FieldValues>({
  field,
  fieldState,
  id,
  onValueChange,
  valueModifier,
  disabled = false,
  firstAddon,
  secondAddon,
  ...props
}: InputAddonFieldRenderProps<TFieldValues>) {
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
    <InputGroup>
      <InputGroupInput
        {...field}
        value={filedValue}
        onChange={handleChange}
        {...props}
        id={id}
        aria-invalid={fieldState.invalid}
        disabled={disabled}
      />
      {firstAddon && (
        <InputGroupAddon align="inline-start">{firstAddon}</InputGroupAddon>
      )}
      {secondAddon && (
        <InputGroupAddon align="inline-end">{secondAddon}</InputGroupAddon>
      )}
    </InputGroup>
  );
}

export { InputAddonField };
