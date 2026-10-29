import { Hono } from "hono";
import { inArray } from "drizzle-orm";
import { createHash } from "node:crypto";
import type { AppEnv } from "../types";
import { authMiddleware } from "../middleware/auth";
import { db, featureFlags } from "@focusflow/db";
import {
  DEFAULT_FLAGS,
  FEATURE_FLAG_KEYS,
  type FeatureFlagKey,
  type Variant,
} from "@focusflow/validators";

export const featureFlagsRoutes = new Hono<AppEnv>();

featureFlagsRoutes.use("*", authMiddleware);

type ResolvedFlag = {
  value: unknown;
  variant: unknown;
};

export function bucketFor(
  userId: string,
  flagKey: string,
  variants: Variant[],
): unknown {
  const total = variants.reduce((sum, v) => sum + v.weight, 0);
  if (total <= 0) return variants[0]?.value;
  const hash = createHash("sha256").update(`${userId}:${flagKey}`).digest();
  const bucket = hash.readUInt32BE(0) % total;
  let cursor = 0;
  for (const v of variants) {
    cursor += v.weight;
    if (bucket < cursor) return v.value;
  }
  return variants[variants.length - 1]?.value;
}

function resolveFlag(
  key: FeatureFlagKey,
  userId: string,
  row:
    | {
        value: unknown;
        variants: Variant[] | null;
        enabled: boolean;
      }
    | undefined,
): ResolvedFlag {
  const source: {
    value: unknown;
    variants: Variant[] | null;
    enabled: boolean;
  } = row ?? {
    value: DEFAULT_FLAGS[key].value,
    variants: DEFAULT_FLAGS[key].variants ?? null,
    enabled: true,
  };

  if (!source.enabled || !source.variants || source.variants.length === 0) {
    return { value: source.value, variant: source.value };
  }
  const variant = bucketFor(userId, key, source.variants);
  return { value: source.value, variant };
}

featureFlagsRoutes.get("/", async (c) => {
  const me = c.get("user");

  const keys = [...FEATURE_FLAG_KEYS];
  const rows = await db
    .select()
    .from(featureFlags)
    .where(inArray(featureFlags.key, keys));

  const byKey = new Map<string, (typeof rows)[number]>();
  for (const row of rows) byKey.set(row.key, row);

  const resolved: Record<string, unknown> = {};
  for (const key of FEATURE_FLAG_KEYS) {
    const row = byKey.get(key);
    const r = resolveFlag(
      key,
      me.id,
      row
        ? {
            value: row.value,
            variants: row.variants as Variant[] | null,
            enabled: row.enabled,
          }
        : undefined,
    );
    resolved[key] = r.variant;
  }

  return c.json(resolved);
});
