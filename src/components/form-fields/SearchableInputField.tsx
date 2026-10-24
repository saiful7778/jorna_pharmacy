import { useId } from "react";

import { Asterisk, Info } from "lucide-react";
import {
  type Control,
  Controller,
  type FieldValues,
  type Path,
} from "react-hook-form";

import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";
import {
  SearchableInput,
  type SearchableInputProps,
} from "../ui/searchable-input";

interface SearchableInputFieldProps<
  TFieldValues extends FieldValues,
  TOption,
> extends Omit<
  SearchableInputProps<TOption>,
  "id" | "name" | "value" | "onChange" | "onBlur" | "inputRef" | "aria-invalid"
> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  label?: string;
  description?: string;
  isDescriptionInfoIconShow?: boolean;
  requiredField?: boolean;
}

function SearchableInputField<TFieldValues extends FieldValues, TOption>({
  name,
  control,
  label,
  description,
  isDescriptionInfoIconShow = false,
  requiredField = false,
  disabled = false,
  ...props
}: SearchableInputFieldProps<TFieldValues, TOption>) {
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
          <SearchableInput
            id={fieldId}
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            inputRef={field.ref}
            disabled={disabled}
            aria-invalid={fieldState.invalid}
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

export { SearchableInputField };
