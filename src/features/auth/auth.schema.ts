import z from "zod";

import { env } from "@/lib/env";
import { emailField, passwordField } from "@/lib/zod-schemas/baseZodSchema";

const restrict = env.VITE_ENVIRONMENT === "production";

export const signUpSchema = z
  .object({
    name: z
      .string({ error: "Full name is required" })
      .min(1, "Full name is required")
      .max(80, "Full name is too long"),
    email: emailField({ fieldName: "email" }),
    password: passwordField({ fieldName: "password", restrict }),
    confirmPassword: passwordField({ fieldName: "confirm password", restrict }),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: "Password and confirmPassword not matched",
  });
export type SignUpType = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: emailField({ fieldName: "email" }),
  password: passwordField({ fieldName: "password", restrict }),
  rememberMe: z.boolean().optional(),
});
export type SignInType = z.infer<typeof signInSchema>;

export const magicLinkSchema = z.object({
  email: emailField({ fieldName: "email" }),
});
export type MagicLinkType = z.infer<typeof magicLinkSchema>;

export const forgetPasswordSchema = z.object({
  email: emailField({ fieldName: "email" }),
});
export type ForgetPasswordType = z.infer<typeof forgetPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: passwordField({ fieldName: "password", restrict }),
    confirmPassword: passwordField({ fieldName: "confirm password", restrict }),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: "Password and confirmPassword not matched",
  });
export type ResetPasswordType = z.infer<typeof resetPasswordSchema>;

export const updatePasswordSchema = z
  .object({
    currentPassword: passwordField({
      fieldName: "Current Password",
      restrict,
    }),
    newPassword: passwordField({ fieldName: "New Password", restrict }),
    confirmPassword: passwordField({ fieldName: "confirm password", restrict }),
    revokeOtherSessions: z.boolean().optional(),
  })
  .refine(
    ({ newPassword, confirmPassword }) => newPassword === confirmPassword,
    {
      message: "Password and confirmPassword not matched",
    }
  );
export type UpdatePasswordType = z.infer<typeof updatePasswordSchema>;

export const userBannedSchema = z.object({
  userId: z.uuid(),
  banned: z.boolean().optional(),
  banReason: z.string().optional(),
  banExpires: z.date().optional(),
});
export type UserBannedType = z.infer<typeof userBannedSchema>;
