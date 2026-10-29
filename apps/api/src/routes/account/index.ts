import { Hono } from "hono";
import type { AppEnv } from "../../types";
import { authMiddleware } from "../../middleware/auth";
import { rateLimiter } from "../../middleware/rate-limiter";
import { deletionRoutes } from "./deletion";
import { consentsRoutes } from "./consents";
import { npsRoutes } from "./nps";
import { dataExportRoutes } from "./export";
import { lockPinRoutes } from "./lock-pin";
import { accountInsightsRoutes } from "./insights";

export const accountRoutes = new Hono<AppEnv>();

accountRoutes.use("*", authMiddleware);

const sensitiveLimiter = rateLimiter({
  namespace: "account-sensitive",
  windowMs: 60 * 60_000,
  limit: 10,
  keyBy: "user",
});
accountRoutes.use("/", sensitiveLimiter);
accountRoutes.use("/export", sensitiveLimiter);
accountRoutes.use("/schedule-deletion", sensitiveLimiter);
accountRoutes.use("/cancel-deletion", sensitiveLimiter);

accountRoutes.use(
  "/lock-pin/verify",
  rateLimiter({
    namespace: "account-lock-pin",
    windowMs: 15 * 60_000,
    limit: 10,
    keyBy: "user",
  }),
);

accountRoutes.use(
  "*",
  rateLimiter({
    namespace: "account",
    windowMs: 60 * 60_000,
    limit: 240,
    keyBy: "user",
  }),
);

accountRoutes.route("/", deletionRoutes);
accountRoutes.route("/", consentsRoutes);
accountRoutes.route("/", npsRoutes);
accountRoutes.route("/", dataExportRoutes);
accountRoutes.route("/", lockPinRoutes);
accountRoutes.route("/", accountInsightsRoutes);
