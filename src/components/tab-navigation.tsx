import type { ComponentProps } from "react";

import type { RegisteredRouter, RouteIds } from "@tanstack/react-router";
import { getRouteApi } from "@tanstack/react-router";
import { cn } from "cn";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

type RouteTree = RegisteredRouter["routeTree"];
type RouteId = Exclude<RouteIds<RouteTree>, "__root__">;

type SearchNavigate = (options: {
  search: (prev: Record<string, unknown>) => Record<string, unknown>;
  resetScroll?: boolean;
}) => Promise<void>;

interface TabNavigationProps<TId extends RouteId> {
  paramName?: string;
  routeId: TId;
  defaultTab: string;
  children: React.ReactNode;
}

/**
 * URL-driven tabs powered by TanStack Router search params.
 *
 * The active tab is read from and written to a single search param so that
 * the tab state is bookmarkable, shareable, and survives full-page refreshes.
 * When the active tab equals `defaultTab` the param is omitted from the URL
 * to keep links clean.
 *
 * @example
 * ```tsx
 * <TabNavigation paramName="tab" defaultTab="overview">
 *   <TabNavigationList>
 *     <TabNavigationTrigger value="overview">Overview</TabNavigationTrigger>
 *     <TabNavigationTrigger value="settings">Settings</TabNavigationTrigger>
 *   </TabNavigationList>
 *   <TabNavigationContent value="overview">…</TabNavigationContent>
 *   <TabNavigationContent value="settings">…</TabNavigationContent>
 * </TabNavigation>
 * ```
 */
export function TabNavigation<const TId extends RouteId>({
  paramName = "tab",
  defaultTab,
  children,
  routeId,
}: TabNavigationProps<TId>) {
  const route = getRouteApi(routeId);
  const search = route.useSearch() as unknown as Record<string, string>;
  const navigate = route.useNavigate() as unknown as SearchNavigate;

  const value = String(search[paramName] ?? defaultTab);

  const handleTabChange = (next: string) => {
    navigate({
      search: (prev) => {
        const prevSearch = prev;

        return { ...prevSearch, [paramName]: next };
      },
      resetScroll: true,
    });
  };

  return (
    <Tabs value={value} onValueChange={handleTabChange}>
      {children}
    </Tabs>
  );
}

export function TabNavigationList({
  className,
  variant = "default",
  ...props
}: ComponentProps<typeof TabsList>) {
  return (
    <div
      data-variant={variant}
      className="group-data-horizontal/tabs:overflow-x-auto group-data-horizontal/tabs:overflow-y-hidden group-data-horizontal/tabs:data-[variant=line]:border-b group-data-vertical/tabs:data-[variant=line]:border-r"
    >
      <TabsList
        variant={variant}
        className={cn("data-[variant=line]:p-0", className)}
        {...props}
      />
    </div>
  );
}

export function TabNavigationTrigger({
  className,
  ...props
}: ComponentProps<typeof TabsTrigger>) {
  return (
    <TabsTrigger
      className={cn(
        "cursor-pointer text-sm group-data-horizontal/tabs:group-data-[variant=line]/tabs-list:rounded-b-none group-data-vertical/tabs:group-data-[variant=line]/tabs-list:rounded-r-none group-data-[variant=line]/tabs-list:after:bottom-0 group-data-vertical/tabs:group-data-[variant=line]/tabs-list:after:right-0! group-data-[variant=line]/tabs-list:data-active:bg-muted!",
        className
      )}
      {...props}
    />
  );
}

export function TabNavigationContent(
  props: ComponentProps<typeof TabsContent>
) {
  return <TabsContent {...props} />;
}
