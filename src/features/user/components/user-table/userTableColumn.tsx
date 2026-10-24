import { format } from "date-fns";

import { UserAvatar } from "@/components/UserAvatar";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import type { ColumnType } from "@/types/data-table";
import { formatEnumValue } from "@/utils/formatEnum";

import type { ListUserContractType } from "../../api/user.contract";
import { UserTableRowAction } from "./UserTableRowAction";
import { UserBannedCell } from "./cells/UserBannedCell";

type UserTableRowDataType =
  ListUserContractType["output"]["data"]["data"][number];

export const userTableColumn: ColumnType<UserTableRowDataType> = [
  {
    id: "name",
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Full name" />
    ),
    cell: ({ row, getValue }) => (
      <UserAvatar
        userEmail={row.original.email}
        imageUrl={row.original.image}
        userName={getValue<UserTableRowDataType["name"]>()}
        showDetails
      />
    ),
    meta: { label: "Full name" },
    enableHiding: false,
  },
  {
    id: "roleName",
    accessorKey: "roles",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Roles" />
    ),
    cell: ({ getValue }) => {
      const roles = getValue<UserTableRowDataType["roles"]>();
      return (
        <div className="flex flex-wrap items-center gap-2">
          {roles.map(({ id, roleName }) => (
            <Badge key={id} variant="secondary">
              {formatEnumValue(roleName)}
            </Badge>
          ))}
        </div>
      );
    },
    meta: {
      label: "Roles",
    },
    enableColumnFilter: false,
    enableSorting: false,
  },
  {
    id: "banned",
    accessorKey: "banned",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Banned" />
    ),
    cell: ({ getValue, row }) => (
      <UserBannedCell
        banned={getValue<UserTableRowDataType["banned"]>() || false}
        banReason={row.original.banReason}
        banExpires={row.original.banExpires}
      />
    ),
    meta: { label: "Banned" },
    enableSorting: false,
  },
  {
    accessorKey: "emailVerified",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Email Verified" />
    ),
    cell: ({ getValue }) => {
      const emailVerified = getValue<UserTableRowDataType["emailVerified"]>();
      return (
        <Badge variant={emailVerified ? "default" : "secondary"}>
          {emailVerified ? "Verified" : "Not verified"}
        </Badge>
      );
    },
    meta: { label: "Email Verified" },
    enableSorting: false,
  },
  {
    accessorKey: "lastLogin",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Last Login" />
    ),
    cell: ({ getValue }) => {
      const lastLogin = getValue<UserTableRowDataType["lastLogin"]>();
      return lastLogin ? (
        <Badge variant="secondary">
          {format(new Date(lastLogin), "dd MMM, yyyy hh:mm aa")}
        </Badge>
      ) : null;
    },
    enableSorting: false,
    meta: { label: "Last Login" },
  },
  {
    id: "actions",
    cell: ({ row }) => <UserTableRowAction userData={row.original} />,
    enableSorting: false,
    enableHiding: false,
  },
];
