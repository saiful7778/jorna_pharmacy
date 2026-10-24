import {
  Stat,
  StatIndicator,
  StatLabel,
  StatTrend,
  StatValue,
} from "./ui/stat";

export function SummaryStat({
  label,
  value,
  icon,
  color,
  trend,
  trendDirection,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: "info" | "success" | "error";
  trend: string;
  trendDirection: "up" | "down" | "neutral";
}) {
  return (
    <Stat>
      <StatLabel>{label}</StatLabel>
      <StatIndicator variant="icon" color={color}>
        {icon}
      </StatIndicator>
      <StatValue>{value}</StatValue>
      <StatTrend trend={trendDirection}>{trend}</StatTrend>
    </Stat>
  );
}
