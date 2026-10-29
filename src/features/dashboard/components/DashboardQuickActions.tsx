import { useState } from "react";

import { Link } from "@tanstack/react-router";
import { Landmark, Plus, Receipt, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { manageOrList } from "@/constants/sidebarLinks";
import { PurchaseCreateDialog } from "@/features/purchase/components/PurchaseCreateDialog";
import { SaleCreateDialog } from "@/features/sale/components/SaleCreateDialog";
import { usePermissionCheck } from "@/hooks/use-permission-check";

export function DashboardQuickActions() {
  const [saleCreateDialog, setSaleCreateDialog] = useState(false);
  const [purchaseCreateDialog, setPurchaseCreateDialog] = useState(false);

  const canCreateSale = usePermissionCheck([
    { level: "system", resource: "sale", action: "manage" },
    { level: "system", resource: "sale", action: "create" },
  ]);
  const canCreatePurchase = usePermissionCheck([
    { level: "system", resource: "purchase", action: "manage" },
    { level: "system", resource: "purchase", action: "create" },
  ]);
  const canOpenSales = usePermissionCheck(manageOrList("sale"));
  const canOpenPurchases = usePermissionCheck(manageOrList("purchase"));
  const canOpenSaleClosings = usePermissionCheck(manageOrList("sale_closing"));

  if (
    !canCreateSale &&
    !canCreatePurchase &&
    !canOpenSales &&
    !canOpenPurchases &&
    !canOpenSaleClosings
  ) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {canCreateSale && (
        <>
          <Button onClick={() => setSaleCreateDialog(true)}>
            <Plus aria-hidden />
            <span>New sale</span>
          </Button>
          <SaleCreateDialog
            open={saleCreateDialog}
            setOpen={setSaleCreateDialog}
          />
        </>
      )}
      {canOpenSales && (
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link to="/dashboard/sales" />}
        >
          <Receipt aria-hidden />
          <span>All sales</span>
        </Button>
      )}
      {canCreatePurchase && (
        <>
          <Button onClick={() => setPurchaseCreateDialog(true)}>
            <ShoppingCart aria-hidden />
            <span>New Purchase</span>
          </Button>
          <PurchaseCreateDialog
            open={purchaseCreateDialog}
            setOpen={setPurchaseCreateDialog}
          />
        </>
      )}
      {canOpenPurchases && (
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link to="/dashboard/companies/purchases" />}
        >
          <Receipt aria-hidden />
          <span>All purchases</span>
        </Button>
      )}
      {canOpenSaleClosings && (
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link to="/dashboard/sale-closings" />}
        >
          <Landmark aria-hidden />
          <span>Daily sale</span>
        </Button>
      )}
    </div>
  );
}
