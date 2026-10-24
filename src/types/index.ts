import type { LinkProps } from "@tanstack/react-router";

import type {
  ActionTypeEnumType,
  PermissionLevelEnumType,
  ResourceTypeEnumType,
  RoleEnumType,
} from "@/db/schemas/enums/zod-db-enums";

export type RoutePathType = NonNullable<LinkProps["to"]>;

export type NODE_ENV_TYPE = "development" | "test" | "production";

export type RoleType = {
  roleName: RoleEnumType;
};

export type PermissionType = {
  level: PermissionLevelEnumType;
  resource: ResourceTypeEnumType;
  action: ActionTypeEnumType;
};

export type BreadcrumbRouteType = {
  title: string;
  path: RoutePathType;
  children?: BreadcrumbRouteType[];
};

export type SidebarMenuLinkType = {
  title: string;
  path: RoutePathType;
  pathRegex: RegExp;
  icon?: React.ReactNode | undefined;
  items?: Array<SidebarMenuLinkType> | undefined;
  permissions?: Array<PermissionType>;
};

export type SidebarGroupMenuLinkType = {
  groupName?: string;
  items: Array<SidebarMenuLinkType>;
};

export interface FieldError<TFieldNames> {
  fieldName: TFieldNames;
  message: string;
}

export interface IApiHookInput<TFieldNames = string> {
  onRequestStart?: () => void;
  onRequestEnd?: () => void;
  onSuccess?: (message: string) => void;
  onError?: (errorMessage: string) => void;
  onValidationErrors?: (fields: Array<FieldError<TFieldNames>>) => void;
}
