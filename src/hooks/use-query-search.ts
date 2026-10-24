import { useCallback, useMemo } from "react";

import { getRouteApi } from "@tanstack/react-router";
import type { RegisteredRouter, RouteIds } from "@tanstack/react-router";

type RouteTree = RegisteredRouter["routeTree"];
type RouteId = Exclude<RouteIds<RouteTree>, "__root__">;

type SearchNavigate = (options: {
  search: (prev: Record<string, unknown>) => Record<string, unknown>;
  replace?: boolean;
}) => Promise<void>;

export function useQuerySearch<const TId extends RouteId>(routeId: TId) {
  const route = getRouteApi(routeId);
  const search = route.useSearch();
  const navigate = route.useNavigate() as unknown as SearchNavigate;

  const filters = search;

  const setFilters = useCallback(
    (updates: Partial<Record<string, unknown>>) => {
      void navigate({
        search: (prev) => {
          const next: Record<string, unknown> = { ...prev };
          for (const [key, value] of Object.entries(updates)) {
            if (
              value === null ||
              value === undefined ||
              value === "" ||
              (typeof value === "number" && Number.isNaN(value))
            ) {
              delete next[key];
            } else {
              next[key] = value;
            }
          }
          return next;
        },
        replace: false,
      });
    },
    [navigate]
  );

  const setSearchFilter = useCallback(
    (searchValue: string | undefined) => {
      void navigate({
        search: (prev) => {
          const next: Record<string, unknown> = { ...prev };
          if (searchValue === undefined || searchValue === "") {
            delete next.search;
          } else {
            next.search = searchValue;
          }
          delete next.page;
          return next;
        },
        replace: false,
      });
    },
    [navigate]
  );

  return useMemo(
    () => ({ filters, setFilters, setSearchFilter }),
    [filters, setFilters, setSearchFilter]
  );
}
