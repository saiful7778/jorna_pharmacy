import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { BuildingComplex, CheckIcon, SearchIcon } from "lucide-react";

import { QueryStateBoundary } from "@/components/tanstack-query/query-state-boundary";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_PAGE_INDEX } from "@/constants";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { orpcTQClient } from "@/oRPC/orpc";

export function CustomerSidebar({
  value,
  onSelect,
}: {
  value: string | undefined;
  onSelect: (customerId: string) => void;
}) {
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [searchInput, setSearchInput] = useState<string>("");

  const { data, isLoading, isError, error, refetch } = useQuery(
    orpcTQClient.customer.listForSearch.queryOptions({
      input: {
        search,
        searchFields: ["name", "phone", "address"],
        page: DEFAULT_PAGE_INDEX,
        limit: 10,
      },
      select: (result) => result.data,
    })
  );

  const debouncedSetSearch = useDebouncedCallback((searchValue: string) => {
    setSearch(searchValue.trim() || undefined);
  }, 500);

  const handleSearchChanage = (
    e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>
  ) => {
    const searchInputValue = e.target.value;
    debouncedSetSearch(searchInputValue);
    setSearchInput(searchInputValue);
  };

  return (
    <div className="space-y-2 rounded-xl bg-popover">
      <div className="px-4 pt-4">
        <InputGroup className="h-9">
          <InputGroupAddon>
            <SearchIcon className="size-3.5 shrink-0 opacity-50" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search customer..."
            value={searchInput}
            onChange={handleSearchChanage}
            inputMode="search"
            autoCapitalize="none"
          />
        </InputGroup>
      </div>
      <div className="px-3 pb-4">
        <QueryStateBoundary
          data={data}
          isLoading={isLoading}
          isError={isError}
          error={error}
          isEmpty={(d) => d.length === 0}
          loadingFallback={
            <div className="space-y-2 p-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-8" />
              ))}
            </div>
          }
          emptyFallback={
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
              <BuildingComplex className="size-8 opacity-20" />
              <span>No customer found</span>
            </div>
          }
          errorFallback={() => (
            <div
              role="alert"
              className="p-6 text-center text-sm text-muted-foreground"
            >
              <p className="mb-3">Couldn’t load customer.</p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Try again
              </Button>
            </div>
          )}
        >
          {(customers) => (
            <div>
              {customers.map((customer) => (
                <button
                  type="button"
                  key={customer.id}
                  onClick={() => onSelect(customer.id)}
                  data-checked={customer.id === value}
                  className="group/command-item transation-colors block flex w-full cursor-pointer items-center rounded-md px-2.5 py-1.5 text-left duration-300 hover:bg-muted data-checked:bg-muted data-checked:text-foreground"
                >
                  <span className="flex flex-col">
                    <span className="truncate text-sm font-medium">
                      {customer.name}
                    </span>
                    {customer.phone && (
                      <span className="truncate text-xs text-muted-foreground">
                        {customer.phone}
                      </span>
                    )}
                  </span>
                  <CheckIcon className="pointer-events-none ml-auto size-3.5 text-foreground opacity-0 group-has-data-[slot=command-shortcut]/command-item:hidden group-data-[checked=true]/command-item:opacity-100" />
                </button>
              ))}
            </div>
          )}
        </QueryStateBoundary>
      </div>
    </div>
  );
}
