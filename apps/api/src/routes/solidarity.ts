import { Hono } from "hono";
import { eq, and, desc } from "drizzle-orm";
import type { AppEnv } from "../types";
import { db, solidarityRequests } from "@focusflow/db";
import { solidarityRequestInputSchema } from "@focusflow/validators";
import { authMiddleware } from "../middleware/auth";
import { sendEmail } from "../lib/email";
import { solidarityRequestAdminNotificationTemplate } from "../lib/email-templates";
import { env } from "../lib/env";
import { log } from "../lib/safe-logger";
import { parseBody } from "../lib/http/validate";

export const solidarityRoutes = new Hono<AppEnv>();

solidarityRoutes.use("*", authMiddleware);

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

solidarityRoutes.post("/", async (c) => {
  const user = c.get("user");
  const input = await parseBody(c, solidarityRequestInputSchema);

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
      message: input.message ?? null,
      status: "pending",
    })
    .returning();

  if (!created) {
    return c.json({ error: "Création impossible" }, 500);
  }

  void notifyAdminOfRequest({
    parentName: user.name ?? user.email,
    parentEmail: user.email,
    message: created.message,
    requestId: created.id,
  });

  return c.json(sanitize(created), 201);
});

async function notifyAdminOfRequest(data: {
  parentName: string;
  parentEmail: string;
  message: string | null;
  requestId: string;
}) {
  try {
    const { subject, html } = solidarityRequestAdminNotificationTemplate(data);
    await sendEmail({
      to: env.SOLIDARITY_NOTIFY_EMAIL,
      subject,
      html,
    });
  } catch (err) {
    log.error("solidarity_request_notify_failed", err);
  }
}
