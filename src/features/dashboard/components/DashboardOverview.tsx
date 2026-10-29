import { manageOrList } from "@/constants/sidebarLinks";
import { usePermissionCheck } from "@/hooks/use-permission-check";

import { DailySaleSummary } from "./DailySaleSummary";
import { PurchaseKpi, SalesKpis } from "./DashboardKpis";
import { DashboardQuickActions } from "./DashboardQuickActions";
import { PaymentsSummary } from "./PaymentsSummary";
import { SalesTrendChart } from "./SalesTrendChart";

interface DashboardOverviewProps {
  startTime?: string | null;
  endTime?: string | null;
}

function manageOrRead(
  resource: "purchase" | "customer_payment" | "company_payment"
) {
  return [
    { level: "system" as const, resource, action: "manage" as const },
    { level: "system" as const, resource, action: "read" as const },
  ];
}

export function DashboardOverview({
  startTime,
  endTime,
}: DashboardOverviewProps) {
  const canViewSales = usePermissionCheck(manageOrList("sale"));
  const canViewSaleClosings = usePermissionCheck(manageOrList("sale_closing"));
  const canViewPurchases = usePermissionCheck(manageOrRead("purchase"));
  const canViewCustomerPayments = usePermissionCheck(
    manageOrRead("customer_payment")
  );
  const canViewCompanyPayments = usePermissionCheck(
    manageOrRead("company_payment")
  );

  const hasAnyFigure =
    canViewSales ||
    canViewSaleClosings ||
    canViewPurchases ||
    canViewCustomerPayments ||
    canViewCompanyPayments;

  return (
    <div className="space-y-6">
      <DashboardQuickActions />

      {!hasAnyFigure && (
        <p className="text-sm text-muted-foreground">
          Your role does not have access to any dashboard figures yet.
        </p>
      )}

      {(canViewSales || canViewPurchases) && (
        <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
          {canViewSales && (
            <SalesKpis startTime={startTime} endTime={endTime} />
          )}
          {canViewPurchases && (
            <PurchaseKpi startTime={startTime} endTime={endTime} />
          )}
        </div>
      )}

      {(canViewSales || canViewSaleClosings) && (
        <div className="grid gap-6 xl:grid-cols-3">
          {canViewSales && (
            <div className="xl:col-span-2">
              <SalesTrendChart startTime={startTime} endTime={endTime} />
            </div>
          )}
          {canViewSaleClosings && (
            <DailySaleSummary startTime={startTime} endTime={endTime} />
          )}
        </div>
      )}

      {(canViewCustomerPayments || canViewCompanyPayments) && (
        <PaymentsSummary
          startTime={startTime}
          endTime={endTime}
          showCustomers={canViewCustomerPayments}
          showCompanies={canViewCompanyPayments}
        />
      )}
    </div>
  );
}
