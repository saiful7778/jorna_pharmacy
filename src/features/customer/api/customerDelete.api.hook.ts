import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { orpcTQClient } from "@/oRPC/orpc";
import type { IApiHookInput } from "@/types";
import { formatOrpcError } from "@/utils/formatOrpcError";

export function useDeleteCustomer({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: IApiHookInput = {}) {
  const toastId = "delete_customer_toast_message";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.customer.delete.mutationOptions({
      onMutate: () => {
        toast.loading("Deleting...", { id: toastId });
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
            queryKey: orpcTQClient.customer.listBin.queryKey({
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
        queryClient.removeQueries({
          queryKey: orpcTQClient.customer.details.queryKey({
            input: { customerId },
          }),
          exact: false,
        });
        onSuccess?.(message);
      },
      onError: (error) => {
        const { message } = formatOrpcError(error);

        toast.error(message, { id: toastId });

        onError?.(message);
      },
      onSettled: () => {
        onRequestEnd?.();
      },
    })
  );
}

export function useDeleteAllCustomer({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: IApiHookInput = {}) {
  const toastId = "delete_all_customer_toast_message";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.customer.deleteAll.mutationOptions({
      onMutate: () => {
        toast.loading("Deleting...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }, { customerIds }) => {
        toast.success(message, { id: toastId });
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: orpcTQClient.customer.list.queryKey({
              input: {},
            }),
            exact: false,
          }),
          queryClient.invalidateQueries({
            queryKey: orpcTQClient.customer.listBin.queryKey({
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
        customerIds.forEach((customerId) => {
          queryClient.removeQueries({
            queryKey: orpcTQClient.customer.details.queryKey({
              input: { customerId },
            }),
            exact: false,
          });
        });
        onSuccess?.(message);
      },
      onError: (error) => {
        const { message } = formatOrpcError(error);

        toast.error(message, { id: toastId });

        onError?.(message);
      },
      onSettled: () => {
        onRequestEnd?.();
      },
    })
  );
}

export function useRestoreCustomer({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: IApiHookInput = {}) {
  const toastId = "restore_customer_toast_message";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.customer.restore.mutationOptions({
      onMutate: () => {
        toast.loading("Restoring...", { id: toastId });
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
            queryKey: orpcTQClient.customer.listBin.queryKey({
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
            exact: false,
          }),
        ]);
        onSuccess?.(message);
      },
      onError: (error) => {
        const { message } = formatOrpcError(error);

        toast.error(message, { id: toastId });

        onError?.(message);
      },
      onSettled: () => {
        onRequestEnd?.();
      },
    })
  );
}

export function useRestoreAllCustomer({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: IApiHookInput = {}) {
  const toastId = "restore_all_customer_toast_message";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.customer.restoreAll.mutationOptions({
      onMutate: () => {
        toast.loading("Restoring...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }, { customerIds }) => {
        toast.success(message, { id: toastId });
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: orpcTQClient.customer.list.queryKey({
              input: {},
            }),
            exact: false,
          }),
          queryClient.invalidateQueries({
            queryKey: orpcTQClient.customer.listBin.queryKey({
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
          ...customerIds.map((customerId) =>
            queryClient.invalidateQueries({
              queryKey: orpcTQClient.customer.details.queryKey({
                input: { customerId },
              }),
              exact: false,
            })
          ),
        ]);
        onSuccess?.(message);
      },
      onError: (error) => {
        const { message } = formatOrpcError(error);

        toast.error(message, { id: toastId });

        onError?.(message);
      },
      onSettled: () => {
        onRequestEnd?.();
      },
    })
  );
}

export function useRemoveCustomer({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: IApiHookInput = {}) {
  const toastId = "remove_customer_toast_message";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.customer.remove.mutationOptions({
      onMutate: () => {
        toast.loading("Removing...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }, { customerId }) => {
        toast.success(message, { id: toastId });
        await queryClient.invalidateQueries({
          queryKey: orpcTQClient.customer.listBin.queryKey({
            input: {},
          }),
          exact: false,
        });
        queryClient.removeQueries({
          queryKey: orpcTQClient.customer.details.queryKey({
            input: { customerId },
          }),
          exact: false,
        });
        onSuccess?.(message);
      },
      onError: (error) => {
        const { message } = formatOrpcError(error);

        toast.error(message, { id: toastId });

        onError?.(message);
      },
      onSettled: () => {
        onRequestEnd?.();
      },
    })
  );
}

export function useRemoveAllCustomer({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: IApiHookInput = {}) {
  const toastId = "remove_all_customer_toast_message";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.customer.removeAll.mutationOptions({
      onMutate: () => {
        toast.loading("Removing...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }, { customerIds }) => {
        toast.success(message, { id: toastId });
        await queryClient.invalidateQueries({
          queryKey: orpcTQClient.customer.listBin.queryKey({
            input: {},
          }),
          exact: false,
        });
        customerIds.forEach((customerId) => {
          queryClient.removeQueries({
            queryKey: orpcTQClient.customer.details.queryKey({
              input: { customerId },
            }),
            exact: false,
          });
        });
        onSuccess?.(message);
      },
      onError: (error) => {
        const { message } = formatOrpcError(error);

        toast.error(message, { id: toastId });

        onError?.(message);
      },
      onSettled: () => {
        onRequestEnd?.();
      },
    })
  );
}
