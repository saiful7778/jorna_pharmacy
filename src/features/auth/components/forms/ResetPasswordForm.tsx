import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@tanstack/react-router";
import { createClientOnlyFn } from "@tanstack/react-start";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { PasswordInputField } from "@/components/form-fields/PasswordInputField";
import { ButtonSpinner } from "@/components/ui/button-spinner";
import { FieldGroup } from "@/components/ui/field";
import { DEFAULT_UNAUTH_PATH } from "@/constants";
import { authClient } from "@/features/auth/auth.client";

import { resetPasswordSchema } from "../../auth.schema";
import type { ResetPasswordType } from "../../auth.schema";

export function ResetPasswordForm({ token }: { token: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<ResetPasswordType>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = createClientOnlyFn(async (e: ResetPasswordType) => {
    const toastId = "reset_password_toast_message";

    await authClient.resetPassword({
      newPassword: e.password,
      token,
      fetchOptions: {
        onRequest: () => {
          setIsLoading(true);
        },
        onSuccess: () => {
          toast.success("Password is changed", { id: toastId });
          setIsLoading(false);
          form.reset();
          router.navigate({
            to: DEFAULT_UNAUTH_PATH,
            replace: true,
          });
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
          Submit
        </ButtonSpinner>
      </FieldGroup>
    </form>
  );
}
