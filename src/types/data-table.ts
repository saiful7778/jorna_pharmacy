import type { ColumnDef, RowData } from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    queryKeys?: QueryKeys;
  }

  interface ColumnMeta<TData extends RowData, TValue> {
    label?: string;
    placeholder?: string;
    variant?: FilterVariant;
    options?: Option[];
    range?: [number, number];
    unit?: string;
    icon?: React.FC<React.SVGProps<SVGSVGElement>>;
  }
}

export interface QueryKeys {
  searchText: string | undefined;
}

export interface Option {
  label: string;
  value: string;
  count?: number;
}

export type FilterVariant =
  | "text"
  | "number"
  | "range"
  | "date"
  | "dateRange"
  | "boolean"
  | "select"
  | "multiSelect";

export type ColumnType<T> = Array<ColumnDef<T>>;

export type FiltersType = Partial<{
  page: number;
  limit: number;
  search: string | null;
  order: "asc" | "desc" | null;
  orderField: string | null;
  filter: Record<string, string | string[] | null>;
}>;
