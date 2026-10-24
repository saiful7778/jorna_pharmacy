import { onError, ORPCError } from "@orpc/client";
import { ValidationError } from "@orpc/contract";
import z from "zod";

import { baseOs } from "../orpc.base";

export const errorMiddleware = baseOs.middleware(
  onError((error) => {
    if (
      error instanceof ORPCError &&
      error.code === "BAD_REQUEST" &&
      error.cause instanceof ValidationError
    ) {
      // If you only use Zod you can safely cast to ZodIssue[]
      const zodError = new z.ZodError(error.cause.issues as z.core.$ZodIssue[]);

      throw new ORPCError("INPUT_VALIDATION_FAILED", {
        status: 422,
        message: z.prettifyError(zodError),
        data: z.flattenError(zodError),
        cause: error.cause,
      });
    }

    if (
      error instanceof ORPCError &&
      error.code === "INTERNAL_SERVER_ERROR" &&
      error.cause instanceof ValidationError
    ) {
      throw new ORPCError("OUTPUT_VALIDATION_FAILED", {
        message: error.message,
        cause: error.cause,
        status: error.status,
        data: error.data,
      });
    }

    if (error instanceof ORPCError) {
      throw new ORPCError(error.code, {
        message: error.message,
        cause: error,
        status: error.status,
        data: error.data,
      });
    }

    if (error instanceof Error) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: error.message,
        cause: error,
        status: 500,
      });
    }
  })
);
