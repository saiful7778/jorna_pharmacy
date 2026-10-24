import { useState } from "react";

import { useNavigate } from "@tanstack/react-router";
import { createClientOnlyFn } from "@tanstack/react-start";
import toast from "react-hot-toast";

import { authClient } from "@/features/auth/auth.client";

import { ButtonSpinner } from "../ui/button-spinner";
import { useDevPanelContext } from "./DevPanelContext";

export function AuthPanel() {
  const toastId = "dev_login_toast_message";
  const [isLoading, setIsLoading] = useState(false);
  const { redirectUrl } = useDevPanelContext();
  const router = useNavigate();

  const handleLogout = createClientOnlyFn(
    async (isRedirect: boolean = false) => {
      await authClient.signOut({
        fetchOptions: {
          onRequest: () => {
            toast.loading("Logging out...", { id: toastId });
            setIsLoading(true);
          },
          onSuccess: () => {
            toast.success("Logged out successfully", {
              id: toastId,
            });
            setIsLoading(false);
            if (isRedirect) {
              router({
                to: redirectUrl,
                replace: true,
              });
            }
          },
          onError: () => {
            toast.error("Failed to log out. Please try again", {
              id: toastId,
            });
            setIsLoading(false);
          },
        },
      });
    }
  );

  const handleLogin = createClientOnlyFn(async (email: string) => {
    await handleLogout();
    await authClient.signIn.email(
      {
        email: email,
        password: "12345678",
        callbackURL: redirectUrl,
      },
      {
        onRequest: () => {
          toast.loading("Logging in...", { id: toastId });
          setIsLoading(true);
        },
        onSuccess: async () => {
          toast.success("Login Successfully", { id: toastId });
          setIsLoading(false);
        },
        onError: ({ error }) => {
          toast.error(error.message, {
            id: toastId,
          });
          setIsLoading(false);
        },
      }
    );
  });

  return (
    <div className="flex flex-col gap-2 p-2">
      <ButtonSpinner
        onClick={() => handleLogin("superadmin@mail.com")}
        isLoading={isLoading}
      >
        Super Admin Login
      </ButtonSpinner>
      <ButtonSpinner
        onClick={() => handleLogin("admin@mail.com")}
        isLoading={isLoading}
      >
        Admin Login
      </ButtonSpinner>
      <ButtonSpinner
        onClick={() => handleLogin("employee@mail.com")}
        isLoading={isLoading}
      >
        Employee Login
      </ButtonSpinner>
      <ButtonSpinner
        onClick={() => handleLogin("user@mail.com")}
        isLoading={isLoading}
      >
        User Login
      </ButtonSpinner>
      <ButtonSpinner
        onClick={() => handleLogout(true)}
        variant="destructive"
        isLoading={isLoading}
      >
        Logout
      </ButtonSpinner>
    </div>
  );
}
