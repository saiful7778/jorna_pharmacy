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
import type { ListSaleContractType } from "@/features/sale/api/sale.contract";
import { orpcTQClient } from "@/oRPC/orpc";
import { formatCurrency } from "@/utils/formatCurrency";

type CustomerSaleItem = ListSaleContractType["output"]["data"]["data"][number];

interface SaleSelectorFieldProps<
  TFieldValues extends FieldValues,
  TTransformedValues = TFieldValues,
> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues, any, TTransformedValues>;
  customerId: string;
  label?: string;
  description?: string;
  isDescriptionInfoIconShow?: boolean;
  requiredField?: boolean;
  disabled?: boolean;
  fetchApi?: boolean;
}

export function SaleSelectorField<
  TFieldValues extends FieldValues,
  TTransformedValues = TFieldValues,
>({
  name,
  control,
  customerId,
  label,
  description,
  isDescriptionInfoIconShow,
  requiredField = false,
  disabled = false,
  fetchApi = true,
}: SaleSelectorFieldProps<TFieldValues, TTransformedValues>) {
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
          <SaleSelectorFieldRender
            field={field}
            fieldState={fieldState}
            id={fieldId}
            customerId={customerId}
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

interface SaleSelectorFieldRenderProps<TFieldValues extends FieldValues> {
  field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>;
  fieldState: ControllerFieldState;
  id: string;
  customerId: string;
  disabled?: boolean;
  fetchApi?: boolean;
  placeholder?: string;
}

function SaleSelectorFieldRender<TFieldValues extends FieldValues>({
  field,
  fieldState,
  id,
  customerId,
  disabled = false,
  fetchApi = true,
  placeholder = "Select purchase",
}: SaleSelectorFieldRenderProps<TFieldValues>) {
  const [search, setSearch] = useState<string | undefined>(undefined);

  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.sale.list.queryOptions({
      input: {
        unpaidOnly: true,
        search,
        searchFields: ["invoiceNo"],
        page: DEFAULT_PAGE_INDEX,
        limit: 5,
        filter: {
          customerId,
        },
      },
      enabled: fetchApi,
      select: (result) => result.data.data,
    })
  );

  const fieldValue = field.value as string | undefined;

  const selectedSale = fieldValue
    ? data?.find((sale) => sale.id === fieldValue)
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
        {selectedSale ? (
          <span className="truncate">{saleLabel(selectedSale)}</span>
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
        {(sale) => <SaleItem sale={sale} />}
      </SearchableSelectorContent>
    </SearchableSelector>
  );
}

function saleLabel(sale: CustomerSaleItem) {
  const due = sale.totalAmount - sale.paidAmount;
  return `${sale.invoiceNo} · due ${formatCurrency(due)}`;
}

function SaleItem({ sale }: { sale: CustomerSaleItem }) {
  const due = sale.totalAmount - sale.paidAmount;

  return (
    <SearchableSelectorItem item={sale} getItemId={(item) => item.id}>
      <div className="flex w-full flex-col gap-0.5">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate font-medium">{sale.invoiceNo}</span>
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
            {`Due ${formatCurrency(due)}`}
          </span>
        </div>
        <span className="truncate text-xs text-muted-foreground">
          {sale.createdAt.toLocaleDateString()}
        </span>
      </div>
    </SearchableSelectorItem>
  );
}
