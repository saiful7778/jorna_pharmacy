import { FormatDateCell } from "@/components/FormatDateCell";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { ColumnType } from "@/types/data-table";
import { formatCurrency } from "@/utils/formatCurrency";

import type { ListSaleClosingContractType } from "../../api/saleClosing.contract";
import { SaleClosingTableRowAction } from "./SaleClosingTableRowAction";

type SaleClosingTableRowDataType =
  ListSaleClosingContractType["output"]["data"]["data"][number];

const numericHeaderClassName = "justify-end";
const numericCellClassName = "text-right tabular-nums";

export const saleClosingTableColumn: ColumnType<SaleClosingTableRowDataType> = [
  {
    id: "periodEnd",
    accessorKey: "periodEnd",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Date" />
    ),
    cell: ({ getValue }) => (
      <div>
        <FormatDateCell
          format="dd MMM, yyyy"
          value={getValue<SaleClosingTableRowDataType["periodEnd"]>()}
          className="font-medium"
        />
      </div>
    ),
    meta: { label: "Date" },
    enableSorting: false,
  },
  {
    id: "totalSales",
    accessorKey: "totalSales",
    header: ({ column }) => (
      <DataTableColumnHeader
        className={numericHeaderClassName}
        column={column}
        label="Total Sales"
      />
    ),
    cell: ({ getValue }) => (
      <div className={numericCellClassName}>
        {formatCurrency(getValue<SaleClosingTableRowDataType["totalSales"]>())}
      </div>
    ),
    meta: { label: "Total Sales", variant: "number" },
  },
  {
    id: "totalSalary",
    accessorKey: "totalSalary",
    header: ({ column }) => (
      <DataTableColumnHeader
        className={numericHeaderClassName}
        column={column}
        label="Salary"
      />
    ),
    cell: ({ getValue }) => (
      <div className={numericCellClassName}>
        {formatCurrency(getValue<SaleClosingTableRowDataType["totalSalary"]>())}
      </div>
    ),
    meta: { label: "Salary", variant: "number" },
    enableSorting: false,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <SaleClosingTableRowAction saleClosingId={row.original.id} />
    ),
    enableSorting: false,
    enableHiding: false,
  },
];
