import { companyRouter } from "@/features/company/api/company.router";
import { customerRouter } from "@/features/customer/api/customer.router";
import { medicineRouter } from "@/features/medicine/api/medicine.router";
import { purchaseRouter } from "@/features/purchase/api/purchase.router";
import { roleRouter } from "@/features/role/api/role.router";
import { saleClosingRouter } from "@/features/sale-closings/api/saleClosing.router";
import { saleRouter } from "@/features/sale/api/sale.router";
import { userRouter } from "@/features/user/api/user.router";

export const router = {
  user: userRouter,
  role: roleRouter,
  customer: customerRouter,
  sale: saleRouter,
  medicine: medicineRouter,
  company: companyRouter,
  purchase: purchaseRouter,
  saleClosing: saleClosingRouter,
};
