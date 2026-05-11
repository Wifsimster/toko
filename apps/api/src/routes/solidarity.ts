import { Hono } from "hono";
import { eq, and, desc } from "drizzle-orm";
import type { AppEnv } from "../types";
import { db, solidarityRequests } from "@focusflow/db";
import { solidarityRequestInputSchema } from "@focusflow/validators";
import { authMiddleware } from "../middleware/auth";

export const solidarityRoutes = new Hono<AppEnv>();

solidarityRoutes.use("*", authMiddleware);

// `admin_note` is intentionally never exposed to the parent — internal-only
// review notes stay inside the admin tooling.
function sanitize(row: typeof solidarityRequests.$inferSelect) {
  return {
    id: row.id,
    parentId: row.parentId,
    message: row.message,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    reviewedAt: row.reviewedAt ? row.reviewedAt.toISOString() : null,
  };
}

// Returns the parent's most recent solidarity request, or null. Used by
// the account page to surface the request's status (pending / approved
// / rejected) once submitted, instead of re-showing the form blindly.
solidarityRoutes.get("/mine", async (c) => {
  const user = c.get("user");
  const [row] = await db
    .select()
    .from(solidarityRequests)
    .where(eq(solidarityRequests.parentId, user.id))
    .orderBy(desc(solidarityRequests.createdAt))
    .limit(1);

  return c.json(row ? sanitize(row) : null);
});

// Creates a new solidarity request. Guards against multiple pending
// requests per parent — once a request is pending, the parent must
// wait for the admin to review it before submitting another.
solidarityRoutes.post("/", async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const parsed = solidarityRequestInputSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      422,
    );
  }

  const [existing] = await db
    .select({ id: solidarityRequests.id })
    .from(solidarityRequests)
    .where(
      and(
        eq(solidarityRequests.parentId, user.id),
        eq(solidarityRequests.status, "pending"),
      ),
    )
    .limit(1);

  if (existing) {
    return c.json(
      {
        error: "Une demande est déjà en cours d'examen.",
        code: "SOLIDARITY_REQUEST_PENDING",
      },
      409,
    );
  }

  const [created] = await db
    .insert(solidarityRequests)
    .values({
      parentId: user.id,
      message: parsed.data.message ?? null,
      status: "pending",
    })
    .returning();

  if (!created) {
    return c.json({ error: "Création impossible" }, 500);
  }

  return c.json(sanitize(created), 201);
});
