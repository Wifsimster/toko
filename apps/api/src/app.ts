import { Hono } from "hono";
import { compress } from "hono/compress";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
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

// Security headers — explicit CSP so a later Stripe.js integration won't
// be silently blocked, and so the policy is visible in code review.
//
// ANALYTICS_ORIGIN: origin (scheme + host) of the self-hosted GoatCounter
// instance. When set, it is whitelisted in script-src (loads count.js),
// img-src (the tracking pixel beacon), and connect-src (the count.js
// runtime may probe its own origin). Empty/unset = analytics disabled,
// CSP stays maximally strict.
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
      // 'self' so the app can frame its own same-origin responses.
      frameAncestors: ["'self'"],
      frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"],
      scriptSrc,
      styleSrc: ["'self'", "'unsafe-inline'"],
      // Business rule C5: img-src restricted to local + data URIs so no
      // off-domain pixel (tracker, remote avatar) can ever load — except
      // the explicitly-configured self-hosted analytics origin.
      imgSrc,
      fontSrc: ["'self'", "data:"],
      connectSrc,
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
    crossOriginEmbedderPolicy: false,
  }),
);

app.use("*", logger());

// gzip/deflate text responses (HTML, JSON, JS, CSS). Skipped automatically
// for already-compressed types (images, woff2). Behind Traefik in prod, but
// also useful for direct hits in dev and for any deployment without an
// upstream compressor.
app.use("*", compress());

// Stripe webhook — mounted BEFORE CORS and the global body limit (it
// needs the raw body for signature verification, server-to-server). We
// still apply a route-scoped 1 MB cap here: the webhook is unauthenticated
// (signature is verified after reading the body), so without this an
// attacker could stream gigabytes through `c.req.text()` before the
// signature check ever ran. Real Stripe events are well under 100 KB.
app.use(
  "/api/stripe/webhook",
  bodyLimit({ maxSize: 1024 * 1024 }),
);
app.route("/api/stripe/webhook", stripeWebhookRoute);

// Body size limit — 1MB global (after webhook route which needs raw body)
app.use("*", bodyLimit({ maxSize: 1024 * 1024 }));

// The web SPA is the primary CORS origin; the Expo Android client (apps/mobile)
// sends `Origin: toko://` (or `exp://` in dev). Native apps aren't subject to
// browser CORS, but Better Auth's Expo plugin still emits an Origin header, so
// we reflect the app scheme back to keep credentialed requests clean. Unknown
// origins fall back to the web origin (no reflection), preserving prior behavior.
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
// Public, token-authenticated (RFC 8058 one-click email unsubscribe).
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

// Machine-readable contract for the agent-readable surface. Public on
// purpose — it documents the API, carries no secrets, and is consumed by
// the developer docs and the Tokō MCP server.
app.get("/api/openapi.json", (c) => c.json(openApiSpec));

// Branded short link for the parents' community. Server-side redirect so the
// invite can change without shipping a new mobile build (the app and the web
// footers point here). Registered before the SPA fallback (index.ts).
app.get("/discord", (c) => c.redirect("https://discord.gg/Vf9Kdxr5TK", 302));

export { app };
