import { Hono } from "hono";
import { desc, eq } from "drizzle-orm";
import type { AppEnv } from "../types";
import { authMiddleware } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";
import { db, user, betaFeedback } from "@focusflow/db";
import { createBetaFeedbackSchema } from "@focusflow/validators";

export const betaFeedbackRoutes = new Hono<AppEnv>();

betaFeedbackRoutes.use("*", authMiddleware);

// GET /api/beta-feedback/status — is the caller in the closed-beta cohort?
// Drives whether the in-app feedback widget renders.
betaFeedbackRoutes.get("/status", async (c) => {
  const me = c.get("user");
  const [row] = await db
    .select({ betaCohort: user.betaCohort })
    .from(user)
    .where(eq(user.id, me.id))
    .limit(1);
  return c.json({ eligible: row?.betaCohort ?? false });
});

// POST /api/beta-feedback — submit qualitative feedback (cohort members only).
betaFeedbackRoutes.post("/", async (c) => {
  const me = c.get("user");
  const [row] = await db
    .select({ betaCohort: user.betaCohort })
    .from(user)
    .where(eq(user.id, me.id))
    .limit(1);
  if (!row?.betaCohort) {
    throw new AppError("FORBIDDEN", "Réservé aux familles de la bêta.", 403);
  }

  const body = await c.req.json().catch(() => ({}));
  const parsed = createBetaFeedbackSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: "Message invalide", issues: parsed.error.issues },
      422,
    );
  }

  const [created] = await db
    .insert(betaFeedback)
    .values({ userId: me.id, message: parsed.data.message })
    .returning();

  return c.json(created, 201);
});

// GET /api/beta-feedback — admin: every feedback entry with its author.
betaFeedbackRoutes.get("/", async (c) => {
  const me = c.get("user");
  const [meRow] = await db
    .select({ isAdmin: user.isAdmin })
    .from(user)
    .where(eq(user.id, me.id))
    .limit(1);
  if (!meRow?.isAdmin) {
    throw new AppError("FORBIDDEN", "Action réservée aux admins", 403);
  }

  const rows = await db
    .select({
      id: betaFeedback.id,
      message: betaFeedback.message,
      createdAt: betaFeedback.createdAt,
      userName: user.name,
      userEmail: user.email,
    })
    .from(betaFeedback)
    .innerJoin(user, eq(user.id, betaFeedback.userId))
    .orderBy(desc(betaFeedback.createdAt))
    .limit(100);

  return c.json(rows);
});
