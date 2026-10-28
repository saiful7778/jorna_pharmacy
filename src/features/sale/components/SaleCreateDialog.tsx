import { useCallback, useEffect, useMemo } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash } from "lucide-react";
import {
  useFieldArray,
  useForm,
  useWatch,
  type UseFormReturn,
} from "react-hook-form";
import toast from "react-hot-toast";

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
import type { CustomerOptionType } from "@/features/customer/components/CustomerSearchableInput";
import { CustomerSearchableInputField } from "@/features/customer/components/CustomerSearchableInputField";
import type { MedicineOptionType } from "@/features/medicine/components/MedicineSearchableInput";
import { MedicineSearchableInputField } from "@/features/medicine/components/MedicineSearchableInputField";
import { formatCurrency } from "@/utils/formatCurrency";

import { useSaleCreate } from "../api/sale.api.hook";
import {
  saleCreateFormSchema,
  type SaleCreateFormInputType,
  type SaleCreateFormType,
  type SaleCreateType,
} from "../sale.schema";

const defaultItemValue: SaleCreateFormInputType["items"][number] = {
  medicineId: "",
  medicineName: "",
  price: 0,
  stock: 0,
  quantity: "",
};

const formInitialValue: SaleCreateFormInputType = {
  customerName: "",
  customerPhone: "",
  customerAddress: "",
  items: [],
  totalAmount: "",
  discountAmount: "",
  paidAmount: "0",
};

