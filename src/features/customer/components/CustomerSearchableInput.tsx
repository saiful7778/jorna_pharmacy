import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Search, Users, X } from "lucide-react";

import { InputGroupButton } from "@/components/ui/input-group";
import {
  SearchableInput,
  type SearchableInputProps,
} from "@/components/ui/searchable-input";
import { DEFAULT_PAGE_INDEX } from "@/constants";
import { orpcTQClient } from "@/oRPC/orpc";

import type { ListCustomerForSearchContractType } from "../api/customer.contract";

export type CustomerOptionType =
  ListCustomerForSearchContractType["output"]["data"][number];

const getOptionLabel = (customer: CustomerOptionType) => customer.name;

export interface CustomerSearchableInputProps extends Omit<
  SearchableInputProps<CustomerOptionType>,
  | "getOptionLabel"
  | "getOptionKey"
  | "options"
  | "renderOption"
  | "onSearch"
  | "firstAddon"
  | "secondAddon"
> {
  onReset?: () => void;
}

export function CustomerSearchableInput({
  placeholder = "Search customer",
  value,
  onChange,
  onValueChange,
  onReset,
  defaultOpen = false,
  ...props
}: CustomerSearchableInputProps) {
  const [search, setSearch] = useState<string | undefined>(undefined);

  const { data } = useQuery(
    orpcTQClient.customer.listForSearch.queryOptions({
      input: {
        search,
        searchFields: ["name", "phone", "address"],
        page: DEFAULT_PAGE_INDEX,
        limit: 5,
      },
      enabled: defaultOpen || Boolean(search?.trim()),
      select: (result) => result.data,
    })
  );

  const handleReset = () => {
    setSearch(undefined);
    onReset?.();
    onChange?.("");
    onValueChange?.("");
  };

  return (
    <SearchableInput
      {...props}
      defaultOpen={defaultOpen}
      firstAddon={<Search className="size-4" />}
      secondAddon={
        <InputGroupButton
          aria-label="Reset"
          title="Reset"
          type="button"
          size="icon-xs"
          onClick={handleReset}
        >
          {value.trim() ? (
            <X className="size-4" />
          ) : (
            <Users className="size-4" />
          )}
        </InputGroupButton>
      }
      value={value}
      onChange={onChange}
      onValueChange={onValueChange}
      placeholder={placeholder}
      options={data}
      onSearch={setSearch}
      getOptionKey={(customer) => customer.id}
      getOptionLabel={getOptionLabel}
      renderOption={(customer) => (
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
      )}
    />
  );
}
