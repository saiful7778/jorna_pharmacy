import { useMutation, useQueryClient } from "@tanstack/react-query";
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
              input: { customerId },
            }),
            exact: true,
          });
          await queryClient.invalidateQueries({
            queryKey: orpcTQClient.customer.payment.list.queryKey({
              input: { customerId },
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
