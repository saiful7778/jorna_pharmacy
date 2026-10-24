import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { orpcTQClient } from "@/oRPC/orpc";
import type { IApiHookInput } from "@/types";
import { formatOrpcError } from "@/utils/formatOrpcError";
import { useAuthStore } from "@/zustand/auth/AuthStoreContext";

import type { ProfileUpdateContractType } from "./user.contract";

export function useRoleUpdate<TFieldNames>({
  onRequestStart,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames> = {}) {
  const toastId = "update_role_toast_message";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.user.updateRole.mutationOptions({
      onMutate: () => {
        toast.loading("Updating...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }) => {
        toast.success(message, { id: toastId });
        await queryClient.invalidateQueries({
          queryKey: orpcTQClient.user.list.queryKey({
            input: {},
          }),
          exact: false,
        });
        onSuccess?.(message);
      },
      onError: (error) => {
        const { message, type, fieldErrors } =
          formatOrpcError<TFieldNames>(error);

        if (type === "validation") {
          onValidationErrors?.(fieldErrors ?? []);
        }

        toast.error(message, { id: toastId });

        onError?.(message);
      },
    })
  );
}

export function useProfileUpdate<TFieldNames>({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames>) {
  const toastId = "profile_update_toast_message";
  const addUserData = useAuthStore((state) => state.addUserData);

  const { mutateAsync: updateProfile } = useMutation(
    orpcTQClient.user.updateProfile.mutationOptions()
  );

  return useMutation<
    ProfileUpdateContractType["output"],
    Error,
    ProfileUpdateContractType["input"]
  >({
    mutationKey: ["profile-update"],
    mutationFn: async (input) => {
      return updateProfile(input);
    },
    onMutate: () => {
      toast.loading("Updating...", { id: toastId });
      onRequestStart?.();
    },
    onSuccess: async ({ message, data }) => {
      addUserData({
        ...data,
        image: data.image,
        name: data.name,
      });

      toast.success(message, { id: toastId });
      onSuccess?.(message);
    },
    onError: (error) => {
      const { message, type, fieldErrors } =
        formatOrpcError<TFieldNames>(error);

      if (type === "validation") {
        onValidationErrors?.(fieldErrors ?? []);
      }

      toast.error(message, { id: toastId });

      onError?.(message);
    },
    onSettled: () => {
      onRequestEnd?.();
    },
  });
}
