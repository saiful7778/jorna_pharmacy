import {
  Banknote,
  BuildingComplex,
  Contact,
  House,
  Landmark,
  Receipt,
  Settings,
  ShieldUser,
  ShoppingCart,
  User,
  UsersRound,
} from "lucide-react";

import type {
  PermissionType,
  RoutePathType,
  SidebarGroupMenuLinkType,
  SidebarMenuLinkType,
} from "@/types";

export function manageOrList(
  resource: PermissionType["resource"]
): Array<PermissionType> {
  return [
    { level: "system", resource, action: "manage" },
    { level: "system", resource, action: "list" },
  ];
}

export const sidebarMenuLinks: Array<SidebarGroupMenuLinkType> = [
  {
    groupName: "Overview",
    items: [
      {
        title: "Dashboard",
        path: "/dashboard",
        pathRegex: /^\/dashboard\/?$/,
        icon: <House />,
      },
    ],
  },
  {
    groupName: "Finance",
    items: [
      {
        title: "Daily Sale",
        path: "/dashboard/sale-closings",
        pathRegex: /^\/dashboard\/sale-closings\/?$/,
        permissions: manageOrList("sale_closing"),
        icon: <Landmark />,
      },
    ],
  },
  {
    groupName: "Sales",
    items: [
      {
        title: "Sales",
        path: "/dashboard/sales",
        pathRegex: /^\/dashboard\/sales\/?$/,
        permissions: manageOrList("sale"),
        icon: <Receipt />,
      },
      {
        title: "Customers",
        path: "/dashboard/customers",
        pathRegex: /^\/dashboard\/customers$/,
        permissions: manageOrList("customer"),
        icon: <Contact />,
      },
      {
        title: "Customer Payments",
        path: "/dashboard/customers/payments",
        pathRegex: /^\/dashboard\/customers\/payments$/,
        permissions: manageOrList("customer_payment"),
        icon: <Banknote />,
      },
    ],
  },
  {
    groupName: "Suppliers",
    items: [
      {
        title: "Company",
        path: "/dashboard/companies",
        pathRegex: /^\/dashboard\/companies$/,
        permissions: manageOrList("company"),
        icon: <BuildingComplex />,
      },
      {
        title: "Company Payments",
        path: "/dashboard/companies/payments",
        pathRegex: /^\/dashboard\/companies\/payments$/,
        permissions: manageOrList("company_payment"),
        icon: <Banknote />,
      },
      {
        title: "Company Purchases",
        path: "/dashboard/companies/purchases",
        pathRegex: /^\/dashboard\/companies\/purchases$/,
        permissions: manageOrList("purchase"),
        icon: <ShoppingCart />,
      },
    ],
  },
  {
    groupName: "Administration",
    items: [
      {
        title: "All Users",
        path: "/dashboard/users",
        pathRegex: /^\/dashboard\/users(?:\/.*)?$/,
        permissions: manageOrList("user"),
        icon: <UsersRound />,
      },
      {
        title: "Roles & Permissions",
        path: "/dashboard/roles",
        pathRegex: /^\/dashboard\/roles\/?$/,
        permissions: manageOrList("role_permission"),
        icon: <ShieldUser />,
      },
    ],
  },
];

export const footerMenuLinks: Array<SidebarMenuLinkType> = [
  {
    title: "My Profile",
    icon: <User />,
    path: "/dashboard/profile",
    pathRegex: /^\/dashboard\/profile$/,
  },
  {
    title: "Settings",
    icon: <Settings />,
    path: "/dashboard/settings",
    pathRegex: /^\/dashboard\/settings$/,
  },
];

export const settingsMenuLinks: Array<{ title: string; path: RoutePathType }> =
  [
    {
      title: "Profile",
      path: "/dashboard/settings/profile",
    },
    {
      title: "Update Password",
      path: "/dashboard/settings/update-password",
    },
    {
      title: "Sessions",
      path: "/dashboard/settings/sessions",
    },
    {
      title: "Connected Apps",
      path: "/dashboard/settings/connected-apps",
    },
  ];
