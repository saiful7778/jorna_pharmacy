import { useEffect } from "react";

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

import { useCompanyPaymentCreate } from "../api/companyPayment.api.hook";
import {
  companyPaymentCreateSchema,
  type CompanyPaymentCreateInputType,
  type CompanyPaymentCreateType,
} from "../company.schema";
import { PurchaseSelectorField } from "./PurchaseSelectorField";

export function CompanyPaymentCreateDialog({
  companyId,
  purchaseId,
  open,
  setOpen,
}: {
  companyId: string;
  purchaseId?: string;
  open: boolean;
  setOpen: (value: boolean) => void;
}) {
  const form = useForm<
    CompanyPaymentCreateInputType,
    unknown,
    CompanyPaymentCreateType
  >({
    resolver: zodResolver(companyPaymentCreateSchema),
    defaultValues: {
      companyId,
      purchaseId,
      amount: "",
      note: "",
    },
  });

  const { reset } = form;

  useEffect(() => {
    if (!open) return;

    reset({
      companyId,
      purchaseId,
      amount: "",
      note: "",
    });
  }, [companyId, purchaseId, open, reset]);

  const { mutate, isPending } = useCompanyPaymentCreate<
    keyof CompanyPaymentCreateType
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
    mutate({ ...values, companyId });
  });

  const formId = "company_payment_create_form";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogResponsiveContent>
        <DialogStickyHeader>
          <DialogTitle>New payment</DialogTitle>
          <DialogDescription>
            Record a payment received from this company
          </DialogDescription>
        </DialogStickyHeader>

        <DialogResponsiveBody>
          <form id={formId} onSubmit={handleSubmit}>
            <FieldGroup>
              <PurchaseSelectorField
                control={form.control}
                name="purchaseId"
                companyId={companyId}
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
