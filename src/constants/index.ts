import type { BreadcrumbRouteType } from "@/types";

export const APP_NAME = "Jorna Pharmacy";

export const THEME_COLOR = "#006045";
export const BACKGROUND_COLOR = "#ffffff";

export const SITE_DESCRIPTION =
  "Jorna Pharmacy's data management system for tracking sales, expenses, inventory, and reports — all in one secure web app.";

export const DEFAULT_UNAUTH_PATH = "/sign-in";
export const DEFAULT_AUTH_PATH = "/dashboard";
export const RESET_PASSWORD_PATH = "/reset-password";
export const AUTH_ERROR_PAGE = "/auth-error";

export const SUPPORTED_OAUTH_PROVIDERS = ["google"] as const;

export const breadcrumbRoutes: Array<BreadcrumbRouteType> = [
  {
    title: "Dashboard",
    path: "/dashboard",
    children: [
      {
        title: "All Users",
        path: "/dashboard/users",
      },
      {
        title: "Roles and Permissions",
        path: "/dashboard/roles",
      },
      {
        title: "Profile",
        path: "/dashboard/profile",
      },
      {
        title: "Settings",
        path: "/dashboard/settings",
        children: [
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
        ],
      },
    ],
  },
];

export const DEFAULT_PAGE_INDEX = 1;
export const DEFAULT_PAGE_SIZE = 20;

export const BIN_RETENTION_DAYS = 15;

export const BALANCE_EPSILON = 0.005;
export const DUE_EPSILON = 0.005;
