import { useCallback, useEffect, useMemo } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash } from "lucide-react";
import {
  useFieldArray,
  useForm,
  useWatch,
  type UseFormReturn,
} from "react-hook-form";

import { DateTimePickerField } from "@/components/form-fields/DateTimePickerField";
import { InputField } from "@/components/form-fields/InputField";
import { SelectField } from "@/components/form-fields/SelectField";
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
import { FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import {
  GridTable,
  GridTableBody,
  GridTableCell,
  GridTableHead,
  GridTableHeader,
  GridTableRow,
} from "@/components/ui/grid-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MEDICINE_TYPE } from "@/db/schemas/enums/enum-values";
import type { MedicineOptionType } from "@/features/medicine/components/MedicineSearchableInput";
import { MedicineSearchableInputField } from "@/features/medicine/components/MedicineSearchableInputField";
import { formatCurrency } from "@/utils/formatCurrency";

import { useCompanyPurchaseCreate } from "../api/companyPurchase.api.hook";
import {
  purchaseCreateFormSchema,
  type PurchaseCreateFormInputType,
  type PurchaseCreateFormType,
  type PurchaseCreateType,
} from "../purchase.schema";
import type { CompanyOptionType } from "./CompanySearchableInput";
import { CompanySearchableInputField } from "./CompanySearchableInputField";

const defaultItemValue: PurchaseCreateFormInputType["items"][number] = {
  isNew: true,
  medicineName: "",
  genericName: "",
  strength: "",
  baseUnit: "",
  qtyPurchased: "",
  costPerUnit: "",
  sellPerUnit: "",
};

function getFormInitialValue(
  inputValue?: Partial<PurchaseCreateFormInputType>
): PurchaseCreateFormInputType {
  return {
    ...inputValue,
    isNewCompany: false,
    companyName: "",
    companyPhone: "",
    companyAddress: "",
    items: [],
    totalAmount: "",
    paidAmount: "0",
  };
}

const medicineTypeOptions = MEDICINE_TYPE.map((type) => ({
  value: type,
  label: type.charAt(0).toUpperCase() + type.slice(1),
}));

export function PurchaseCreateDialog({
  companyId,
  open,
  setOpen,
  defaultOpen,
}: {
  companyId?: string;
  open: boolean;
  setOpen: (value: boolean) => void;
  defaultOpen?: boolean;
}) {
  "use no memo";
  const form = useForm<
    PurchaseCreateFormInputType,
    unknown,
    PurchaseCreateFormType
  >({
    resolver: zodResolver(purchaseCreateFormSchema),
    defaultValues: getFormInitialValue({ companyId }),
  });

  const { reset, handleSubmit, control, setValue, getValues } = form;

  const { mutate, isPending } = useCompanyPurchaseCreate<
    keyof PurchaseCreateType
  >({
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

  const itemsValue = useWatch({ control, name: "items" });
  const isNewCompany = useWatch({ control, name: "isNewCompany" });
  const totalAmountValue = useWatch({ control, name: "totalAmount" });
  const paidAmount = useWatch({ control, name: "paidAmount" });

  const subtotalAmount = useMemo(
    () =>
      itemsValue.reduce(
        (acc, { qtyPurchased, costPerUnit }) =>
          acc + (Number(qtyPurchased) || 0) * (Number(costPerUnit) || 0),
        0
      ),
    [itemsValue]
  );
  const totalAmount = useMemo(
    () => subtotalAmount || Number(totalAmountValue) || 0,
    [subtotalAmount, totalAmountValue]
  );

  const dueAmount = useMemo(
    () => totalAmount - (Number(paidAmount) || 0),
    [totalAmount, paidAmount]
  );

  useEffect(() => {
    const next = totalAmount > 0 ? String(totalAmount) : "";
    if (getValues("totalAmount") !== next) {
      setValue("totalAmount", next);
    }
  }, [totalAmount, setValue, getValues]);

  useEffect(() => {
    return () => {
      reset(getFormInitialValue());
    };
  }, [reset]);

  const onSubmit = handleSubmit((values) => {
    mutate({
      companyId: values.companyId ?? companyId,
      companyName: values.isNewCompany ? values.companyName : undefined,
      companyPhone: values.isNewCompany ? values.companyPhone : undefined,
      companyAddress: values.isNewCompany ? values.companyAddress : undefined,
      totalAmount: values.totalAmount,
      paidAmount: values.paidAmount,
      items: values.items,
    });
  });

  const formId = "purchase_create_form";

  const onCompanyTextChange = useCallback(() => {
    setValue("isNewCompany", true, { shouldDirty: true });
    setValue("companyId", undefined, { shouldDirty: true });
    setValue("companyPhone", "", { shouldDirty: true });
    setValue("companyAddress", "", { shouldDirty: true });
  }, [setValue]);

  const onCompanySelect = useCallback(
    (selectedCompany: CompanyOptionType) => {
      setValue("isNewCompany", false, { shouldDirty: true });
      setValue("companyId", selectedCompany.id, { shouldDirty: true });
      setValue("companyPhone", selectedCompany.phone ?? "", {
        shouldDirty: true,
      });
      setValue("companyAddress", selectedCompany.address ?? "", {
        shouldDirty: true,
      });
    },
    [setValue]
  );

  return (
    <Dialog defaultOpen={defaultOpen} open={open} onOpenChange={setOpen}>
      <DialogResponsiveContent className="max-w-full rounded-none sm:max-w-5xl sm:rounded-lg">
        <DialogStickyHeader>
          <DialogTitle>New Purchase</DialogTitle>
          <DialogDescription>
            Carefully fill these fields to create new purchase entry
          </DialogDescription>
        </DialogStickyHeader>
        <DialogResponsiveBody>
          <form id={formId} onSubmit={onSubmit}>
            <FieldGroup>
              {!companyId && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <CompanySearchableInputField
                    control={control}
                    name="companyName"
                    label="Company"
                    placeholder="Search or type company name"
                    description="Select an existing company or type a new one"
                    requiredField
                    onValueChange={onCompanyTextChange}
                    onOptionSelect={onCompanySelect}
                    disabled={isPending}
                  />
                  <InputField
                    control={control}
                    name="companyPhone"
                    label="Phone"
                    placeholder="Company phone number"
                    readOnly={!isNewCompany}
                    disabled={isPending}
                  />
                  <InputField
                    control={control}
                    name="companyAddress"
                    label="Address"
                    placeholder="Company address"
                    readOnly={!isNewCompany}
                    disabled={isPending}
                  />
                </div>
              )}
              <PurchaseMedicineItems form={form} isPending={isPending} />

              <div className="ml-auto w-full max-w-sm border">
                <div className="grid grid-cols-2">
                  {subtotalAmount > 0 && (
                    <>
                      <div className="border-r border-b p-2">
                        <Label>Subtotal amount</Label>
                      </div>
                      <div className="border-b">
                        <Input
                          name="subtotalAmount"
                          className="rounded-none border-none"
                          placeholder="Subtotal amount"
                          readOnly
                          value={subtotalAmount}
                          disabled={isPending}
                        />
                      </div>
                    </>
                  )}
                  <div className="border-r border-b p-2">
                    <Label>Total amount</Label>
                  </div>
                  <div className="border-b">
                    <InputField
                      control={control}
                      name="totalAmount"
                      className="rounded-none border-none"
                      placeholder="Total amount"
                      type="number"
                      min={0}
                      inputMode="numeric"
                      showError={false}
                      readOnly={subtotalAmount > 0}
                      disabled={isPending}
                    />
                  </div>

                  <div className="border-r p-2">
                    <Label>Paid amount</Label>
                  </div>
                  <div>
                    <InputField
                      control={control}
                      name="paidAmount"
                      className="rounded-none border-none"
                      placeholder="Paid amount"
                      type="number"
                      min={0}
                      inputMode="numeric"
                      showError={false}
                      disabled={isPending}
                    />
                  </div>

                  {dueAmount > 0 && (
                    <>
                      <div className="border-t border-r p-2">
                        <Label className="text-muted-foreground">
                          Due amount
                        </Label>
                      </div>
                      <div className="border-t px-2 py-0.5">
                        <span className="text-xs text-muted-foreground">
                          {formatCurrency(dueAmount)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </FieldGroup>
          </form>
        </DialogResponsiveBody>
        <DialogStickyFooter>
          <DialogClose render={<Button variant="secondary" />}>
            Cancel
          </DialogClose>
          <ButtonSpinner form={formId} type="submit" isLoading={isPending}>
            Submit
          </ButtonSpinner>
        </DialogStickyFooter>
      </DialogResponsiveContent>
    </Dialog>
  );
}

function PurchaseMedicineItems({
  form,
  isPending,
}: {
  form: UseFormReturn<PurchaseCreateFormInputType, any, PurchaseCreateFormType>;
  isPending?: boolean;
}) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  return (
    <FieldSet>
      <FieldLegend>Medicines</FieldLegend>
      <div className="space-y-2">
        <GridTable>
          <GridTableHeader>
            <GridTableRow>
              <GridTableHead span={4}>
                <Label>Medicine name</Label>
              </GridTableHead>
              <GridTableHead span={1}>
                <Label>Qty</Label>
              </GridTableHead>
              <GridTableHead span={2}>
                <Label>Cost / unit</Label>
              </GridTableHead>
              <GridTableHead span={2}>
                <Label>Sell / unit</Label>
              </GridTableHead>
              <GridTableHead span={2}>
                <Label>Expiry date</Label>
              </GridTableHead>
              <GridTableHead span={1} />
            </GridTableRow>
          </GridTableHeader>
          <GridTableBody>
            {fields.map((field, idx) => (
              <PurchaseMedicineItem
                key={field.id}
                fieldIdx={idx}
                form={form}
                onRemove={() => remove(idx)}
                isPending={isPending}
              />
            ))}
          </GridTableBody>
        </GridTable>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => append(defaultItemValue)}
        >
          <Plus />
          <span>Add more</span>
        </Button>
      </div>
    </FieldSet>
  );
}

function PurchaseMedicineItem({
  fieldIdx,
  form,
  onRemove,
  isPending,
}: {
  fieldIdx: number;
  form: UseFormReturn<PurchaseCreateFormInputType, any, PurchaseCreateFormType>;
  onRemove: () => void;
  isPending?: boolean;
}) {
  const { control, setValue } = form;

  const isNew = useWatch({ control, name: `items.${fieldIdx}.isNew` });

  const onMedicineTextChange = useCallback(() => {
    setValue(`items.${fieldIdx}.isNew`, true, { shouldDirty: true });
    setValue(`items.${fieldIdx}.medicineId`, undefined, { shouldDirty: true });
  }, [setValue, fieldIdx]);

  const onMedicineSelect = useCallback(
    (selectedMedicine: MedicineOptionType) => {
      setValue(`items.${fieldIdx}.isNew`, false, { shouldDirty: true });
      setValue(`items.${fieldIdx}.medicineId`, selectedMedicine.id, {
        shouldDirty: true,
      });
    },
    [setValue, fieldIdx]
  );

  return (
    <div className="border-t">
      <GridTableRow>
        <GridTableCell span={4}>
          <MedicineSearchableInputField
            control={control}
            showAddon={false}
            name={`items.${fieldIdx}.medicineName`}
            placeholder="Search or type medicine name"
            className="rounded-none border-none"
            onValueChange={onMedicineTextChange}
            onOptionSelect={onMedicineSelect}
            requiredField
            showError={false}
            disabled={isPending}
          />
        </GridTableCell>
        <GridTableCell span={1}>
          <InputField
            control={control}
            name={`items.${fieldIdx}.qtyPurchased`}
            className="rounded-none border-none"
            placeholder="Qty"
            type="number"
            min={1}
            inputMode="numeric"
            requiredField
            showError={false}
            disabled={isPending}
          />
        </GridTableCell>
        <GridTableCell span={2}>
          <InputField
            control={control}
            name={`items.${fieldIdx}.costPerUnit`}
            className="rounded-none border-none"
            placeholder="Cost"
            type="number"
            min={0}
            inputMode="decimal"
            requiredField
            showError={false}
            disabled={isPending}
          />
        </GridTableCell>
        <GridTableCell span={2}>
          <InputField
            control={control}
            name={`items.${fieldIdx}.sellPerUnit`}
            className="rounded-none border-none"
            placeholder="Sell price"
            type="number"
            min={0}
            inputMode="decimal"
            requiredField
            showError={false}
            disabled={isPending}
          />
        </GridTableCell>
        <GridTableCell span={2}>
          <DateTimePickerField
            control={control}
            name={`items.${fieldIdx}.expiryDate`}
            placeholder="Expiry date"
            triggerClassName="w-full rounded-none border-none"
            showTimeSelection={false}
            disabled={isPending}
          />
        </GridTableCell>
        <GridTableCell span={1}>
          <div className="flex justify-center">
            <Button size="icon" variant="destructive" onClick={onRemove}>
              <Trash /> <span className="sr-only">remove item</span>
            </Button>
          </div>
        </GridTableCell>
      </GridTableRow>
      {isNew && (
        <GridTableRow className="items-start border-t">
          <GridTableCell span={2}>
            <InputField
              control={control}
              name={`items.${fieldIdx}.genericName`}
              className="rounded-none border-none"
              placeholder="Generic name"
              disabled={isPending}
            />
          </GridTableCell>
          <GridTableCell span={2}>
            <InputField
              control={control}
              name={`items.${fieldIdx}.strength`}
              className="rounded-none border-none"
              placeholder="Strength (e.g. 500mg)"
              disabled={isPending}
            />
          </GridTableCell>
          <GridTableCell span={3}>
            <SelectField
              control={control}
              name={`items.${fieldIdx}.medicineType`}
              className="rounded-none border-none"
              placeholder="Medicine type"
              options={medicineTypeOptions}
              disabled={isPending}
            />
          </GridTableCell>
          <GridTableCell span={4}>
            <InputField
              control={control}
              name={`items.${fieldIdx}.baseUnit`}
              className="rounded-none border-none"
              placeholder="Base unit (e.g. strip)"
              disabled={isPending}
            />
          </GridTableCell>
          <GridTableCell span={1} />
        </GridTableRow>
      )}
    </div>
  );
}
