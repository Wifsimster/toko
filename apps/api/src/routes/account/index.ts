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

/**
 * /api/account is six unrelated concerns that happen to share a URL
 * prefix: erasure, consent records, the NPS prompt, the RGPD data export,
 * the app-lock PIN, and two small reads about the account. They used to
 * share a 700-line file as well, which meant a change to the PIN hashing
 * sat next to the Stripe erasure path.
 *
 * This file owns only what genuinely belongs to the prefix: authentication
 * and the rate-limit policy, which has to be declared before the
 * sub-routers mount so it applies to all of them.
 */
export const accountRoutes = new Hono<AppEnv>();

accountRoutes.use("*", authMiddleware);

// Account deletion + export are both sensitive: hard-cap per user.
//
// Scoped to those routes on purpose. Mounted on "*" the 10/hour budget was
// shared with the cheap reads this router also serves (/koe-hash on every app
// load, /consents, /deletion-status, /nps-prompt, /lock-pin) — a parent who
// reopened the app a handful of times spent the quota on those and then got a
// 429 on the RGPD export, which is precisely the request that must not be
// rate-limited away.
const sensitiveLimiter = rateLimiter({
  namespace: "account-sensitive",
  windowMs: 60 * 60_000,
  limit: 10,
  keyBy: "user",
});
accountRoutes.use("/", sensitiveLimiter); // DELETE /api/account
accountRoutes.use("/export", sensitiveLimiter);
accountRoutes.use("/schedule-deletion", sensitiveLimiter);
accountRoutes.use("/cancel-deletion", sensitiveLimiter);

// The app lock is a 4–6 digit PIN, so its verify endpoint needs a bruteforce
// budget of its own rather than the router's general cap: 10 tries per 15 min
// leaves a 4-digit space ~250 h deep while never getting in the way of a
// parent unlocking their own app.
accountRoutes.use(
  "/lock-pin/verify",
  rateLimiter({
    namespace: "account-lock-pin",
    windowMs: 15 * 60_000,
    limit: 10,
    keyBy: "user",
  }),
);

// Everything else on this router is a cheap read or a small write. Still
// capped per user so a runaway client can't hammer it, just not at the
// deletion budget.
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
