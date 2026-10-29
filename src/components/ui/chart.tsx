import * as React from "react";

import { cn } from "cn";
import * as RechartsPrimitive from "recharts";

const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    color?: string;
    theme?: Record<keyof typeof THEMES, string>;
  };
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.use(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"];
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-surface]:outline-hidden",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext>
  );
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const colorConfig = Object.entries(config).filter(
    ([, itemConfig]) => itemConfig.theme || itemConfig.color
  );

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      // Theme CSS is built from the developer-defined chart config, never from user input.
      // eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  );
}

const ChartTooltip = RechartsPrimitive.Tooltip;

type TooltipPayloadItem = {
  dataKey?: string | number;
  name?: string;
  value?: number | string;
  color?: string;
  payload?: Record<string, unknown>;
};

function ChartTooltipContent({
  active,
  payload,
  label,
  labelFormatter,
  valueFormatter,
  className,
}: {
  active?: boolean;
  payload?: ReadonlyArray<TooltipPayloadItem>;
  label?: unknown;
  labelFormatter?: (label: unknown) => React.ReactNode;
  valueFormatter?: (value: number) => string;
  className?: string;
}) {
  const { config } = useChart();

  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div
      className={cn(
        "grid min-w-36 items-start gap-1.5 rounded-lg border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-xl",
        className
      )}
    >
      {label != null && (
        <div className="font-medium">
          {labelFormatter ? labelFormatter(label) : String(label)}
        </div>
      )}
      <div className="grid gap-1.5">
        {payload.map((item) => {
          const key = String(item.dataKey ?? item.name ?? "value");
          const itemConfig = config[key];
          const value =
            typeof item.value === "number" && valueFormatter
              ? valueFormatter(item.value)
              : String(item.value ?? "");

          return (
            <div key={key} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span
                  aria-hidden
                  className="size-2.5 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: item.color }}
                />
                <span>{itemConfig?.label ?? item.name}</span>
              </div>
              <span className="font-mono font-medium text-foreground tabular-nums">
                {value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const ChartLegend = RechartsPrimitive.Legend;

function ChartLegendContent({
  className,
  payload,
}: {
  className?: string;
  payload?: ReadonlyArray<{ dataKey?: string | number; color?: string }>;
}) {
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-4",
        className
      )}
    >
      {payload.map((item) => {
        const key = String(item.dataKey ?? "value");
        const itemConfig = config[key];

        return (
          <div key={key} className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="size-2.5 shrink-0 rounded-[2px]"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-muted-foreground">{itemConfig?.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};
