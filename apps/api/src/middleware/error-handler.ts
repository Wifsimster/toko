import type { ErrorHandler } from "hono";
import { log } from "../lib/safe-logger";

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
  log.error("request_error", err);

  if (err instanceof AppError) {
    return c.json({ error: err.message, code: err.code }, err.status as any);
  }

  return c.json({ error: "Internal server error", code: "INTERNAL" }, 500);
};
