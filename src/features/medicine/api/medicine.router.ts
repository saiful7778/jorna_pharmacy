import {
  listMedicineForSearchProcedure,
  medicineImpl,
} from "./medicine.procedure";

export const medicineRouter = medicineImpl.router({
  listForSearch: listMedicineForSearchProcedure,
});
