import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
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
import { auth } from "./lib/auth";

const app = new Hono();

app.use("*", logger());

// Stripe webhook — mounted BEFORE CORS (server-to-server, no CORS needed)
app.route("/api/stripe/webhook", stripeWebhookRoute);

app.use(
  "*",
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.onError(errorHandler);

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

export { app };
