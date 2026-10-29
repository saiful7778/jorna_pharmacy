import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { orpcTQClient } from "@/oRPC/orpc";
import type { IApiHookInput } from "@/types";
import { formatOrpcError } from "@/utils/formatOrpcError";

export function useSaleClosingCreate<TFieldNames>({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames> = {}) {
  const toastId = "sale_closing_create_toast_message";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.saleClosing.create.mutationOptions({
      onMutate: () => {
        toast.loading("Creating...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }) => {
        toast.success(message, { id: toastId });
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: orpcTQClient.saleClosing.list.queryKey({ input: {} }),
            exact: false,
          }),
          queryClient.invalidateQueries({
            queryKey: orpcTQClient.saleClosing.stats.queryKey({ input: {} }),
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
