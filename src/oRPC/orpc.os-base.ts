import { authMiddleware } from "./middleware/auth.middleware";
import { errorMiddleware } from "./middleware/error.middleware";
import { baseOs } from "./orpc.base";

const mainBaseOs = baseOs.use(errorMiddleware);

export const publicOs = mainBaseOs;

export const authBaseOs = mainBaseOs.use(authMiddleware);
