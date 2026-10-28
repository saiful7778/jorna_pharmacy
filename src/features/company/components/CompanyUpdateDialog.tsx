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

import { useCompanyUpdate } from "../api/company.api.hook";
import { companyUpdateSchema, type CompanyUpdateType } from "../company.schema";

export function CompanyUpdateDialog({
  open,
  setOpen,
  companyId,
  companyData,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
  companyId: string;
  companyData: {
    name: string;
    phone?: string | null | undefined;
    address?: string | null | undefined;
    note?: string | null | undefined;
    isActive: boolean;
  };
}) {
  const form = useForm<CompanyUpdateType>({
    resolver: zodResolver(companyUpdateSchema),
    defaultValues: {
      companyId,
      name: companyData.name,
      phone: companyData.phone ?? "",
      address: companyData.address ?? "",
      note: companyData.note ?? "",
      isActive: companyData.isActive,
    },
  });

  const { mutate, isPending } = useCompanyUpdate<keyof CompanyUpdateType>({
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
    mutate({ ...values, companyId });
  });

  const formId = "company_update_form";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogResponsiveContent>
        <DialogStickyHeader>
          <DialogTitle>Update &quot;{companyData.name}&quot;</DialogTitle>
          <DialogDescription>Carefully update company data</DialogDescription>
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
              <CheckboxField
                control={form.control}
                name="isActive"
                label="Is Company active"
                disabled={isPending}
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
            Update
          </ButtonSpinner>
        </DialogStickyFooter>
      </DialogResponsiveContent>
    </Dialog>
  );
}
