import { useEffect } from "react";

import { Atom, useAtom } from "@effect-atom/atom-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Wallet } from "lucide-react";
import { useForm } from "react-hook-form";

import { InputAddonField } from "@/components/form-fields/InputAddonField";
import { TextareaField } from "@/components/form-fields/TextareaField";
import { Button } from "@/components/ui/button";
import { ButtonSpinner } from "@/components/ui/button-spinner";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogResponsiveBody,
  DialogResponsiveContent,
  DialogStickyFooter,
  DialogStickyHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { SaleSelectorField } from "@/features/sale/components/SaleSelectorField";

import { useCreateCustomerPayment } from "../api/customerPayment.api.hook";
import {
  customerPaymentCreateSchema,
  type CustomerPaymentCreateInputType,
  type CustomerPaymentCreateType,
} from "../customer.schema";

export const openCustomerPaymentCreateDialog = Atom.make(false).pipe(
  Atom.keepAlive
);

export function CustomerPaymentCreateDialog({
  customerId,
}: {
  customerId: string;
}) {
  const [open, setOpen] = useAtom(openCustomerPaymentCreateDialog);

  const form = useForm<
    CustomerPaymentCreateInputType,
    any,
    CustomerPaymentCreateType
  >({
    resolver: zodResolver(customerPaymentCreateSchema),
    defaultValues: {
      customerId,
      saleId: undefined,
      amount: "",
      note: "",
    },
  });

  const { reset } = form;

  useEffect(() => {
    if (!open) return;

    reset({
      customerId,
      saleId: undefined,
      amount: "",
      note: "",
    });
  }, [customerId, open, reset]);

  const { mutate, isPending } = useCreateCustomerPayment<
    keyof CustomerPaymentCreateType
  >({
    onSuccess: () => {
      setOpen(false);
    },
    onValidationErrors: (fields) => {
      fields.forEach(({ fieldName, message }) => {
        form.setError(fieldName, { message });
      });
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    mutate({ ...values, customerId });
  });

  const formId = "customer_payment_create_form";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogResponsiveContent>
        <DialogStickyHeader>
          <DialogTitle>Record payment</DialogTitle>
          <DialogDescription>
            Record a payment received from this customer
          </DialogDescription>
        </DialogStickyHeader>

        <DialogResponsiveBody>
          <form id={formId} onSubmit={handleSubmit}>
            <FieldGroup>
              <SaleSelectorField
                control={form.control}
                name="saleId"
                customerId={customerId}
                label="Against purchase"
                description="Leave empty to record a general payment"
                fetchApi={open}
                disabled={isPending}
              />
              <InputAddonField
                control={form.control}
                name="amount"
                label="Amount"
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                firstAddon={<Wallet className="size-4" />}
                placeholder="0"
                disabled={isPending}
                requiredField
              />
              <TextareaField
                control={form.control}
                name="note"
                label="Note"
                placeholder="Notes"
                disabled={isPending}
              />
            </FieldGroup>
          </form>
        </DialogResponsiveBody>

        <DialogStickyFooter>
          <DialogClose
            render={
              <Button type="button" variant="outline" disabled={isPending} />
            }
          >
            Cancel
          </DialogClose>
          <ButtonSpinner form={formId} type="submit" isLoading={isPending}>
            Record
          </ButtonSpinner>
        </DialogStickyFooter>
      </DialogResponsiveContent>
    </Dialog>
  );
}
