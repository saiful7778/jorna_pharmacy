import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { createClientOnlyFn } from "@tanstack/react-start";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { InputField } from "@/components/form-fields/InputField";
import { Button } from "@/components/ui/button";
import { ButtonSpinner } from "@/components/ui/button-spinner";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { authClient } from "@/features/auth/auth.client";

import { signInSchema } from "../../auth.schema";
import type { SignInType } from "../../auth.schema";
import { RememberMe } from "../RememberMe";

export function SignInForm({
  redirect,
  invitationId,
}: {
  redirect: string;
  invitationId?: string | undefined;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const redirectURL = invitationId
    ? `/accept-invitation?invitationId=${invitationId}`
    : redirect;

  const form = useForm<SignInType>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const handleSubmit = createClientOnlyFn(async (e: SignInType) => {
    const toastId = "login_toast_message";

    await authClient.signIn.email(
      {
        email: e.email,
        password: e.password,
        callbackURL: redirectURL,
        rememberMe: e.rememberMe,
      },
      {
        onRequest: () => {
          toast.loading("Logging...", { id: toastId });
          setIsLoading(true);
        },
        onSuccess: async () => {
          toast.success("Login Successfully", { id: toastId });
          setIsLoading(false);
          form.reset();
        },
        onError: ({ error }) => {
          if (error.code === "EMAIL_NOT_VERIFIED") {
            toast(
              () => (
                <div className="flex items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="font-semibold">
                      Your email is not verified
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Click this button to resend email verification mail
                    </div>
                  </div>
                  <Button
                    onClick={async () => {
                      toast.dismiss(toastId);

                      await authClient.sendVerificationEmail({
                        email: e.email,
                        callbackURL: redirect,
                        fetchOptions: {
                          onRequest: () => {
                            toast.loading("Resending email...", {
                              id: toastId,
                            });
                            setIsLoading(true);
                          },
                          onSuccess: () => {
                            toast.success("Email is sent", { id: toastId });
                            setIsLoading(false);
                            form.reset();
                          },
                          onError: ({ error: verificationEmailError }) => {
                            toast.error(verificationEmailError.message, {
                              id: toastId,
                            });
                            setIsLoading(false);
                            form.reset();
                          },
                        },
                      });
                    }}
                    size="sm"
                    variant="secondary"
                  >
                    Resend
                  </Button>
                </div>
              ),
              {
                id: toastId,
                duration: 5000,
              }
            );
          } else {
            toast.error(error.message, {
              id: toastId,
            });
          }
          setIsLoading(false);
          form.reset();
        },
      }
    );
  });

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldGroup>
        <InputField
          control={form.control}
          name="email"
          label="Email"
          type="email"
          placeholder="Email Address"
          disabled={isLoading}
          requiredField
        />
        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex items-center gap-2">
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <span className="text-destructive">*</span>
                <Link to="/forgot-password" className="link ml-auto text-sm">
                  Forget password?
                </Link>
              </div>
              <PasswordInput
                {...field}
                id="password"
                placeholder="Password"
                disabled={isLoading}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <RememberMe
          control={form.control}
          name="rememberMe"
          disabled={isLoading}
        />
        <ButtonSpinner
          size="lg"
          type="submit"
          className="w-full"
          isLoading={isLoading}
        >
          Login
        </ButtonSpinner>
      </FieldGroup>
    </form>
  );
}
