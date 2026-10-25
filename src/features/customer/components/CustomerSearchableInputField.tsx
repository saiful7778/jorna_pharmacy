import { useId } from "react";

import { Asterisk, Info } from "lucide-react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

import {
  CustomerSearchableInput,
  type CustomerSearchableInputProps,
} from "./CustomerSearchableInput";

interface CustomerSearchableInputFieldProps<
  TFieldValues extends FieldValues,
  TTransformedValues = TFieldValues,
> extends Omit<CustomerSearchableInputProps, "onChange" | "value"> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues, any, TTransformedValues>;
  label?: string;
  placeholder?: string;
  description?: string;
  isDescriptionInfoIconShow?: boolean;
  requiredField?: boolean;
  disabled?: boolean;
}

export function CustomerSearchableInputField<
  TFieldValues extends FieldValues,
  TTransformedValues = TFieldValues,
>({
  name,
  control,
  label,
  placeholder = "Search customer",
  description,
  isDescriptionInfoIconShow = false,
  requiredField = false,
  disabled = false,
  ...props
}: CustomerSearchableInputFieldProps<TFieldValues, TTransformedValues>) {
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
          <CustomerSearchableInput
            {...props}
            id={fieldId}
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            inputRef={field.ref}
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={fieldState.invalid}
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
