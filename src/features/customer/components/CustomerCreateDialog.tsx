import { Atom, useAtom } from "@effect-atom/atom-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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

import { useCreateCustomer } from "../api/customer.api.hook";
import {
  customerCreateSchema,
  type CustomerCreateType,
} from "../customer.schema";

export const openCustomerCreateDialog = Atom.make(false).pipe(Atom.keepAlive);

export function CustomerCreateDialog() {
  "use no memo";
  const [open, setOpen] = useAtom(openCustomerCreateDialog);

  const form = useForm<CustomerCreateType>({
    resolver: zodResolver(customerCreateSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      note: "",
    },
  });

  const { mutate, isPending } = useCreateCustomer<keyof CustomerCreateType>({
    onSuccess: () => {
      form.reset();
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
    mutate(values);
  });

  const formId = "customer_create_form";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogResponsiveContent>
        <DialogStickyHeader>
          <DialogTitle>Create customer</DialogTitle>
          <DialogDescription>
            Add a new customer to your directory
          </DialogDescription>
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
            Create
          </ButtonSpinner>
        </DialogStickyFooter>
      </DialogResponsiveContent>
    </Dialog>
  );
}
