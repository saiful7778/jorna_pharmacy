import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { orpcTQClient } from "@/oRPC/orpc";
import type { IApiHookInput } from "@/types";
import { formatOrpcError } from "@/utils/formatOrpcError";

export function useCreateCustomerPayment<TFieldNames>({
  onRequestStart,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames> = {}) {
  const toastId = "create_customer_payment_toast_message";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.customer.payment.create.mutationOptions({
      onMutate: () => {
        toast.loading("Recording...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }, { customerId }) => {
        toast.success(message, { id: toastId });
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: orpcTQClient.customer.payment.list.queryKey({
              input: { customerId },
            }),
            exact: false,
          }),
          queryClient.invalidateQueries({
            queryKey: orpcTQClient.customer.payment.stats.queryKey({
              input: { customerId },
            }),
            exact: false,
          }),
          queryClient.invalidateQueries({
            queryKey: orpcTQClient.customer.details.queryKey({
              input: { customerId },
            }),
            exact: true,
          }),
          queryClient.invalidateQueries({
            queryKey: orpcTQClient.customer.list.queryKey({
              input: {},
            }),
            exact: false,
          }),
          queryClient.invalidateQueries({
            queryKey: orpcTQClient.sale.list.queryKey({
              input: {},
            }),
            exact: false,
          }),
          queryClient.invalidateQueries({
            queryKey: orpcTQClient.sale.stats.queryKey({
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
