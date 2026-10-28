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

import { useCompanyCreate } from "../api/company.api.hook";
import {
  companyCreateSchema,
  type CompanyCreateInputType,
  type CompanyCreateType,
} from "../company.schema";

export const openCompanyCreateDialog = Atom.make(false).pipe(Atom.keepAlive);

export function CompanyCreateDialog() {
  "use no memo";
  const [open, setOpen] = useAtom(openCompanyCreateDialog);

  const form = useForm<CompanyCreateInputType, unknown, CompanyCreateType>({
    resolver: zodResolver(companyCreateSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      note: "",
    },
  });

  const { mutate, isPending } = useCompanyCreate<keyof CompanyCreateType>({
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

  const formId = "company_create_form";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogResponsiveContent>
        <DialogStickyHeader>
          <DialogTitle>Create company</DialogTitle>
          <DialogDescription>
            Add a new company to your directory
          </DialogDescription>
        </DialogStickyHeader>

        <DialogResponsiveBody>
          <form id={formId} onSubmit={handleSubmit}>
            <FieldGroup>
              <InputField
                control={form.control}
                name="name"
                label="Name"
                placeholder="Company name"
                disabled={isPending}
                requiredField
              />
              <PhoneInputField
                control={form.control}
                name="phone"
                label="Number"
                placeholder="Company phone number"
                defaultCountry="BD"
                disabled={isPending}
              />
              <InputField
                control={form.control}
                name="address"
                label="Address"
                placeholder="Company address"
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
