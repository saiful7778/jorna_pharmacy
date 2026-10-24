import { oc } from "@orpc/contract";
import z from "zod";

import { API_MESSAGES } from "@/constants/apiMessage";

export const baseContract = oc.errors({
  UNAUTHORIZED: {
    status: 401,
    success: false,
    message: API_MESSAGES.GENERAL.UNAUTHORIZED,
  },
  FORBIDDEN: {
    status: 403,
    success: false,
    message: API_MESSAGES.GENERAL.FORBIDDEN,
  },
  BAD_REQUEST: {
    status: 400,
    success: false,
    message: API_MESSAGES.GENERAL.BAD_REQUEST,
  },
  TOO_MANY_REQUESTS: {
    status: 429,
    success: false,
    message: API_MESSAGES.GENERAL.TOO_MANY_REQUESTS,
  },
  INPUT_VALIDATION_FAILED: {
    status: 422,
    success: false,
    message: API_MESSAGES.GENERAL.INPUT_VALIDATION_FAILED,
    data: z.object({
      formErrors: z.array(z.string()),
      fieldErrors: z.record(z.string(), z.array(z.string()).optional()),
    }),
  },
});
