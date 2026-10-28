import {
  listPurchaseProcedure,
  purchaseCreateProcedure,
  purchaseDetailsProcedure,
  purchaseImpl,
  purchaseStatsProcedure,
} from "./purchase.procedure";
import {
  deleteAllPurchaseProcedure,
  deletePurchaseProcedure,
  listPurchaseBinProcedure,
  removeAllPurchaseProcedure,
  removePurchaseProcedure,
  restoreAllPurchaseProcedure,
  restorePurchaseProcedure,
} from "./purchaseDelete.procedure";

export const purchaseRouter = purchaseImpl.router({
  list: listPurchaseProcedure,
  listBin: listPurchaseBinProcedure,
  stats: purchaseStatsProcedure,
  create: purchaseCreateProcedure,
  details: purchaseDetailsProcedure,
  delete: deletePurchaseProcedure,
  deleteAll: deleteAllPurchaseProcedure,
  restore: restorePurchaseProcedure,
  restoreAll: restoreAllPurchaseProcedure,
  remove: removePurchaseProcedure,
  removeAll: removeAllPurchaseProcedure,
});
