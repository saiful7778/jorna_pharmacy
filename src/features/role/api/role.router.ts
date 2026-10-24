import { listRoleProcedure, roleImpl } from "./role.procedure";

export const roleRouter = roleImpl.router({
  listRole: listRoleProcedure,
});
