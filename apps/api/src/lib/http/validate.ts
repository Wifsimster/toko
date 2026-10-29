import type { Context } from "hono";
import type { z } from "zod";

export class ValidationError extends Error {
  readonly status = 422 as const;
  readonly code = "VALIDATION" as const;

  constructor(
    readonly details: z.typeToFlattenedError<unknown, string>,
    message = "Données invalides",
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

export async function parseBody<S extends z.ZodTypeAny>(
  c: Context,
  schema: S,
  message?: string,
): Promise<z.infer<S>> {
  const body = await c.req.json().catch(() => ({}));
  return parseValue(schema, body, message);
}

export function parseQuery<S extends z.ZodTypeAny>(
  c: Context,
  schema: S,
): z.infer<S> {
  return parseValue(schema, c.req.query());
}

export function parseValue<S extends z.ZodTypeAny>(
  schema: S,
  value: unknown,
  message?: string,
): z.infer<S> {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.flatten() as z.typeToFlattenedError<unknown, string>,
      message,
    );
  }
  return parsed.data;
}

export async function readJsonBody(c: Context): Promise<Record<string, unknown>> {
  const body = await c.req.json().catch(() => ({}));
  return body && typeof body === "object" ? (body as Record<string, unknown>) : {};
}
