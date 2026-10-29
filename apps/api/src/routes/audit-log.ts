import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { assertChildAccess } from "../lib/child-access";
import { listAuditForChild } from "../lib/audit";
import type { AppEnv } from "../types";

export const auditLogRoutes = new Hono<AppEnv>();

auditLogRoutes.use("*", authMiddleware);

auditLogRoutes.get("/child/:childId", async (c) => {
  const currentUser = c.get("user");
  const childId = c.req.param("childId");

  await assertChildAccess(currentUser.id, childId);

  const limit = Math.min(
    Math.max(Number(c.req.query("limit")) || 50, 1),
    200,
  );

  const rows = await listAuditForChild(childId, limit);
  return c.json(rows);
});
