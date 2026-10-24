import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { CheckboxField } from "@/components/form-fields/CheckboxField";
import { InputField } from "@/components/form-fields/InputField";
import { PhoneInputField } from "@/components/form-fields/PhoneInputField";
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

import { useUpdateCustomer } from "../api/customer.api.hook";
import {
  customerUpdateSchema,
  type CustomerUpdateType,
} from "../customer.schema";

export function CustomerUpdateDialog({
  open,
  setOpen,
  customerId,
  customerData,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
  customerId: string;
  customerData: {
    name: string;
    phone?: string | null | undefined;
    address?: string | null | undefined;
    note?: string | null | undefined;
    isActive: boolean;
  };
}) {
  "use no memo";

  const form = useForm<CustomerUpdateType>({
    resolver: zodResolver(customerUpdateSchema),
    defaultValues: {
      name: customerData.name,
      phone: customerData.phone ?? "",
      address: customerData.address ?? "",
      note: customerData.note ?? "",
      isActive: customerData.isActive,
    },
  });

  const { mutate, isPending } = useUpdateCustomer<keyof CustomerUpdateType>({
    onSuccess: () => {
      setOpen(false);
    },
    onValidationErrors: (fields) => {
      fields.forEach(({ fieldName, message }) => {
        form.setError(fieldName, {
          message,
        });
      });
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    mutate({ ...values, customerId });
  });

  const formId = "customer_update_form";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogResponsiveContent>
        <DialogStickyHeader>
          <DialogTitle>Update &quot;{customerData.name}&quot;</DialogTitle>
          <DialogDescription>Carefully update customer data</DialogDescription>
        </DialogStickyHeader>

        <DialogResponsiveBody>
          <form id={formId} onSubmit={handleSubmit}>
            <FieldGroup>
              <InputField
                control={form.control}
                name="name"
                label="Name"
                placeholder="Customer name"
                disabled={isPending}
                requiredField
              />
              <CheckboxField
                control={form.control}
                name="isActive"
                label="Is customer active"
                disabled={isPending}
              />
              <PhoneInputField
                control={form.control}
                name="phone"
                label="Number"
                placeholder="Customer phone number"
                defaultCountry="BD"
                disabled={isPending}
              />
              <InputField
                control={form.control}
                name="address"
                label="Address"
                placeholder="Customer address"
                disabled={isPending}
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
            Update
          </ButtonSpinner>
        </DialogStickyFooter>
      </DialogResponsiveContent>
    </Dialog>
  );
}
