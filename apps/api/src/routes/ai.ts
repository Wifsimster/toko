import { Hono } from "hono";
import { and, desc, eq } from "drizzle-orm";
import type { AppEnv } from "../types";
import { authMiddleware } from "../middleware/auth";
import { requirePlan } from "../middleware/require-plan";
import { db, aiRecommendations } from "@focusflow/db";
import { recommendationFeedbackSchema } from "@focusflow/validators";
import { parseBody } from "../lib/http/validate";

export const aiRoutes = new Hono<AppEnv>();

aiRoutes.use("*", authMiddleware);

aiRoutes.get("/recommendations", requirePlan, async (c) => {
  const currentUser = c.get("user");
  const rows = await db
    .select()
    .from(aiRecommendations)
    .where(eq(aiRecommendations.userId, currentUser.id))
    .orderBy(desc(aiRecommendations.createdAt))
    .limit(100);
  return c.json(rows);
});

aiRoutes.post("/recommendations/:id/feedback", async (c) => {
  const currentUser = c.get("user");
  const id = c.req.param("id");

  const input = await parseBody(c, recommendationFeedbackSchema);

  const now = new Date();
  const set: Record<string, unknown> = {};
  if (input.accepted === true) {
    set.acceptedAt = now;
    set.rejectedAt = null;
  }
  if (input.accepted === false) {
    set.rejectedAt = now;
    set.acceptedAt = null;
  }
  if (input.note !== undefined) set.feedbackNote = input.note;

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
