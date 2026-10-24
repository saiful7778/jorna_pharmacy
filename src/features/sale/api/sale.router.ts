import {
  listSaleProcedure,
  saleImpl,
  saleStatsProcedure,
} from "./sale.procedure";

export const saleRouter = saleImpl.router({
  list: listSaleProcedure,
  stats: saleStatsProcedure,
});
