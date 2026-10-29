import { Atom, useAtom, useAtomSet } from "@effect-atom/atom-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";

import { InputField } from "@/components/form-fields/InputField";
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
import { usePermissionCheck } from "@/hooks/use-permission-check";

import { useSaleClosingCreate } from "../api/saleClosing.api.hook";
import {
  saleClosingCreateSchema,
  type SaleClosingCreateInputType,
  type SaleClosingCreateType,
} from "../saleClosing.schema";

const openSaleClosingCreateDialog = Atom.make(false).pipe(Atom.keepAlive);

const getFormInitialValue = (): SaleClosingCreateInputType => ({
  totalSales: "",
  totalSalary: "",
});

export function SaleClosingCreateButton() {
  const setOpen = useAtomSet(openSaleClosingCreateDialog);
  const isAllowCreate = usePermissionCheck([
    { level: "system", resource: "sale_closing", action: "create" },
  ]);

  return (
    <>
      {isAllowCreate && (
        <Button onClick={() => setOpen(true)}>
          <Plus />
          <span>New closing</span>
        </Button>
      )}
      <SaleClosingCreateDialog />
    </>
  );
}

function SaleClosingCreateDialog() {
  "use no memo";
  const [open, setOpen] = useAtom(openSaleClosingCreateDialog);

  const form = useForm<
    SaleClosingCreateInputType,
    unknown,
    SaleClosingCreateType
  >({
    resolver: zodResolver(saleClosingCreateSchema),
    defaultValues: getFormInitialValue(),
  });

  const { mutate, isPending } = useSaleClosingCreate<
    keyof SaleClosingCreateType
  >({
    onSuccess: () => {
      form.reset(getFormInitialValue());
      setOpen(false);
    },
    onValidationErrors: (fields) => {
      fields.forEach(({ fieldName, message }) => {
        form.setError(fieldName, { message });
      });
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    mutate(values);
  });

  const formId = "sale_closing_create_form";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogResponsiveContent>
        <DialogStickyHeader>
          <DialogTitle>New sale closing</DialogTitle>
          <DialogDescription>
            Close today&apos;s sales. Only one closing can be created per day.
          </DialogDescription>
        </DialogStickyHeader>

        <DialogResponsiveBody>
          <form id={formId} onSubmit={handleSubmit}>
            <FieldGroup>
              <InputField
                control={form.control}
                name="totalSales"
                label="Total sales"
                placeholder="Total sales amount"
                type="number"
                min={0}
                inputMode="decimal"
                disabled={isPending}
                requiredField
              />
              <InputField
                control={form.control}
                name="totalSalary"
                label="Total salary"
                placeholder="Total salary amount"
                type="number"
                min={0}
                inputMode="decimal"
                disabled={isPending}
                requiredField
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
