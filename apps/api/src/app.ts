import { Hono } from "hono";
import { compress } from "hono/compress";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { redactRequestLine } from "./lib/safe-logger";
import { secureHeaders } from "hono/secure-headers";
import { bodyLimit } from "hono/body-limit";
import { etag } from "hono/etag";
import { env } from "./lib/env";
import { errorHandler } from "./middleware/error-handler";
import { rateLimiter } from "./middleware/rate-limiter";
import { healthRoutes } from "./routes/health";
import { unsubscribeRoutes } from "./routes/unsubscribe";
import { childrenRoutes } from "./routes/children";
import { symptomsRoutes } from "./routes/symptoms";
import { journalRoutes } from "./routes/journal";
import { statsRoutes } from "./routes/stats";
import { billingRoutes } from "./routes/billing";
import { stripeWebhookRoute } from "./routes/stripe-webhook";
import { barkleyRoutes } from "./routes/barkley";
import { accountRoutes } from "./routes/account";
import { crisisListRoutes } from "./routes/crisis-list";
import { medicationsRoutes } from "./routes/medications";
import { jobsRoutes } from "./routes/jobs";
import { preferencesRoutes } from "./routes/preferences";
import { reportRoutes } from "./routes/report";
import { newsRoutes } from "./routes/news";
import { aiRoutes } from "./routes/ai";
import { roadmapRoutes } from "./routes/roadmap";
import { pushRoutes } from "./routes/push";
import { childInvitationsRoutes } from "./routes/child-invitations";
import { childAccessRoutes } from "./routes/child-access";
import { auditLogRoutes } from "./routes/audit-log";
import { routinesRoutes } from "./routes/routines";
import { parentMoodRoutes } from "./routes/parent-mood";
import { solidarityRoutes } from "./routes/solidarity";
import { eventsRoutes } from "./routes/events";
import { waitlistRoutes } from "./routes/waitlist";
import { betaFeedbackRoutes } from "./routes/beta-feedback";
import { adminAnalyticsRoutes } from "./routes/admin-analytics";
import { adminUsersRoutes } from "./routes/admin-users";
import { adminSettingsRoutes } from "./routes/admin-settings";
import { featureFlagsRoutes } from "./routes/feature-flags";
import { agentKeysRoutes } from "./routes/agent-keys";
import { companionsRoutes } from "./routes/companions";
import { openApiSpec } from "./lib/openapi-spec";
import { auth } from "./lib/auth";

const app = new Hono();

const analyticsOrigin = process.env.ANALYTICS_ORIGIN?.trim() || "";

const scriptSrc = ["'self'", "https://js.stripe.com"];
const imgSrc = ["'self'", "data:"];
const connectSrc = ["'self'", "https://api.stripe.com"];
if (analyticsOrigin) {
  scriptSrc.push(analyticsOrigin);
  imgSrc.push(analyticsOrigin);
  connectSrc.push(analyticsOrigin);
}

app.use(
  "*",
  secureHeaders({
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      formAction: ["'self'", "https://checkout.stripe.com"],
      frameAncestors: ["'self'"],
      frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"],
      scriptSrc,
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc,
      fontSrc: ["'self'", "data:"],
      connectSrc,
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
    crossOriginEmbedderPolicy: false,
  }),
);

app.use(
  "*",
  logger((line, ...rest) => console.log(redactRequestLine(line), ...rest)),
);

app.use("*", compress());

app.use(
  "/api/stripe/webhook",
  bodyLimit({ maxSize: 1024 * 1024 }),
);
app.route("/api/stripe/webhook", stripeWebhookRoute);

app.use("*", bodyLimit({ maxSize: 1024 * 1024 }));

const webOrigin = env.CORS_ORIGIN ?? "http://localhost:5173";
const mobileOriginSchemes = ["toko://", "exp://"];
app.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin) return webOrigin;
      if (origin === webOrigin) return webOrigin;
      if (mobileOriginSchemes.some((scheme) => origin.startsWith(scheme))) {
        return origin;
      }
      return webOrigin;
    },
    credentials: true,
  })
);
app.onError(errorHandler);

app.use("/api/*", async (c, next) => {
  if (c.req.method === "GET") {
    c.header("Cache-Control", "private, no-cache");
  }
  await next();
});
app.use("/api/*", etag());

const ipLimiter = rateLimiter({ namespace: "api-global", windowMs: 60_000, limit: 600 });
const sessionCheckLimiter = rateLimiter({ namespace: "api-session", windowMs: 60_000, limit: 300 });
app.use("/api/*", (c, next) =>
  c.req.path === "/api/auth/get-session" ? sessionCheckLimiter(c, next) : ipLimiter(c, next),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.route("/api/health", healthRoutes);
app.route("/api/unsubscribe", unsubscribeRoutes);
app.route("/api/children", childrenRoutes);
app.route("/api/child-invitations", childInvitationsRoutes);
app.route("/api/child-access", childAccessRoutes);
app.route("/api/audit-log", auditLogRoutes);
app.route("/api/symptoms", symptomsRoutes);
app.route("/api/journal", journalRoutes);
app.route("/api/stats", statsRoutes);
app.route("/api/billing", billingRoutes);
app.route("/api/barkley", barkleyRoutes);
app.route("/api/account", accountRoutes);
app.route("/api/crisis-list", crisisListRoutes);
app.route("/api/medications", medicationsRoutes);
app.route("/api/preferences", preferencesRoutes);
app.route("/api/report", reportRoutes);
app.route("/api/news", newsRoutes);
app.route("/api/jobs", jobsRoutes);
app.route("/api/ai", aiRoutes);
app.route("/api/roadmap", roadmapRoutes);
app.route("/api/push", pushRoutes);
app.route("/api/routines", routinesRoutes);
app.route("/api/parent-mood", parentMoodRoutes);
app.route("/api/solidarity", solidarityRoutes);
app.route("/api/events", eventsRoutes);
app.route("/api/waitlist", waitlistRoutes);
app.route("/api/beta-feedback", betaFeedbackRoutes);
app.route("/api/admin/analytics", adminAnalyticsRoutes);
app.route("/api/admin/users", adminUsersRoutes);
app.route("/api/admin/settings", adminSettingsRoutes);
app.route("/api/feature-flags", featureFlagsRoutes);
app.route("/api/agent-keys", agentKeysRoutes);
app.route("/api/companions", companionsRoutes);

app.get("/api/openapi.json", (c) => c.json(openApiSpec));

app.get("/discord", (c) => c.redirect("https://discord.gg/Vf9Kdxr5TK", 302));

app.all("/api/*", (c) =>
  c.json({ error: "Route introuvable", code: "NOT_FOUND" }, 404),
);
app.notFound((c) =>
  c.json({ error: "Route introuvable", code: "NOT_FOUND" }, 404),
);

export { app };
