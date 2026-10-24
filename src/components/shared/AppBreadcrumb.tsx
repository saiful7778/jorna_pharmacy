import { Fragment } from "react";

import { Link, useLocation } from "@tanstack/react-router";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { breadcrumbRoutes } from "@/constants";
import type { BreadcrumbRouteType } from "@/types";

export function findBreadcrumbs(
  routes: BreadcrumbRouteType[],
  pathname: string
): BreadcrumbRouteType[] {
  const segments = pathname.split("/").filter(Boolean);

  const result: BreadcrumbRouteType[] = [];
  let currentPath = "";

  for (const segment of segments) {
    currentPath += `/${segment}`;

    const match = findRoute(routes, currentPath);
    if (match) result.push(match);
  }

  return result;
}

function findRoute(
  routes: BreadcrumbRouteType[],
  path: string
): BreadcrumbRouteType | undefined {
  for (const route of routes) {
    if (route.path === path) return route;

    if (route.children) {
      const child = findRoute(route.children, path);
      if (child) return child;
    }
  }
}

export function AppBreadcrumb() {
  const { pathname } = useLocation();

  const breadcrumbs = findBreadcrumbs(breadcrumbRoutes, pathname);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((segment, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <Fragment key={segment.path}>
              {index > 0 && <BreadcrumbSeparator />}

              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{segment.title}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    render={<Link to={segment.path}>{segment.title}</Link>}
                  />
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
