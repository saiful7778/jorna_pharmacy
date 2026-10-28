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
import {
  companyPurchaseCreateProcedure,
  companyPurchaseDetailsProcedure,
  companyPurchaseStatsProcedure,
  listCompanyPurchaseProcedure,
} from "./companyPurchase.procedure";
import {
  deleteAllCompanyPurchaseProcedure,
  deleteCompanyPurchaseProcedure,
  listCompanyPurchaseBinProcedure,
  removeAllCompanyPurchaseProcedure,
  removeCompanyPurchaseProcedure,
  restoreAllCompanyPurchaseProcedure,
  restoreCompanyPurchaseProcedure,
} from "./companyPurchaseDelete.procedure";

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
  purchase: {
    list: listCompanyPurchaseProcedure,
    listBin: listCompanyPurchaseBinProcedure,
    stats: companyPurchaseStatsProcedure,
    create: companyPurchaseCreateProcedure,
    details: companyPurchaseDetailsProcedure,
    delete: deleteCompanyPurchaseProcedure,
    deleteAll: deleteAllCompanyPurchaseProcedure,
    restore: restoreCompanyPurchaseProcedure,
    restoreAll: restoreAllCompanyPurchaseProcedure,
    remove: removeCompanyPurchaseProcedure,
    removeAll: removeAllCompanyPurchaseProcedure,
  },
});
