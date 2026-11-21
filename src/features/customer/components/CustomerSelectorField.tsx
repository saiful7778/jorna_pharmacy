import { useCallback, useId, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Asterisk, Info, Users } from "lucide-react";
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

import type { ListCustomerForSearchContractType } from "../api/customer.contract";

export type CustomerOptionType =
  ListCustomerForSearchContractType["output"]["data"][number];

interface CustomerSelectorFieldProps<
  TFieldValues extends FieldValues,
  TTransformedValues = TFieldValues,
> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues, any, TTransformedValues>;
  label?: string;
  description?: string;
  isDescriptionInfoIconShow?: boolean;
  requiredField?: boolean;
  disabled?: boolean;
  fetchApi?: boolean;
}

export function CustomerSelectorField<
  TFieldValues extends FieldValues,
  TTransformedValues = TFieldValues,
>({
  name,
  control,
  label,
  description,
  isDescriptionInfoIconShow,
  requiredField = false,
  disabled = false,
  fetchApi = true,
}: CustomerSelectorFieldProps<TFieldValues, TTransformedValues>) {
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
          <CustomerSelectorFieldRender
            field={field}
            fieldState={fieldState}
            id={fieldId}
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

interface CustomerSelectorFieldRenderProps<TFieldValues extends FieldValues> {
  field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>;
  fieldState: ControllerFieldState;
  id: string;
  disabled?: boolean;
  fetchApi?: boolean;
  placeholder?: string;
}

function CustomerSelectorFieldRender<TFieldValues extends FieldValues>({
  field,
  fieldState,
  id,
  disabled = false,
  fetchApi = true,
  placeholder = "Select customer",
}: CustomerSelectorFieldRenderProps<TFieldValues>) {
  const [search, setSearch] = useState<string | undefined>(undefined);

  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.customer.listForSearch.queryOptions({
      input: {
        search,
        searchFields: ["name", "phone", "address"],
        page: DEFAULT_PAGE_INDEX,
        limit: 5,
      },
      enabled: fetchApi,
      select: (result) => result.data,
    })
  );

  const fieldValue = field.value as string | undefined;

  const selectedCustomer = fieldValue
    ? data?.find((customer) => customer.id === fieldValue)
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
        <Users className="size-4" />
        {selectedCustomer ? (
          <span className="truncate">{customerLabel(selectedCustomer)}</span>
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
        description="Select a customer"
        searchPlaceholder="Search customer..."
        loadingFallback={
          <SearchableSelectorLoadingSkeleton>
            <Skeleton className="h-8" />
          </SearchableSelectorLoadingSkeleton>
        }
        emptyFallback={
          <SearchableSelectorEmpty
            message="No customers found"
            icon={<Users className="size-8 opacity-20" />}
          />
        }
      >
        {(customer) => <CustomerItem customer={customer} />}
      </SearchableSelectorContent>
    </SearchableSelector>
  );
}

function customerLabel(customer: CustomerOptionType) {
  return customer.phone
    ? `${customer.name} · ${customer.phone}`
    : customer.name;
}

function CustomerItem({ customer }: { customer: CustomerOptionType }) {
  return (
    <SearchableSelectorItem item={customer} getItemId={(item) => item.id}>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium">{customer.name}</span>
        {customer.phone && (
          <span className="truncate text-xs text-muted-foreground">
            {customer.phone}
          </span>
        )}
        {customer.address && (
          <span className="truncate text-xs text-muted-foreground">
            {customer.address}
          </span>
        )}
      </div>
    </SearchableSelectorItem>
  );
}
