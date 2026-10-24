import { roleRouter } from "@/features/role/api/role.router";
import { userRouter } from "@/features/user/api/user.router";

export const router = {
  user: userRouter,
  role: roleRouter,
};
