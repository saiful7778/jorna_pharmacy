import { useCallback, useId } from "react";

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
import { Textarea } from "../ui/textarea";

interface TextareaFieldProps<
  TFieldValues extends FieldValues,
> extends React.ComponentProps<"textarea"> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  label?: string;
  description?: string;
  isDescriptionInfoIconShow?: boolean;
  requiredField?: boolean;
  onValueChange?: (value: string) => void;
}

function TextareaField<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  description,
  isDescriptionInfoIconShow = false,
  requiredField = false,
  disabled,
  onValueChange,
  ...props
}: TextareaFieldProps<TFieldValues>) {
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
          <TextareaFieldRender
            field={field}
            fieldState={fieldState}
            id={fieldId}
            onValueChange={onValueChange}
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

interface TextareaFieldRenderProps<
  TFieldValues extends FieldValues,
> extends React.ComponentProps<"textarea"> {
  field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>;
  fieldState: ControllerFieldState;
  id: string;
  onValueChange?: (value: string) => void;
}

function TextareaFieldRender<TFieldValues extends FieldValues>({
  field,
  fieldState,
  id,
  onValueChange,
  disabled = false,
  ...props
}: TextareaFieldRenderProps<TFieldValues>) {
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const value = event.target.value;

      field.onChange(value);
      onValueChange?.(value);
    },
    [field, onValueChange]
  );

  return (
    <Textarea
      {...field}
      onChange={handleChange}
      {...props}
      id={id}
      aria-invalid={fieldState.invalid}
      disabled={disabled}
    />
  );
}

export { TextareaField };
