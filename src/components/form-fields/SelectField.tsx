import { useCallback, useId } from "react";

import { cn } from "cn";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface SelectFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  className?: string;
  label?: string;
  description?: string;
  requiredField?: boolean;
  placeholder?: string;
  options: { value: string; label: string }[];
  disabled?: boolean;
  isDescriptionInfoIconShow?: boolean;
  onValueChange?: (value: string) => void;
}

function SelectField<TFieldValues extends FieldValues>({
  control,
  name,
  className,
  options,
  label,
  placeholder,
  description,
  requiredField = false,
  isDescriptionInfoIconShow = false,
  disabled,
  onValueChange,
}: SelectFieldProps<TFieldValues>) {
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
          <SelectFieldRender
            field={field}
            fieldState={fieldState}
            onValueChange={onValueChange}
            id={fieldId}
            className={className}
            options={options}
            placeholder={placeholder}
            disabled={disabled}
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

interface SelectFieldRenderProps<TFieldValues extends FieldValues> {
  field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>;
  fieldState: ControllerFieldState;
  id: string;
  className?: string;
  placeholder?: string;
  options: { value: string; label: string }[];
  disabled?: boolean;
  onValueChange?: (value: string) => void;
}

function SelectFieldRender<TFieldValues extends FieldValues>({
  field,
  fieldState,
  id,
  className,
  options,
  placeholder,
  disabled,
  onValueChange,
}: SelectFieldRenderProps<TFieldValues>) {
  const handleValueChange = useCallback(
    (value: never[] | null) => {
      field.onChange(value);
      onValueChange?.(value as unknown as string);
    },
    [field, onValueChange]
  );

  return (
    <Select
      name={field.name}
      value={field.value}
      onValueChange={handleValueChange}
      items={options}
    >
      <SelectTrigger
        id={id}
        aria-invalid={fieldState.invalid}
        className={cn("w-full", className)}
        disabled={disabled}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map(({ value, label }) => (
          <SelectItem key={`${id}.${value}`} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export { SelectField };
