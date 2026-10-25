import { useCallback } from "react";

import { useNavigate } from "@tanstack/react-router";

import type { FileRoutesByFullPath, FileRouteTypes } from "@/routeTree.gen";

/** All full route paths from the generated route tree (API routes excluded). */
export type RoutePath = Exclude<FileRouteTypes["fullPaths"], `/api/${string}`>;

/** Fully-resolved search schema (own + parent routes) for a given route path */
export type SearchOf<TPath extends RoutePath> =
  FileRoutesByFullPath[TPath]["types"]["fullSearchSchema"];

/**
 * Either a partial object (merged into the current search params)
 * or an updater function receiving the previous search params.
 */
export type SearchUpdate<TPath extends RoutePath> =
  Partial<SearchOf<TPath>> | ((prev: SearchOf<TPath>) => SearchOf<TPath>);

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

/**
 * Type-safe helper to navigate by changing only the search params of a route.
 * Keys whose value is null, undefined, '' or NaN are removed from the URL.
 *
 * @example
 * const setSearch = useSearchNavigate('/dashboard/customers')
 * // or, inside the route file: useSearchNavigate(Route.fullPath)
 *
 * setSearch({ page: 2 })                                   // merge
 * setSearch((prev) => ({ ...prev, page: prev.page + 1 })) // updater
 * setSearch({ q: '' })                                     // removes `q`
 * setSearch({ page: 1 }, { replace: true })                // replace history entry
 */
export function useSearchNavigate<const TPath extends RoutePath>(path: TPath) {
  const navigate = useNavigate({ from: path });

  return useCallback(
    (update: SearchUpdate<TPath>, options: SearchNavigateOptions = {}) => {
      const searchValue = (prev: SearchOf<TPath>) => {
        const next =
          typeof update === "function"
            ? update(prev)
            : (Object.assign({}, prev, update) as SearchOf<TPath>);

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
}
