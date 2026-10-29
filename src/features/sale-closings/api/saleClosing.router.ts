import {
  listSaleClosingProcedure,
  saleClosingCreateProcedure,
  saleClosingDetailsProcedure,
  saleClosingImpl,
  saleClosingStatsProcedure,
} from "./saleClosing.procedure";

export const saleClosingRouter = saleClosingImpl.router({
  list: listSaleClosingProcedure,
  create: saleClosingCreateProcedure,
  stats: saleClosingStatsProcedure,
  details: saleClosingDetailsProcedure,
});
