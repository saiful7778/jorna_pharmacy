import {
  createCustomerProcedure,
  customerDetailsProcedure,
  customerImpl,
  listCustomerForSearchProcedure,
  listCustomerProcedure,
  updateCustomerProcedure,
} from "./customer.procedure";
import {
  deleteAllCustomerProcedure,
  deleteCustomerProcedure,
  listCustomerBinProcedure,
  removeAllCustomerProcedure,
  removeCustomerProcedure,
  restoreAllCustomerProcedure,
  restoreCustomerProcedure,
} from "./customerDelete.procedure";
import {
  customerPaymentStatsProcedure,
  createCustomerPaymentProcedure,
  listCustomerPaymentsProcedure,
} from "./customerPayment.procedure";

export const customerRouter = customerImpl.router({
  list: listCustomerProcedure,
  listBin: listCustomerBinProcedure,
  listForSearch: listCustomerForSearchProcedure,
  create: createCustomerProcedure,
  update: updateCustomerProcedure,
  delete: deleteCustomerProcedure,
  deleteAll: deleteAllCustomerProcedure,
  restore: restoreCustomerProcedure,
  restoreAll: restoreAllCustomerProcedure,
  remove: removeCustomerProcedure,
  removeAll: removeAllCustomerProcedure,
  details: customerDetailsProcedure,
  payment: {
    list: listCustomerPaymentsProcedure,
    create: createCustomerPaymentProcedure,
    stats: customerPaymentStatsProcedure,
  },
});
