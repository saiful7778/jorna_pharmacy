import { useState } from "react";

import { createClientOnlyFn } from "@tanstack/react-start";
import toast from "react-hot-toast";

import type { ButtonProps } from "@/components/ui/button";
import { ButtonSpinner } from "@/components/ui/button-spinner";
import { RESET_PASSWORD_PATH } from "@/constants";
import { useAuthStore } from "@/zustand/auth/AuthStoreContext";

import { authClient } from "../auth.client";

export default function SetPasswordButton({
  variant = "outline",
  ...props
}: ButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const user = useAuthStore((state) => state.user);

  const handleClick = createClientOnlyFn(() => {
    const toastId = "revoke_other_sessions_toast_message";

    return authClient.requestPasswordReset({
      email: user.email,
      redirectTo: RESET_PASSWORD_PATH,
      fetchOptions: {
        onRequest: () => {
          setIsLoading(true);
          toast.loading("Loading...", { id: toastId });
        },
        onSuccess: () => {
          setIsLoading(false);
          toast.success("Password reset email sent", { id: toastId });
        },
        onError: ({ error }) => {
          setIsLoading(false);
          toast.error(error.message, {
            id: toastId,
          });
        },
      },
    });
  });

  return (
    <ButtonSpinner
      isLoading={isLoading}
      variant={variant}
      onClick={handleClick}
      {...props}
    >
      Send Password Reset Email
    </ButtonSpinner>
  );
}
