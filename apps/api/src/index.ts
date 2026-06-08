import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "./lib/env";
import { app } from "./app";
import { migrate, closeDb } from "@focusflow/db";
import { seedDemoUser } from "./seed";
import { startScheduler, stopScheduler } from "./scheduler";
const port = env.PORT;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Serve frontend static files in production
if (env.NODE_ENV === "production") {
  const frontendPath = path.resolve(__dirname, "..", "..", "..", "apps", "web", "dist");

  app.use(
    "/*",
    serveStatic({
      root: frontendPath,
      onFound: (filePath, c) => {
        // Vite emits content-hashed JS/CSS/fonts/images under /assets/*.
        // These filenames change on every build, so they are safe to cache forever.
        if (filePath.includes("/assets/")) {
          c.header("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
    })
  );

  // SPA fallback: serve index.html for all non-API routes. Short max-age
  // lets repeat visitors skip the network roundtrip for the shell while
  // keeping releases visible within a minute.
  app.get("*", (c) => {
    const html = fs.readFileSync(path.join(frontendPath, "index.html"), "utf-8");
    c.header("Cache-Control", "private, max-age=60");
    return c.html(html);
  });
}

// Surface notification/cron misconfiguration at startup. The relevant code
// paths fail closed and silent (jobs return 501, sendEmail no-ops, push
// fan-out skips), so without this users could opt in to emails that never
// actually leave the server with no error trail.
function logNotificationConfigStatus() {
  if (env.NODE_ENV !== "production") return;
  const missing: string[] = [];
  if (!env.RESEND_API_KEY) missing.push("RESEND_API_KEY (daily reminders + weekly digests will not be sent)");
  if (!env.CRON_SECRET) missing.push("CRON_SECRET (job endpoints disabled — no scheduled emails)");
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) {
    missing.push("VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY (co-parent activity push notifications disabled)");
  }
  for (const item of missing) {
    console.warn(`[config] ${item}`);
  }
}

async function start() {
  await migrate();

  if (env.NODE_ENV !== "production") {
    await seedDemoUser();
  }

  logNotificationConfigStatus();

  // Start the in-process scheduler only when explicitly enabled. The
  // CRON_SECRET guard still applies to the HTTP endpoints, so a deploy
  // can transition by flipping ENABLE_SCHEDULER on, watching
  // /api/health/jobs for a tick, and then disabling the external
  // GitHub Actions cron — no code change required to roll back.
  if (env.ENABLE_SCHEDULER) {
    if (!env.CRON_SECRET) {
      console.warn(
        "[config] ENABLE_SCHEDULER=true but CRON_SECRET unset — scheduler still starts (calls jobs in-process, secret not needed) but external GH Actions cron will be disabled",
      );
    }
    startScheduler(env.SCHEDULER_TIMEZONE);
  }

  const server = serve({ fetch: app.fetch, port }, (info) => {
    console.log(`Toko API running on http://localhost:${info.port}`);
  });

  // Graceful shutdown: stop scheduled jobs, stop accepting connections, and
  // drain the DB pool so a container restart/redeploy doesn't sever in-flight
  // requests or leak connections.
  let shuttingDown = false;
  const shutdown = async (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`Received ${signal}, shutting down...`);
    try {
      await stopScheduler();
      server.close();
      await closeDb();
    } catch (err) {
      console.error(
        `Error during shutdown: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      process.exit(0);
    }
  };
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

start().catch((err) => {
  console.error(
    JSON.stringify({
      level: "error",
      event: "startup_failed",
      message: err instanceof Error ? err.message : String(err),
    }),
  );
  process.exit(1);
});
