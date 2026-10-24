import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { createClientOnlyFn } from "@tanstack/react-start";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { InputField } from "@/components/form-fields/InputField";
import { ButtonSpinner } from "@/components/ui/button-spinner";
import { FieldGroup } from "@/components/ui/field";
import { RESET_PASSWORD_PATH } from "@/constants";
import { authClient } from "@/features/auth/auth.client";

import { forgetPasswordSchema } from "../../auth.schema";
import type { ForgetPasswordType } from "../../auth.schema";

export function ForgetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ForgetPasswordType>({
    resolver: zodResolver(forgetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = createClientOnlyFn(async (e: ForgetPasswordType) => {
    const toastId = "reset_password_toast_message";

    await authClient.requestPasswordReset({
      email: e.email,
      redirectTo: RESET_PASSWORD_PATH,
      fetchOptions: {
        onRequest: () => {
          setIsLoading(true);
        },
        onSuccess: () => {
          toast.success("Reset password email is sent", { id: toastId });
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
          name="email"
          type="email"
          placeholder="Email Address"
          label="Email"
          disabled={isLoading}
        />
        <ButtonSpinner
          size="lg"
          type="submit"
          className="w-full"
          isLoading={isLoading}
        >
          Forget Password
        </ButtonSpinner>
      </FieldGroup>
    </form>
  );
}
