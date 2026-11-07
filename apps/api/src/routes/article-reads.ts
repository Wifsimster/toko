import { Hono } from "hono";
import type { AppEnv } from "../types";
import { eq } from "drizzle-orm";
import { db, articleReads, user } from "@focusflow/db";
import { markArticleReadSchema } from "@focusflow/validators";
import { authMiddleware } from "../middleware/auth";
import { parseBody } from "../lib/http/validate";

export const articleReadsRoutes = new Hono<AppEnv>();

articleReadsRoutes.use("*", authMiddleware);

articleReadsRoutes.get("/", async (c) => {
  const currentUser = c.get("user");
  const [[account], reads] = await Promise.all([
    db
      .select({ createdAt: user.createdAt })
      .from(user)
      .where(eq(user.id, currentUser.id))
      .limit(1),
    db
      .select({ slug: articleReads.slug, readAt: articleReads.readAt })
      .from(articleReads)
      .where(eq(articleReads.userId, currentUser.id)),
  ]);

  return c.json({
    accountCreatedAt: (account?.createdAt ?? new Date()).toISOString(),
    reads: reads.map((r) => ({ slug: r.slug, readAt: r.readAt.toISOString() })),
  });
});

articleReadsRoutes.post("/", async (c) => {
  const currentUser = c.get("user");
  const { slug } = await parseBody(c, markArticleReadSchema);
  const readAt = new Date();

  await db
    .insert(articleReads)
    .values({ userId: currentUser.id, slug, readAt })
    .onConflictDoUpdate({
      target: [articleReads.userId, articleReads.slug],
      set: { readAt },
    });

  return c.json({ slug, readAt: readAt.toISOString() });
});
