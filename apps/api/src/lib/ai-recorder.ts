import { db, aiRecommendations } from "@focusflow/db";
import type { RecordRecommendation } from "@focusflow/validators";

// Business rule A11: AI server payloads must not contain a prénom.
// Sanitizer that strips/redacts known PII keys before persistence and
// before any LLM call, regardless of where the input came from.
const FORBIDDEN_KEYS = new Set([
  "name",
  "firstName",
  "lastName",
  "email",
  "address",
  "phone",
]);

function sanitize(value: unknown, depth = 0): unknown {
  if (depth > 6) return "[truncated]";
  if (value == null) return value;
  if (Array.isArray(value)) return value.map((v) => sanitize(v, depth + 1));
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (FORBIDDEN_KEYS.has(k)) continue;
      out[k] = sanitize(v, depth + 1);
    }
    return out;
  }
  return value;
}

// Persist a recommendation. The caller is expected to pass already-sanitized
// inputs, but this layer is the safety net: anything mistakenly added is
// dropped here too.
export async function recordRecommendation(
  userId: string,
  data: RecordRecommendation
) {
  const sanitizedInputs = sanitize(data.inputs) as Record<string, unknown>;

  const [row] = await db
    .insert(aiRecommendations)
    .values({
      userId,
      childId: data.childId ?? null,
      modelVersion: data.modelVersion,
      promptTemplate: data.promptTemplate,
      inputs: sanitizedInputs,
      suggestion: data.suggestion,
      evidence: data.evidence,
    })
    .returning();

  return row;
}
