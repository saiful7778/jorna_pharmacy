import { formatDateWithTimezone } from "@/utils/formatDate";
import { useAuthStore } from "@/zustand/auth/AuthStoreContext";

interface FormatDateCellBaseProps {
  value: Date | string | number;
  format: string;
  options?: Parameters<typeof formatDateWithTimezone>[3];
}

type FormatDateCellProps = FormatDateCellBaseProps &
  Omit<React.ComponentPropsWithoutRef<"time">, keyof FormatDateCellBaseProps>;

export function FormatDateCell({
  value,
  format,
  options,
  ...props
}: FormatDateCellProps) {
  const user = useAuthStore((state) => state.user);

  const normalizedDate = value instanceof Date ? value : new Date(value);

  return (
    <time dateTime={normalizedDate.toISOString()} {...props}>
      {formatDateWithTimezone(normalizedDate, format, user.timezone, options)}
    </time>
  );
}
