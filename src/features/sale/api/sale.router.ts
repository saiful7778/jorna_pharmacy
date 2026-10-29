import {
  listSaleProcedure,
  saleCreateProcedure,
  saleDetailsProcedure,
  saleImpl,
  saleStatsProcedure,
  saleTrendProcedure,
} from "./sale.procedure";
import {
  deleteAllSaleProcedure,
  deleteSaleProcedure,
  listSaleBinProcedure,
  removeAllSaleProcedure,
  removeSaleProcedure,
  restoreAllSaleProcedure,
  restoreSaleProcedure,
} from "./saleDelete.procedure";

export const saleRouter = saleImpl.router({
  list: listSaleProcedure,
  listBin: listSaleBinProcedure,
  stats: saleStatsProcedure,
  trend: saleTrendProcedure,
  create: saleCreateProcedure,
  details: saleDetailsProcedure,
  delete: deleteSaleProcedure,
  deleteAll: deleteAllSaleProcedure,
  restore: restoreSaleProcedure,
  restoreAll: restoreAllSaleProcedure,
  remove: removeSaleProcedure,
  removeAll: removeAllSaleProcedure,
});
