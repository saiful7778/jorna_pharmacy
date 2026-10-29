import { createFileRoute } from "@tanstack/react-router";
import { endOfDay, startOfDay } from "date-fns";
import z from "zod";

import { DashboardShell } from "@/components/shared/dashboard-shell";
import {
  DashboardShellDescription,
  DashboardShellHeader,
  DashboardShellHeaderActive,
  DashboardShellTitle,
} from "@/components/shared/dashboard-shell/DashboardShellHeader";
import { TimeRangeFilter } from "@/components/time-range-filter";
import { DashboardOverview } from "@/features/dashboard/components/DashboardOverview";
import { useSearchFilter } from "@/hooks/use-search-filter";
import { head } from "@/lib/head";
import { rangeFilterSchema } from "@/lib/querySearchSchema";
import { RangeSearchEnumSchema } from "@/lib/zod-schemas/baseZodSchema";

export const Route = createFileRoute("/dashboard/_dashboardLayout/")({
  validateSearch: rangeFilterSchema.extend({
    range: RangeSearchEnumSchema.optional().default("TODAY"),
    startTime: z.iso
      .datetime()
      .optional()
      .default(() => startOfDay(new Date()).toISOString()),
    endTime: z.iso
      .datetime()
      .optional()
      .default(() => endOfDay(new Date()).toISOString()),
  }),
  head: ({ match }) =>
    head({
      pathname: match.pathname,
      titleByTemplate: "Dashboard",
      description: "Manage your dashboard",
    }),
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = Route.useRouteContext();
  const { range, startTime, endTime } = Route.useSearch();
  const { setFilters } = useSearchFilter("/dashboard/_dashboardLayout/");

  return (
    <DashboardShell
      header={
        <DashboardShellHeader>
          <DashboardShellTitle>{`Welcome back, ${user.name}`}</DashboardShellTitle>
          <DashboardShellDescription>
            Manage your world and flex your power
          </DashboardShellDescription>
          <DashboardShellHeaderActive>
            <TimeRangeFilter
              rangeSearch={{ range, startTime, endTime }}
              setRangeSearch={(updated) =>
                setFilters({
                  range: updated.range,
                  startTime: updated.startTime,
                  endTime: updated.endTime,
                })
              }
            />
          </DashboardShellHeaderActive>
        </DashboardShellHeader>
      }
    >
      <DashboardOverview startTime={startTime} endTime={endTime} />
    </DashboardShell>
  );
}
