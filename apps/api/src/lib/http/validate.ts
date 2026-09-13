import type { Context } from "hono";
import type { z } from "zod";

/**
 * Request parsing + validation, in one place.
 *
 * Before this module every handler repeated the same six lines: read the
 * body, `safeParse`, and hand-build a 422 with `{ error: "Données
 * invalides", details }`. That is a transport concern leaking into 40+
 * business handlers — each one a place the 422 contract could drift.
 *
 * `ValidationError` carries the flattened Zod issues; the central error
 * handler renders it, so handlers only ever deal with parsed data.
 */
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

/** Parse and validate a JSON body. Throws `ValidationError` on a bad shape. */
export async function parseBody<S extends z.ZodTypeAny>(
  c: Context,
  schema: S,
): Promise<z.infer<S>> {
  const body = await c.req.json().catch(() => ({}));
  return parseValue(schema, body);
}

/** Parse and validate the query string (all values are strings). */
export function parseQuery<S extends z.ZodTypeAny>(
  c: Context,
  schema: S,
): z.infer<S> {
  return parseValue(schema, c.req.query());
}

/** Validate an already-obtained value with the same 422 contract. */
export function parseValue<S extends z.ZodTypeAny>(
  schema: S,
  value: unknown,
): z.infer<S> {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.flatten() as z.typeToFlattenedError<unknown, string>,
    );
  }
  return parsed.data;
}
