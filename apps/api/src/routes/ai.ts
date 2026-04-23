import { Hono } from "hono";
import { and, desc, eq } from "drizzle-orm";
import type { AppEnv } from "../types";
import { authMiddleware } from "../middleware/auth";
import { db, aiRecommendations } from "@focusflow/db";
import { recommendationFeedbackSchema } from "@focusflow/validators";

export const aiRoutes = new Hono<AppEnv>();

aiRoutes.use("*", authMiddleware);

/**
 * GET /api/ai/recommendations
 * Lists the current user's AI recommendation history (latest first, capped).
 */
aiRoutes.get("/recommendations", async (c) => {
  const currentUser = c.get("user");
  const rows = await db
    .select()
    .from(aiRecommendations)
    .where(eq(aiRecommendations.userId, currentUser.id))
    .orderBy(desc(aiRecommendations.createdAt))
    .limit(100);
  return c.json(rows);
});

/**
 * POST /api/ai/recommendations/:id/feedback
 * Body: { accepted?: boolean, note?: string }
 * Stamps acceptedAt or rejectedAt and (optionally) stores a free-form note.
 * The 'note' field is stored verbatim — no PII sanitization here because
 * this is the parent's own free reaction, not data sent to the model.
 */
aiRoutes.post("/recommendations/:id/feedback", async (c) => {
  const currentUser = c.get("user");
  const id = c.req.param("id");

  const body = await c.req.json().catch(() => ({}));
  const parsed = recommendationFeedbackSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Payload invalide", issues: parsed.error.issues }, 422);
  }

  const now = new Date();
  const set: Record<string, unknown> = {};
  if (parsed.data.accepted === true) set.acceptedAt = now;
  if (parsed.data.accepted === false) set.rejectedAt = now;
  if (parsed.data.note !== undefined) set.feedbackNote = parsed.data.note;

  const [row] = await db
    .update(aiRecommendations)
    .set(set)
    .where(
      and(
        eq(aiRecommendations.id, id),
        eq(aiRecommendations.userId, currentUser.id)
      )
    )
    .returning();

  if (!row) return c.json({ error: "Recommandation introuvable" }, 404);
  return c.json(row);
});
