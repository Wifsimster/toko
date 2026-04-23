import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { bodyLimit } from "hono/body-limit";
import { etag } from "hono/etag";
import { env } from "./lib/env";
import { errorHandler } from "./middleware/error-handler";
import { rateLimiter } from "./middleware/rate-limiter";
import { healthRoutes } from "./routes/health";
import { childrenRoutes } from "./routes/children";
import { symptomsRoutes } from "./routes/symptoms";
import { journalRoutes } from "./routes/journal";
import { statsRoutes } from "./routes/stats";
import { billingRoutes, stripeWebhookRoute } from "./routes/billing";
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
import { auth } from "./lib/auth";

const app = new Hono();

// Security headers — explicit CSP so a later Stripe.js integration won't
// be silently blocked, and so the policy is visible in code review.
app.use(
  "*",
  secureHeaders({
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      formAction: ["'self'", "https://checkout.stripe.com"],
      frameAncestors: ["'none'"],
      frameSrc: ["https://js.stripe.com", "https://hooks.stripe.com"],
      scriptSrc: ["'self'", "https://js.stripe.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      // Business rule C5: img-src restricted to local + data URIs so no
      // off-domain pixel (tracker, remote avatar) can ever load.
      imgSrc: ["'self'", "data:"],
      fontSrc: ["'self'", "data:"],
      connectSrc: ["'self'", "https://api.stripe.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
    crossOriginEmbedderPolicy: false,
  }),
);

app.use("*", logger());

// Stripe webhook — mounted BEFORE CORS and body limit (needs raw body, server-to-server)
app.route("/api/stripe/webhook", stripeWebhookRoute);

// Body size limit — 1MB global (after webhook route which needs raw body)
app.use("*", bodyLimit({ maxSize: 1024 * 1024 }));

app.use(
  "*",
  cors({
    origin: env.CORS_ORIGIN ?? "http://localhost:5173",
    credentials: true,
  })
);
app.onError(errorHandler);

// ETag middleware for API GET responses (enables 304 Not Modified)
app.use("/api/*", async (c, next) => {
  if (c.req.method === "GET") {
    // Tell clients to revalidate but allow conditional requests via ETag
    c.header("Cache-Control", "private, no-cache");
  }
  await next();
});
app.use("/api/*", etag());

// Global IP-based rate limit for API routes. Better Auth has its own
// limiter on /api/auth/*, Stripe webhook is outside /api/* namespace so
// it bypasses this layer — signature verification is the gate there.
// Per-user strict quotas (report email, billing, account) are applied
// inside each route, after authMiddleware, where c.get("user") is set.
app.use(
  "/api/*",
  rateLimiter({ namespace: "api-global", windowMs: 60_000, limit: 120 }),
);

// Auth handler — rate limiting handled by Better Auth's built-in limiter
app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.route("/api/health", healthRoutes);
app.route("/api/children", childrenRoutes);
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

export { app };
