import type { ErrorHandler } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { log } from "../lib/safe-logger";
import { ValidationError } from "../lib/http/validate";

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 500
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const errorHandler: ErrorHandler = (err, c) => {
  // A rejected payload is an expected outcome, not a server fault — logging
  // it at error level buried real failures in the noise.
  if (err instanceof ValidationError) {
    return c.json(
      { error: err.message, code: err.code, details: err.details },
      err.status,
    );
  }

  log.error("request_error", err);

  if (err instanceof AppError) {
    return c.json(
      { error: err.message, code: err.code },
      err.status as ContentfulStatusCode,
    );
  }

  return c.json({ error: "Internal server error", code: "INTERNAL" }, 500);
};
