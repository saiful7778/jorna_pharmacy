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

import type { ListCompanyForSearchContractType } from "../api/company.contract";

export type CompanyOptionType =
  ListCompanyForSearchContractType["output"]["data"][number];

const getOptionLabel = (company: CompanyOptionType) => company.name;

export interface CompanySearchableInputProps extends Omit<
  SearchableInputProps<CompanyOptionType>,
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

export function CompanySearchableInput({
  placeholder = "Search company",
  value,
  onChange,
  onValueChange,
  onReset,
  defaultOpen = false,
  ...props
}: CompanySearchableInputProps) {
  const [search, setSearch] = useState<string | undefined>(undefined);

  const { data } = useQuery(
    orpcTQClient.company.listForSearch.queryOptions({
      input: {
        search,
        searchFields: ["name", "phone", "address"],
        page: DEFAULT_PAGE_INDEX,
        limit: 5,
      },
      enable: defaultOpen || Boolean(search?.trim()),
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
      getOptionKey={(company) => company.id}
      getOptionLabel={getOptionLabel}
      renderOption={(company) => (
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium">{company.name}</span>
          {company.phone && (
            <span className="truncate text-xs text-muted-foreground">
              {company.phone}
            </span>
          )}
          {company.address && (
            <span className="truncate text-xs text-muted-foreground">
              {company.address}
            </span>
          )}
        </div>
      )}
    />
  );
}
