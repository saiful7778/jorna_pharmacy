import {
  companyCreateProcedure,
  companyDetailsProcedure,
  companyImpl,
  listCompanyForSearchProcedure,
  listCompanyProcedure,
  updateCompanyProcedure,
} from "./company.procedure";
import {
  deleteAllCompanyProcedure,
  deleteCompanyProcedure,
  listCompanyBinProcedure,
  removeAllCompanyProcedure,
  removeCompanyProcedure,
  restoreAllCompanyProcedure,
  restoreCompanyProcedure,
} from "./companyDelete.procedure";
import {
  companyPaymentStatsProcedure,
  createCompanyPaymentProcedure,
  listCompanyPaymentsProcedure,
} from "./companyPayment.procedure";

export const companyRouter = companyImpl.router({
  list: listCompanyProcedure,
  listBin: listCompanyBinProcedure,
  listForSearch: listCompanyForSearchProcedure,
  create: companyCreateProcedure,
  update: updateCompanyProcedure,
  delete: deleteCompanyProcedure,
  deleteAll: deleteAllCompanyProcedure,
  restore: restoreCompanyProcedure,
  restoreAll: restoreAllCompanyProcedure,
  remove: removeCompanyProcedure,
  removeAll: removeAllCompanyProcedure,
  details: companyDetailsProcedure,
  payment: {
    list: listCompanyPaymentsProcedure,
    stats: companyPaymentStatsProcedure,
    create: createCompanyPaymentProcedure,
  },
});
