import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { orpcTQClient } from "@/oRPC/orpc";
import type { IApiHookInput } from "@/types";
import { formatOrpcError } from "@/utils/formatOrpcError";

export function useCreateCustomer<TFieldNames>({
  onRequestStart,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames> = {}) {
  const toastId = "create_customer_toast_message";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.customer.create.mutationOptions({
      onMutate: () => {
        toast.loading("Creating...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }) => {
        toast.success(message, { id: toastId });
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: orpcTQClient.customer.list.queryKey({
              input: {},
            }),
            exact: false,
          }),
          queryClient.invalidateQueries({
            queryKey: orpcTQClient.customer.listForSearch.queryKey({
              input: {},
            }),
            exact: false,
          }),
        ]);
        onSuccess?.(message);
      },
      onError: (error) => {
        const { message, type, fieldErrors } =
          formatOrpcError<TFieldNames>(error);

        if (type === "validation" && fieldErrors) {
          onValidationErrors?.(fieldErrors);
        }

        toast.error(message, { id: toastId });

        onError?.(message);
      },
    })
  );
}

export function useUpdateCustomer<TFieldNames>({
  onRequestStart,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames> = {}) {
  const toastId = "update_customer_toast_message";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.customer.update.mutationOptions({
      onMutate: () => {
        toast.loading("Updating...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }, { customerId }) => {
        toast.success(message, { id: toastId });
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: orpcTQClient.customer.list.queryKey({
              input: {},
            }),
            exact: false,
          }),
          queryClient.invalidateQueries({
            queryKey: orpcTQClient.customer.listForSearch.queryKey({
              input: {},
            }),
            exact: false,
          }),
          queryClient.invalidateQueries({
            queryKey: orpcTQClient.customer.details.queryKey({
              input: { customerId },
            }),
            exact: true,
          }),
        ]);
        onSuccess?.(message);
      },
      onError: (error) => {
        const { message, type, fieldErrors } =
          formatOrpcError<TFieldNames>(error);

        if (type === "validation" && fieldErrors) {
          onValidationErrors?.(fieldErrors);
        }

        toast.error(message, { id: toastId });

        onError?.(message);
      },
    })
  );
}
