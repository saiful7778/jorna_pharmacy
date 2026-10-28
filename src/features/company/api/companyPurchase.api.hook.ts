import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { orpcTQClient } from "@/oRPC/orpc";
import type { IApiHookInput } from "@/types";
import { formatOrpcError } from "@/utils/formatOrpcError";

export function useCompanyPurchaseCreate<TFieldNames>({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames> = {}) {
  const toastId = "company_purchase_create_toast_message";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.company.purchase.create.mutationOptions({
      onMutate: () => {
        toast.loading("Loading...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }) => {
        toast.success(message, { id: toastId });
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: orpcTQClient.company.purchase.list.queryKey({
              input: {},
            }),
            exact: false,
          }),
          queryClient.invalidateQueries({
            queryKey: orpcTQClient.company.purchase.stats.queryKey({
              input: {},
            }),
            exact: false,
          }),
          queryClient.invalidateQueries({
            queryKey: orpcTQClient.company.list.queryKey({ input: {} }),
            exact: false,
          }),
          queryClient.invalidateQueries({
            queryKey: orpcTQClient.medicine.listForSearch.queryKey({
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
      onSettled: () => {
        onRequestEnd?.();
      },
    })
  );
}
