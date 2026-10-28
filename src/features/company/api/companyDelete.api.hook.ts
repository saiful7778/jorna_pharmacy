import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { orpcTQClient } from "@/oRPC/orpc";
import type { IApiHookInput } from "@/types";
import { formatOrpcError } from "@/utils/formatOrpcError";

export function useCompanyDelete({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: IApiHookInput = {}) {
  const toastId = "company_delete_toast_message";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.company.delete.mutationOptions({
      onMutate: () => {
        toast.loading("Deleting...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }, { companyId }) => {
        toast.success(message, { id: toastId });
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: orpcTQClient.company.list.queryKey({ input: {} }),
            exact: false,
          }),
          queryClient.invalidateQueries({
            queryKey: orpcTQClient.company.listBin.queryKey({ input: {} }),
            exact: false,
          }),
        ]);
        queryClient.removeQueries({
          queryKey: orpcTQClient.company.details.queryKey({
            input: { companyId },
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

export function useCompanyDeleteAll({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: IApiHookInput = {}) {
  const toastId = "company_delete_all_toast_message";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.company.deleteAll.mutationOptions({
      onMutate: () => {
        toast.loading("Deleting...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }, { companyIds }) => {
        toast.success(message, { id: toastId });
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: orpcTQClient.company.list.queryKey({ input: {} }),
            exact: false,
          }),
          queryClient.invalidateQueries({
            queryKey: orpcTQClient.company.listBin.queryKey({ input: {} }),
            exact: false,
          }),
        ]);
        companyIds.forEach((companyId) => {
          queryClient.removeQueries({
            queryKey: orpcTQClient.company.details.queryKey({
              input: { companyId },
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

export function useCompanyRestore({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: IApiHookInput = {}) {
  const toastId = "company_restore_toast_message";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.company.restore.mutationOptions({
      onMutate: () => {
        toast.loading("Restoring...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }, { companyId }) => {
        toast.success(message, { id: toastId });
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: orpcTQClient.company.list.queryKey({ input: {} }),
            exact: false,
          }),
          queryClient.invalidateQueries({
            queryKey: orpcTQClient.company.listBin.queryKey({ input: {} }),
            exact: false,
          }),
          queryClient.invalidateQueries({
            queryKey: orpcTQClient.company.details.queryKey({
              input: { companyId },
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

export function useCompanyRestoreAll({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: IApiHookInput = {}) {
  const toastId = "company_restore_all_toast_message";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.company.restoreAll.mutationOptions({
      onMutate: () => {
        toast.loading("Restoring...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }, { companyIds }) => {
        toast.success(message, { id: toastId });
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: orpcTQClient.company.list.queryKey({ input: {} }),
            exact: false,
          }),
          queryClient.invalidateQueries({
            queryKey: orpcTQClient.company.listBin.queryKey({ input: {} }),
            exact: false,
          }),
          ...companyIds.map((companyId) =>
            queryClient.invalidateQueries({
              queryKey: orpcTQClient.company.details.queryKey({
                input: { companyId },
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

export function useCompanyRemove({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: IApiHookInput = {}) {
  const toastId = "company_remove_toast_message";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.company.remove.mutationOptions({
      onMutate: () => {
        toast.loading("Removing...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }, { companyId }) => {
        toast.success(message, { id: toastId });
        await queryClient.invalidateQueries({
          queryKey: orpcTQClient.company.listBin.queryKey({ input: {} }),
          exact: false,
        });
        queryClient.removeQueries({
          queryKey: orpcTQClient.company.details.queryKey({
            input: { companyId },
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

export function useCompanyRemoveAll({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: IApiHookInput = {}) {
  const toastId = "company_remove_all_toast_message";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.company.removeAll.mutationOptions({
      onMutate: () => {
        toast.loading("Removing...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }, { companyIds }) => {
        toast.success(message, { id: toastId });
        await queryClient.invalidateQueries({
          queryKey: orpcTQClient.company.listBin.queryKey({ input: {} }),
          exact: false,
        });
        companyIds.forEach((companyId) => {
          queryClient.removeQueries({
            queryKey: orpcTQClient.company.details.queryKey({
              input: { companyId },
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
