import { Hono } from "hono";
import { and, eq } from "drizzle-orm";
import { db, npsResponses, user } from "@focusflow/db";
import { submitNpsSchema } from "@focusflow/validators";
import type { AppEnv } from "../../types";
import { parseBody } from "../../lib/http/validate";


export const npsRoutes = new Hono<AppEnv>();

/**
 * Business rule H2: in-app NPS segmented by tenure cohort.
 *
 * GET  /api/account/nps-prompt    → { cohort } that should be prompted now, or null
 * POST /api/account/nps           → record { cohort, score, feedback? } (score null = dismissed)
 *
 * Cohorts unlock at 30 / 90 / 365 days after signup and close when the
 * following cohort opens, so a late-answering user only ever sees the
 * currently-active one.
 */
const NPS_COHORT_WINDOWS: Array<{ cohort: "d30" | "d90" | "d365"; minDays: number; maxDays: number }> = [
  { cohort: "d30", minDays: 30, maxDays: 89 },
  { cohort: "d90", minDays: 90, maxDays: 364 },
  { cohort: "d365", minDays: 365, maxDays: Number.POSITIVE_INFINITY },
];

npsRoutes.get("/nps-prompt", async (c) => {
  const currentUser = c.get("user");

  const [profile] = await db
    .select({ createdAt: user.createdAt })
    .from(user)
    .where(eq(user.id, currentUser.id))
    .limit(1);
  if (!profile) return c.json({ cohort: null });

  const ageDays = Math.floor(
    (Date.now() - profile.createdAt.getTime()) / (24 * 60 * 60 * 1000)
  );
  const window = NPS_COHORT_WINDOWS.find(
    (w) => ageDays >= w.minDays && ageDays <= w.maxDays
  );
  if (!window) return c.json({ cohort: null });

  const [existing] = await db
    .select()
    .from(npsResponses)
    .where(
      and(
        eq(npsResponses.userId, currentUser.id),
        eq(npsResponses.cohort, window.cohort)
      )
    )
    .limit(1);

  if (existing) return c.json({ cohort: null });
  return c.json({ cohort: window.cohort });
});

npsRoutes.post("/nps", async (c) => {
  const currentUser = c.get("user");
  const input = await parseBody(c, submitNpsSchema);

  const [row] = await db
    .insert(npsResponses)
    .values({
      userId: currentUser.id,
      cohort: input.cohort,
      score: input.score,
      feedback: input.feedback ?? null,
    })
    .onConflictDoNothing({
      target: [npsResponses.userId, npsResponses.cohort],
    })
    .returning();

  return c.json(row ?? { duplicate: true }, row ? 201 : 200);
});
