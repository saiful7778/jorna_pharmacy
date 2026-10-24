import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { createClientOnlyFn } from "@tanstack/react-start";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { InputField } from "@/components/form-fields/InputField";
import { PasswordInputField } from "@/components/form-fields/PasswordInputField";
import { ButtonSpinner } from "@/components/ui/button-spinner";
import { FieldGroup } from "@/components/ui/field";
import { authClient } from "@/features/auth/auth.client";

import { signUpSchema } from "../../auth.schema";
import type { SignUpType } from "../../auth.schema";

export function SignUpForm({
  redirect,
  invitationId,
  email,
}: {
  redirect: string;
  invitationId?: string | undefined;
  email?: string | undefined;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const redirectURL = invitationId
    ? `/accept-invitation?invitationId=${invitationId}`
    : redirect;

  const form = useForm<SignUpType>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: email ?? "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = createClientOnlyFn(async (e: SignUpType) => {
    const toastId = "register_toast_message";

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return authClient.signUp.email({
      email: e.email,
      name: e.name,
      password: e.password,
      callbackURL: redirectURL,
      timezone,
      fetchOptions: {
        onRequest: () => {
          toast.loading("Registering...", { id: toastId });
          setIsLoading(true);
        },
        onSuccess: () => {
          toast.success("Registration Successfully", { id: toastId });
          setIsLoading(false);
          form.reset();
        },
        onError: ({ error }) => {
          toast.error(error.message, {
            id: toastId,
          });
          setIsLoading(false);
          form.reset();
        },
      },
    });
  });

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldGroup>
        <InputField
          control={form.control}
          name="name"
          label="Full name"
          placeholder="Full name"
          disabled={isLoading}
          requiredField
        />
        {!email && (
          <InputField
            control={form.control}
            name="email"
            label="Email"
            placeholder="Email Password"
            disabled={isLoading}
            requiredField
          />
        )}
        <PasswordInputField
          control={form.control}
          name="password"
          label="Password"
          placeholder="Password"
          disabled={isLoading}
          requiredField
        />
        <PasswordInputField
          control={form.control}
          name="confirmPassword"
          label="Confirm Password"
          placeholder="Confirm Password"
          disabled={isLoading}
          requiredField
        />
        <ButtonSpinner
          size="lg"
          type="submit"
          className="w-full"
          isLoading={isLoading}
        >
          Register
        </ButtonSpinner>
      </FieldGroup>
    </form>
  );
}
