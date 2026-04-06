import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { bodyLimit } from "hono/body-limit";
import { etag } from "hono/etag";
import { env } from "./lib/env";
import { rateLimiter } from "./middleware/rate-limiter";
import { errorHandler } from "./middleware/error-handler";
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
import { auth } from "./lib/auth";

const app = new Hono();

// Security headers
app.use("*", secureHeaders());

app.use("*", logger());

// Stripe webhook — mounted BEFORE CORS and body limit (needs raw body, server-to-server)
app.route("/api/stripe/webhook", stripeWebhookRoute);

// Body size limit — 1MB global (after webhook route which needs raw body)
app.use("*", bodyLimit({ maxSize: 1024 * 1024 }));

app.use(
  "*",
  cors({
    origin: env.CORS_ORIGIN || "http://localhost:5173",
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

// Rate limit on auth endpoints — 10 requests per minute per IP
app.use("/api/auth/*", rateLimiter({ windowMs: 60_000, limit: 10 }));

app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

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

export { app };
