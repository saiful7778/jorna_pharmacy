import {
  Banknote,
  Contact,
  House,
  Settings,
  ShieldUser,
  User,
  UsersRound,
} from "lucide-react";

import type {
  PermissionType,
  RoutePathType,
  SidebarGroupMenuLinkType,
  SidebarMenuLinkType,
} from "@/types";

function manageOrList(
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
    groupName: "Sales",
    items: [
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
