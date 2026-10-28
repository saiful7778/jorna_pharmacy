import { differenceInCalendarDays } from "date-fns";
import { MapPin, Phone } from "lucide-react";

import { FormatDateCell } from "@/components/FormatDateCell";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Checkbox } from "@/components/ui/checkbox";
import { BIN_RETENTION_DAYS } from "@/constants";
import type { ColumnType } from "@/types/data-table";

import type { ListCompanyBinContractType } from "../../api/companyDelete.contract";
import { CompanyBinTableRowAction } from "./CompanyBinTableRowAction";

type CompanyBinTableRowDataType =
  ListCompanyBinContractType["output"]["data"]["data"][number];

export const companyBinTableColumn: ColumnType<CompanyBinTableRowDataType> = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all companies on this page"
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected()}
        onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label={`Select ${row.original.name}`}
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onCheckedChange={(checked) => row.toggleSelected(checked)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "company",
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Company" />
    ),
    cell: ({ row, getValue }) => (
      <div className="max-w-sm min-w-56">
        <div className="font-medium">
          {getValue<CompanyBinTableRowDataType["name"]>()}
        </div>
        <div className="mt-1 flex flex-col text-xs text-muted-foreground">
          {row.original.phone ? (
            <span className="inline-flex min-w-0 items-center gap-1">
              <Phone aria-hidden="true" className="size-3 shrink-0" />
              <span className="tabular-nums">{row.original.phone}</span>
            </span>
          ) : (
            <span>No phone</span>
          )}
          {row.original.address ? (
            <span className="inline-flex min-w-0 items-center gap-1">
              <MapPin aria-hidden="true" className="size-3 shrink-0" />
              <span className="line-clamp-1" title={row.original.address}>
                {row.original.address}
              </span>
            </span>
          ) : (
            <span>No address</span>
          )}
        </div>
      </div>
    ),
    meta: { label: "Company" },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "deletedAt",
    accessorKey: "deletedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Deleted on" />
    ),
    cell: ({ getValue }) => {
      const deletedAt = getValue<CompanyBinTableRowDataType["deletedAt"]>();

      return deletedAt ? (
        <FormatDateCell
          format="dd MMM, yyyy"
          value={deletedAt}
          className="text-muted-foreground"
        />
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
    meta: { label: "Deleted on" },
    enableSorting: false,
  },
  {
    id: "purgeIn",
    header: "Purge in",
    cell: ({ row }) => {
      const { deletedAt } = row.original;

      if (!deletedAt) {
        return <span className="text-muted-foreground">-</span>;
      }

      const daysLeft = Math.max(
        BIN_RETENTION_DAYS - differenceInCalendarDays(new Date(), deletedAt),
        0
      );

      return (
        <span className="text-muted-foreground tabular-nums">
          {daysLeft} {daysLeft === 1 ? "day" : "days"}
        </span>
      );
    },
    meta: { label: "Purge in" },
    enableSorting: false,
  },
  {
    id: "actions",
    cell: ({ row }) => <CompanyBinTableRowAction companyData={row.original} />,
    enableSorting: false,
    enableHiding: false,
  },
];
