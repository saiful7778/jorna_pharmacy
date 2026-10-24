import {
  createCustomerProcedure,
  customerDetailsProcedure,
  customerImpl,
  listCustomerForSearchProcedure,
  listCustomerProcedure,
  updateCustomerProcedure,
} from "./customer.procedure";
import {
  customerPaymentStatsProcedure,
  createCustomerPaymentProcedure,
  listCustomerPaymentsProcedure,
} from "./customerPayment.procedure";

export const customerRouter = customerImpl.router({
  list: listCustomerProcedure,
  listForSearch: listCustomerForSearchProcedure,
  create: createCustomerProcedure,
  update: updateCustomerProcedure,
  details: customerDetailsProcedure,
  payment: {
    list: listCustomerPaymentsProcedure,
    create: createCustomerPaymentProcedure,
    stats: customerPaymentStatsProcedure,
  },
});
