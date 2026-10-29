export type SaleClosingCashInput = {
  openingCash: number | null;
  cashReceived: number;
  totalExpenses: number;
  totalSalary: number;
  companyPaid: number | null;
};

export type CashVarianceStatus = "not_counted" | "balanced" | "over" | "short";

export function calculateExpectedCash(closing: SaleClosingCashInput): number {
  return (
    (closing.openingCash ?? 0) +
    closing.cashReceived -
    closing.totalExpenses -
    closing.totalSalary -
    (closing.companyPaid ?? 0)
  );
}
