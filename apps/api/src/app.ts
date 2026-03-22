import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { errorHandler } from "./middleware/error-handler";
import { healthRoutes } from "./routes/health";
import { childrenRoutes } from "./routes/children";
import { symptomsRoutes } from "./routes/symptoms";
import { medicationsRoutes } from "./routes/medications";
import { auth } from "./lib/auth";

const app = new Hono();

app.use("*", logger());
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
app.route("/api/medications", medicationsRoutes);

export { app };