export function SaleCreateDialog({
  customerId,
  open,
  setOpen,
}: {
  customerId?: string;
  open: boolean;
  setOpen: (value: boolean) => void;
}) {
  const form = useForm<SaleCreateFormInputType, unknown, SaleCreateFormType>({
    resolver: zodResolver(saleCreateFormSchema),
    defaultValues: { ...formInitialValue, customerId },
  });

  const { reset, handleSubmit, control, setValue, getValues } = form;

  const handleDialog = (value: boolean) => {
    setOpen(value);
  };

  const { mutate, isPending } = useSaleCreate<keyof SaleCreateType>({
    onSuccess: () => {
      form.reset();
      handleDialog(false);
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
  const totalAmountValue = useWatch({ control, name: "totalAmount" });
  const discountAmount = useWatch({ control, name: "discountAmount" });
  const paidAmount = useWatch({ control, name: "paidAmount" });

  const subtotalAmount = useMemo(
    () =>
      itemsValue.reduce(
        (acc, { price, quantity }) =>
          acc + Number(price) * (Number(quantity) || 0),
        0
      ),
    [itemsValue]
  );
  const totalAmount = useMemo(
    () =>
      (subtotalAmount || Number(totalAmountValue) || 0) -
      (Number(discountAmount) || 0),
    [subtotalAmount, totalAmountValue, discountAmount]
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
      reset(formInitialValue);
    };
  }, [reset]);

  const onSubmit = handleSubmit((values) => {
    mutate({
      customerName: values.customerName,
      customerId: values.customerId,
      customerAddress: values.customerAddress,
      customerPhone: values.customerPhone,
      totalAmount: values.totalAmount,
      discountAmount: values.discountAmount,
      paidAmount: values.paidAmount,
      items: values.items.map((item) => ({
        medicineId: item.medicineId,
        quantity: item.quantity,
      })),
    });
  });

  const formId = "sale_create_form";

  const onCustomerFieldReset = useCallback(() => {
    setValue("customerId", undefined, {
      shouldDirty: true,
    });
    setValue("customerPhone", undefined, {
      shouldDirty: true,
    });
    setValue("customerAddress", undefined, {
      shouldDirty: true,
    });
  }, [setValue]);

  const onCustomerSelect = useCallback(
    (selectedCustomer: CustomerOptionType) => {
      setValue("isNewCustomer", false, {
        shouldDirty: true,
      });
      setValue("customerId", selectedCustomer.id, {
        shouldDirty: true,
      });
      setValue("customerPhone", selectedCustomer.phone ?? undefined, {
        shouldDirty: true,
      });
      setValue("customerAddress", selectedCustomer.address ?? undefined, {
        shouldDirty: true,
      });
    },
    [setValue]
  );

  return (
    <Dialog open={open} onOpenChange={handleDialog}>
      <DialogResponsiveContent className="max-w-full rounded-none sm:max-w-5xl sm:rounded-lg">
        <DialogStickyHeader>
          <DialogTitle>New Sale</DialogTitle>
          <DialogDescription>
            Carefully field those fields to create new sale entry
          </DialogDescription>
        </DialogStickyHeader>
        <DialogResponsiveBody>
          <form id={formId} onSubmit={onSubmit}>
            <FieldGroup>
              {!customerId && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <CustomerSearchableInputField
                    control={control}
                    name="customerName"
                    label="Customer"
                    placeholder="Search customer"
                    description="Type customer name to search"
                    onReset={onCustomerFieldReset}
                    onOptionSelect={onCustomerSelect}
                    disabled={isPending}
                  />
                  <InputField
                    control={control}
                    name="customerPhone"
                    label="Phone"
                    placeholder="Customer Phone Number"
                    disabled={isPending}
                  />
                  <InputField
                    control={control}
                    name="customerAddress"
                    label="Address"
                    placeholder="Customer Address"
                    disabled={isPending}
                  />
                </div>
              )}
              <SaleMedicineItems form={form} isPending={isPending} />

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
                          placeholder="subtotal amount"
                          readOnly
                          value={subtotalAmount}
                          disabled={isPending}
                        />
                      </div>
                      <div className="border-r border-b p-2">
                        <Label>Discount amount</Label>
                      </div>
                      <div className="border-b">
                        <InputField
                          control={control}
                          name="discountAmount"
                          className="rounded-none border-none"
                          placeholder="Discount amount"
                          type="number"
                          min={0}
                          max={subtotalAmount}
                          inputMode="numeric"
                          showError={false}
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

function SaleMedicineItems({
  form,
  isPending,
}: {
  form: UseFormReturn<SaleCreateFormInputType, any, SaleCreateFormType>;
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
              <GridTableHead span={5}>
                <Label>Medicine name</Label>
              </GridTableHead>
              <GridTableHead span={2}>
                <Label>Stock</Label>
              </GridTableHead>
              <GridTableHead span={2}>
                <Label>Price</Label>
              </GridTableHead>
              <GridTableHead span={2}>
                <Label>Qty</Label>
              </GridTableHead>
              <GridTableHead span={1} />
            </GridTableRow>
          </GridTableHeader>
          <GridTableBody>
            {fields.map((_, idx) => (
              <SaleMedicineItem
                key={idx}
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

function SaleMedicineItem({
  fieldIdx,
  form,
  onRemove,
  isPending,
}: {
  fieldIdx: number;
  form: UseFormReturn<SaleCreateFormInputType, any, SaleCreateFormType>;
  onRemove: () => void;
  isPending?: boolean;
}) {
  const { control, setValue } = form;

  const onMedicineSelect = useCallback(
    (selectedMedicine: MedicineOptionType, idx: number) => {
      if (selectedMedicine.stock === 0) {
        toast.error("This medicine is out of stock");
        return;
      }
      if (selectedMedicine.sellPerUnit == null) {
        toast.error("This medicine might not exist");
        return;
      }
      setValue(`items.${idx}.stock`, selectedMedicine.stock, {
        shouldDirty: true,
      });
      setValue(`items.${idx}.medicineId`, selectedMedicine.id, {
        shouldDirty: true,
      });
      setValue(`items.${idx}.price`, selectedMedicine.sellPerUnit, {
        shouldDirty: true,
      });
    },
    [setValue]
  );

  return (
    <GridTableRow className="border-t">
      <GridTableCell span={5}>
        <MedicineSearchableInputField
          control={control}
          showAddon={false}
          name={`items.${fieldIdx}.medicineName`}
          placeholder="Search medicine"
          className="rounded-none border-none"
          onOptionSelect={(selectedMedicine) =>
            onMedicineSelect(selectedMedicine, fieldIdx)
          }
          requiredField
          showError={false}
          disabled={isPending}
        />
      </GridTableCell>
      <GridTableCell span={2}>
        <InputField
          control={control}
          name={`items.${fieldIdx}.stock`}
          className="rounded-none border-none"
          placeholder="Stock"
          requiredField
          readOnly
          showError={false}
          disabled={isPending}
        />
      </GridTableCell>
      <GridTableCell span={2}>
        <InputField
          control={control}
          name={`items.${fieldIdx}.price`}
          className="rounded-none border-none"
          placeholder="Price"
          valueModifier={(value) => formatCurrency(Number(value) || 0)}
          requiredField
          readOnly
          showError={false}
          disabled={isPending}
        />
      </GridTableCell>
      <GridTableCell span={2}>
        <InputField
          control={control}
          name={`items.${fieldIdx}.quantity`}
          className="rounded-none border-none"
          placeholder="Quantity"
          requiredField
          showError={false}
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
  );
}
