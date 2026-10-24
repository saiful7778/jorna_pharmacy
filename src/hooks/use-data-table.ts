import { useCallback, useMemo, useState } from "react";

import type {
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  SortingState,
  TableOptions,
  Updater,
  VisibilityState,
} from "@tanstack/react-table";
import {
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import type { FiltersType } from "@/types/data-table";

import { useDebouncedCallback } from "./use-debounced-callback";

interface UseDataTableProps<TData>
  extends
    Omit<
      TableOptions<TData>,
      | "state"
      | "pageCount"
      | "getCoreRowModel"
      | "manualFiltering"
      | "manualPagination"
      | "manualSorting"
    >,
    Required<Pick<TableOptions<TData>, "pageCount">> {
  enableAdvancedFilter?: boolean;
  filters: Omit<FiltersType, "search">;
  setFilters: (filters: Omit<FiltersType, "search">) => void;
}

const DEFAULT_PAGE_INDEX = 1;
const DEFAULT_PAGE_SIZE = 20;

export function useDataTable<TData>({
  columns,
  filters,
  setFilters,
  pageCount = -1,
  enableAdvancedFilter = false,
  ...props
}: UseDataTableProps<TData>) {
  "use no memo";
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const {
    page = DEFAULT_PAGE_INDEX,
    limit = DEFAULT_PAGE_SIZE,
    order,
    orderField,
    filter,
  } = filters;

  const pagination: PaginationState = useMemo(() => {
    return {
      pageIndex: page - 1, // zero-based index -> one-based index
      pageSize: limit,
    };
  }, [page, limit]);

  const onPaginationChange = useCallback(
    (updaterOrValue: Updater<PaginationState>) => {
      const next =
        typeof updaterOrValue === "function"
          ? updaterOrValue(pagination)
          : updaterOrValue;

      void setFilters({
        page: next.pageIndex + 1,
        limit: next.pageSize,
      });
    },
    [pagination, setFilters]
  );

  const sorting: SortingState = useMemo(() => {
    if (!orderField || !order) return [];
    return [{ id: orderField, desc: order === "desc" ? true : false }];
  }, [orderField, order]);

  const onSortingChange = useCallback(
    (updaterOrValue: Updater<SortingState>) => {
      const next =
        typeof updaterOrValue === "function"
          ? updaterOrValue(sorting)
          : updaterOrValue;

      if (next.length > 0) {
        void setFilters({
          orderField: next[0]!.id,
          order: next[0]!.desc ? "desc" : "asc",
        });
      } else {
        void setFilters({
          orderField: undefined,
          order: undefined,
        });
      }
    },
    [sorting, setFilters]
  );

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const filterableColumns = useMemo(() => {
    if (enableAdvancedFilter) return [];

    return columns.filter((column) => column.enableColumnFilter);
  }, [columns, enableAdvancedFilter]);

  const initialColumnFilters: ColumnFiltersState = useMemo(() => {
    if (enableAdvancedFilter) return [];

    return Object.entries(filter ?? {}).reduce<ColumnFiltersState>(
      (columnFilters, [key, value]) => {
        if (value !== null) {
          const processedValue = Array.isArray(value) ? value : [value];

          columnFilters.push({
            id: key,
            value: processedValue,
          });
        }
        return columnFilters;
      },
      []
    );
  }, [filter, enableAdvancedFilter]);

  const [columnFilters, setColumnFilters] =
    useState<ColumnFiltersState>(initialColumnFilters);

  const debouncedSetFilterValues = useDebouncedCallback(
    (values: typeof filter) => {
      void setFilters({
        page: DEFAULT_PAGE_INDEX,
        filter: values,
      });
    },
    300
  );

  const onColumnFiltersChange = useCallback(
    (updaterOrValue: Updater<ColumnFiltersState>) => {
      if (enableAdvancedFilter) return;

      setColumnFilters((prev) => {
        const next =
          typeof updaterOrValue === "function"
            ? updaterOrValue(prev)
            : updaterOrValue;

        const filterUpdates = next.reduce<Record<string, string[] | null>>(
          (acc, columnFilter) => {
            if (
              filterableColumns.find((column) => column.id === columnFilter.id)
            ) {
              acc[columnFilter.id] = columnFilter.value as string[];
            }
            return acc;
          },
          {}
        );

        for (const prevFilter of prev) {
          if (!next.some((nextFilter) => nextFilter.id === prevFilter.id)) {
            filterUpdates[prevFilter.id] = null;
          }
        }

        debouncedSetFilterValues(filterUpdates);
        return next;
      });
    },
    [debouncedSetFilterValues, filterableColumns, enableAdvancedFilter]
  );

  return useReactTable({
    ...props,
    pageCount,
    columns,
    state: {
      pagination,
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    defaultColumn: {
      ...props.defaultColumn,
      enableColumnFilter: false,
    },
    onRowSelectionChange: setRowSelection,
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });
}
