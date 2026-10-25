import { useCallback, useMemo } from "react";

import { getRouteApi } from "@tanstack/react-router";

import type { FileRoutesById, FileRouteTypes } from "@/routeTree.gen";

import { useDebouncedCallback } from "./use-debounced-callback";

/** All route IDs from the generated route tree (API and __root__ routes excluded) */
export type RouteId = Exclude<
  FileRouteTypes["id"],
  "__root__" | `/api/${string}`
>;

/** Fully-resolved search schema (own + parent routes) for a given route id */
export type SearchOf<TId extends RouteId> =
  FileRoutesById[TId]["types"]["fullSearchSchema"];

/**
 * Either a partial object (merged into the current search params)
 * or an updater function receiving the previous search params.
 */
export type SearchUpdate<TId extends RouteId> =
  Partial<SearchOf<TId>> | ((prev: SearchOf<TId>) => SearchOf<TId>);

type SearchNavigateOptions = {
  /** Replace the current history entry instead of pushing a new one */
  replace?: boolean;
  /** Reset scroll position after navigating */
  resetScroll?: boolean;
  /** Hash to set on the URL */
  hash?: string;
};

/** null | undefined | '' | NaN */
function isEmptyValue(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    value === "" ||
    (typeof value === "number" && Number.isNaN(value))
  );
}

export function useSearchFilter<const TId extends RouteId>(
  routeId: TId,
  search_debounce_delay_ms: number = 500
) {
  const route = getRouteApi(routeId);
  const search = route.useSearch();
  const navigate = route.useNavigate();

  const setFilters = useCallback(
    (update: SearchUpdate<TId>, options: SearchNavigateOptions = {}) => {
      const searchValue = (prev: SearchOf<TId>) => {
        const next =
          typeof update === "function"
            ? update(prev)
            : (Object.assign({}, prev, update) as SearchOf<TId>);

        return Object.fromEntries(
          Object.entries(next as Record<string, unknown>).filter(
            ([, value]) => !isEmptyValue(value)
          )
        );
      };

      void (navigate as (opts: unknown) => Promise<void>)({
        to: ".",
        search: searchValue,
        ...options,
      });
    },
    [navigate]
  );

  const setSearchFilter = useCallback(
    (searchValue: string | null | undefined) => {
      void setFilters({ search: searchValue } as unknown as Partial<
        SearchOf<TId>
      >);
    },
    [setFilters]
  );

  const debouncedSearchFilter = useDebouncedCallback(
    setSearchFilter,
    search_debounce_delay_ms
  );

  return useMemo(
    () => ({
      filters: search,
      setFilters,
      setSearchFilter: debouncedSearchFilter,
    }),
    [search, setFilters, debouncedSearchFilter]
  );
}
