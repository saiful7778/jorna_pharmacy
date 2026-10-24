import { listSaleProcedure, saleImpl } from "./sale.procedure";

export const saleRouter = saleImpl.router({
  list: listSaleProcedure,
});
