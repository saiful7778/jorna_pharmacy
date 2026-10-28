import { useCallback, useId, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Asterisk, Info, Receipt } from "lucide-react";
import type {
  Control,
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  Path,
} from "react-hook-form";
import { Controller } from "react-hook-form";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  SearchableSelector,
  SearchableSelectorContent,
  SearchableSelectorEmpty,
  SearchableSelectorItem,
  SearchableSelectorLoadingSkeleton,
  SearchableSelectorTrigger,
} from "@/components/ui/searchable-selector";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_PAGE_INDEX } from "@/constants";
import { orpcTQClient } from "@/oRPC/orpc";
import { formatCurrency } from "@/utils/formatCurrency";

import type { ListCompanyPurchaseContractType } from "../api/companyPurchase.contract";

type PurchaseItem =
  ListCompanyPurchaseContractType["output"]["data"]["data"][number];

interface PurchaseSelectorFieldProps<
  TFieldValues extends FieldValues,
  TTransformedValues = TFieldValues,
> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues, any, TTransformedValues>;
  companyId: string;
  label?: string;
  description?: string;
  isDescriptionInfoIconShow?: boolean;
  requiredField?: boolean;
  disabled?: boolean;
  fetchApi?: boolean;
}

export function PurchaseSelectorField<
  TFieldValues extends FieldValues,
  TTransformedValues = TFieldValues,
>({
  name,
  control,
  companyId,
  label,
  description,
  isDescriptionInfoIconShow,
  requiredField = false,
  disabled = false,
  fetchApi = true,
}: PurchaseSelectorFieldProps<TFieldValues, TTransformedValues>) {
  const fieldId = useId();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          {label && (
            <FieldLabel htmlFor={fieldId} aria-disabled={disabled}>
              {label}
              {requiredField && (
                <Asterisk className="-mt-2 size-3 text-destructive" />
              )}
            </FieldLabel>
          )}
          <PurchaseSelectorFieldRender
            field={field}
            fieldState={fieldState}
            id={fieldId}
            companyId={companyId}
            disabled={disabled}
            fetchApi={fetchApi}
          />
          {description && (
            <FieldDescription
              className="flex items-start gap-1.5"
              aria-disabled={disabled}
            >
              {isDescriptionInfoIconShow && <Info className="mt-0.5 size-4" />}
              {description}
            </FieldDescription>
          )}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

interface PurchaseSelectorFieldRenderProps<TFieldValues extends FieldValues> {
  field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>;
  fieldState: ControllerFieldState;
  id: string;
  companyId: string;
  disabled?: boolean;
  fetchApi?: boolean;
  placeholder?: string;
}

function PurchaseSelectorFieldRender<TFieldValues extends FieldValues>({
  field,
  fieldState,
  id,
  companyId,
  disabled = false,
  fetchApi = true,
  placeholder = "Select purchase",
}: PurchaseSelectorFieldRenderProps<TFieldValues>) {
  const [search, setSearch] = useState<string | undefined>(undefined);

  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.company.purchase.list.queryOptions({
      input: {
        companyId,
        unpaidOnly: true,
        search,
        searchFields: ["companyInvoiceNo"],
        page: DEFAULT_PAGE_INDEX,
        limit: 5,
      },
      enabled: fetchApi,
      select: (result) => result.data.data,
    })
  );

  const fieldValue = field.value as string | undefined;

  const selectedPurchase = fieldValue
    ? data?.find((purchase) => purchase.id === fieldValue)
    : undefined;

  const handleOnChange = useCallback(
    (value: string | undefined) => {
      field.onChange(value);
    },
    [field]
  );

  return (
    <SearchableSelector
      value={fieldValue}
      onChange={handleOnChange}
      onSearch={setSearch}
      disabled={disabled}
    >
      <SearchableSelectorTrigger id={id} aria-invalid={fieldState.invalid}>
        <Receipt className="size-4" />
        {selectedPurchase ? (
          <span className="truncate">{purchaseLabel(selectedPurchase)}</span>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </SearchableSelectorTrigger>
      <SearchableSelectorContent
        data={data}
        isLoading={isLoading}
        isError={isError}
        error={error}
        title={placeholder}
        description="Select an unpaid purchase"
        searchPlaceholder="Search invoice..."
        loadingFallback={
          <SearchableSelectorLoadingSkeleton>
            <Skeleton className="h-8" />
          </SearchableSelectorLoadingSkeleton>
        }
        emptyFallback={
          <SearchableSelectorEmpty
            message="No unpaid purchases found"
            icon={<Receipt className="size-8 opacity-20" />}
          />
        }
      >
        {(purchase) => <PurchaseItem purchase={purchase} />}
      </SearchableSelectorContent>
    </SearchableSelector>
  );
}

function purchaseLabel(purchase: PurchaseItem) {
  const due = purchase.totalAmount - purchase.paidAmount;
  return `${purchase.company.name} · due ${formatCurrency(due)}`;
}

function PurchaseItem({ purchase }: { purchase: PurchaseItem }) {
  const due = purchase.totalAmount - purchase.paidAmount;

  return (
    <SearchableSelectorItem item={purchase} getItemId={(item) => item.id}>
      <div className="flex w-full flex-col gap-0.5">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate font-medium">{purchase.company.name}</span>
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
            {`Due ${formatCurrency(due)}`}
          </span>
        </div>
        <span className="truncate text-xs text-muted-foreground">
          {purchase.createdAt.toLocaleDateString()}
        </span>
      </div>
    </SearchableSelectorItem>
  );
}
