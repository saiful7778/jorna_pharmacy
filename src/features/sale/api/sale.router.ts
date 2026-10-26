import {
  listSaleProcedure,
  saleCreateProcedure,
  saleImpl,
  saleStatsProcedure,
} from "./sale.procedure";

export const saleRouter = saleImpl.router({
  list: listSaleProcedure,
  stats: saleStatsProcedure,
  create: saleCreateProcedure,
});
