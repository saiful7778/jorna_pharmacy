import {
  type QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";

import { orpcTQClient } from "@/oRPC/orpc";
import type { IApiHookInput } from "@/types";
import { formatOrpcError } from "@/utils/formatOrpcError";

function invalidatePurchaseQueries(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: orpcTQClient.purchase.list.queryKey({ input: {} }),
      exact: false,
    }),
    queryClient.invalidateQueries({
      queryKey: orpcTQClient.purchase.listBin.queryKey({ input: {} }),
      exact: false,
    }),
    queryClient.invalidateQueries({
      queryKey: orpcTQClient.purchase.stats.queryKey({ input: {} }),
      exact: false,
    }),
    queryClient.invalidateQueries({
      queryKey: orpcTQClient.medicine.listForSearch.queryKey({ input: {} }),
      exact: false,
    }),
  ]);
}

export function useDeletePurchase({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: IApiHookInput = {}) {
  const toastId = "delete_company_purchase_toast_message";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.purchase.delete.mutationOptions({
      onMutate: () => {
        toast.loading("Deleting...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }) => {
        toast.success(message, { id: toastId });
        await invalidatePurchaseQueries(queryClient);
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

export function useDeleteAllPurchase({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: IApiHookInput = {}) {
  const toastId = "delete_all_company_purchase_toast_message";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.purchase.deleteAll.mutationOptions({
      onMutate: () => {
        toast.loading("Deleting...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }) => {
        toast.success(message, { id: toastId });
        await invalidatePurchaseQueries(queryClient);
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

export function useRestorePurchase({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: IApiHookInput = {}) {
  const toastId = "restore_company_purchase_toast_message";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.purchase.restore.mutationOptions({
      onMutate: () => {
        toast.loading("Restoring...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }) => {
        toast.success(message, { id: toastId });
        await invalidatePurchaseQueries(queryClient);
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

export function useRestoreAllPurchase({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: IApiHookInput = {}) {
  const toastId = "restore_all_company_purchase_toast_message";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.purchase.restoreAll.mutationOptions({
      onMutate: () => {
        toast.loading("Restoring...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }) => {
        toast.success(message, { id: toastId });
        await invalidatePurchaseQueries(queryClient);
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

export function useRemovePurchase({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: IApiHookInput = {}) {
  const toastId = "remove_company_purchase_toast_message";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.purchase.remove.mutationOptions({
      onMutate: () => {
        toast.loading("Removing...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }) => {
        toast.success(message, { id: toastId });
        await queryClient.invalidateQueries({
          queryKey: orpcTQClient.purchase.listBin.queryKey({
            input: {},
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

export function useRemoveAllPurchase({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: IApiHookInput = {}) {
  const toastId = "remove_all_company_purchase_toast_message";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.purchase.removeAll.mutationOptions({
      onMutate: () => {
        toast.loading("Removing...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }) => {
        toast.success(message, { id: toastId });
        await queryClient.invalidateQueries({
          queryKey: orpcTQClient.purchase.listBin.queryKey({
            input: {},
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
