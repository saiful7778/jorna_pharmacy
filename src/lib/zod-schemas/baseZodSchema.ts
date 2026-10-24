import z from "zod";

export function stringToArray(
  inputString: string,
  splitString: "," | ":" = ","
): string[] {
  return inputString
    .split(splitString)
    .map((s) => s.trim())
    .filter(Boolean);
}

export const stringArraySchema = z
  .string()
  .transform<string[]>((val) => stringToArray(val, ","));

export const emailField = ({ fieldName }: { fieldName: string }) =>
  z.email({ error: `${fieldName} is required` });

export const passwordField = ({
  fieldName,
  restrict = true,
}: {
  fieldName: string;
  restrict: boolean;
}) =>
  restrict
    ? z
        .string({ error: `${fieldName} is required` })
        .min(6, `${fieldName} must be at least 6 characters long`)
        .max(20, `${fieldName} must not exceed 20 characters`)
        .regex(
          /[A-Z]/,
          `${fieldName} must contain at least one uppercase letter`
        )
        .regex(
          /[a-z]/,
          `${fieldName} must contain at least one lowercase letter`
        )
        .regex(/\d/, `${fieldName} must contain at least one number`)
    : z
        .string({ error: `${fieldName} is required` })
        .min(6, `${fieldName} must be at least 6 characters long`)
        .max(20, `${fieldName} must not exceed 20 characters`);

export const RangeSearchEnumSchema = z.enum([
  "THIS_WEEK",
  "THIS_MONTH",
  "LAST_WEEK",
  "LAST_MONTH",
  "CUSTOM_WEEK",
  "CUSTOM_MONTH",
]);
export type RangeSearchEnum = z.infer<typeof RangeSearchEnumSchema>;

export const emptyStrSchema = z
  .string()
  .transform((val) => (val === "" ? undefined : val));
