import { z } from "zod";

export function withoutDefaults<S extends z.ZodObject>(schema: S): S {
  const shape: Record<string, z.ZodType> = {};
  for (const [key, field] of Object.entries(schema.shape)) {
    shape[key] = field instanceof z.ZodDefault ? (field.unwrap() as z.ZodType) : (field as z.ZodType);
  }
  return schema.extend(shape) as unknown as S;
}
