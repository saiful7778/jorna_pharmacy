import {
  type QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";

import { orpcTQClient } from "@/oRPC/orpc";
import type { IApiHookInput } from "@/types";
import { formatOrpcError } from "@/utils/formatOrpcError";

export function useSaleCreate<TFieldNames>({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames>) {
  const toastId = "sale_create_toast_message";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.sale.create.mutationOptions({
      onMutate: () => {
        toast.loading("Loading...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }, { customerId }) => {
        toast.success(message, { id: toastId });
        await queryClient.invalidateQueries({
          queryKey: orpcTQClient.sale.list.queryKey({ input: {} }),
          exact: false,
        });
        await queryClient.invalidateQueries({
          queryKey: orpcTQClient.sale.stats.queryKey({ input: {} }),
          exact: false,
        });
        if (customerId) {
          await queryClient.invalidateQueries({
            queryKey: orpcTQClient.customer.details.queryKey({
              input: { customerId },
            }),
            exact: true,
          });
          await queryClient.invalidateQueries({
            queryKey: orpcTQClient.customer.payment.stats.queryKey({
              input: {},
            }),
            exact: true,
          });
          await queryClient.invalidateQueries({
            queryKey: orpcTQClient.customer.payment.list.queryKey({
              input: {},
            }),
            exact: true,
          });
        }
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
      onSettled: () => {
        onRequestEnd?.();
      },
    })
  );
}

function invalidateSaleQueries(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: orpcTQClient.sale.list.queryKey({ input: {} }),
      exact: false,
    }),
    queryClient.invalidateQueries({
      queryKey: orpcTQClient.sale.listBin.queryKey({ input: {} }),
      exact: false,
    }),
    queryClient.invalidateQueries({
      queryKey: orpcTQClient.sale.stats.queryKey({ input: {} }),
      exact: false,
    }),
    queryClient.invalidateQueries({
      queryKey: orpcTQClient.customer.payment.list.queryKey({ input: {} }),
      exact: false,
    }),
    queryClient.invalidateQueries({
      queryKey: orpcTQClient.customer.payment.stats.queryKey({ input: {} }),
      exact: false,
    }),
  ]);
}

export function useDeleteSale({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: IApiHookInput = {}) {
  const toastId = "delete_sale_toast_message";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.sale.delete.mutationOptions({
      onMutate: () => {
        toast.loading("Deleting...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }) => {
        toast.success(message, { id: toastId });
        await invalidateSaleQueries(queryClient);
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

export function useDeleteAllSale({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: IApiHookInput = {}) {
  const toastId = "delete_all_sale_toast_message";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.sale.deleteAll.mutationOptions({
      onMutate: () => {
        toast.loading("Deleting...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }) => {
        toast.success(message, { id: toastId });
        await invalidateSaleQueries(queryClient);
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

export function useRestoreSale({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: IApiHookInput = {}) {
  const toastId = "restore_sale_toast_message";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.sale.restore.mutationOptions({
      onMutate: () => {
        toast.loading("Restoring...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }) => {
        toast.success(message, { id: toastId });
        await invalidateSaleQueries(queryClient);
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

export function useRestoreAllSale({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: IApiHookInput = {}) {
  const toastId = "restore_all_sale_toast_message";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.sale.restoreAll.mutationOptions({
      onMutate: () => {
        toast.loading("Restoring...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }) => {
        toast.success(message, { id: toastId });
        await invalidateSaleQueries(queryClient);
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

export function useRemoveSale({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: IApiHookInput = {}) {
  const toastId = "remove_sale_toast_message";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.sale.remove.mutationOptions({
      onMutate: () => {
        toast.loading("Removing...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }) => {
        toast.success(message, { id: toastId });
        await queryClient.invalidateQueries({
          queryKey: orpcTQClient.sale.listBin.queryKey({ input: {} }),
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

export function useRemoveAllSale({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: IApiHookInput = {}) {
  const toastId = "remove_all_sale_toast_message";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.sale.removeAll.mutationOptions({
      onMutate: () => {
        toast.loading("Removing...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }) => {
        toast.success(message, { id: toastId });
        await queryClient.invalidateQueries({
          queryKey: orpcTQClient.sale.listBin.queryKey({ input: {} }),
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
