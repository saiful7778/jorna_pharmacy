import { Badge } from "@/components/ui/badge";

export function PurchaseStatusBadge({
  due,
  paidAmount,
}: {
  due: number;
  paidAmount: number;
}) {
  if (due <= 0) {
    return <Badge variant="default">Paid</Badge>;
  }
  if (paidAmount > 0) {
    return <Badge variant="secondary">Partially paid</Badge>;
  }
  return <Badge variant="destructive">Unpaid</Badge>;
}
