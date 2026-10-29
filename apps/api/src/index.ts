import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "./lib/env";
import { isStaticAssetPath } from "./lib/static-assets";
import {
  articleSlugFromPath,
  injectArticleOgMeta,
  injectPageOgMeta,
  loadArticleOgManifest,
  loadPageOgManifest,
  pageOgKeyFromPath,
  siteOriginFromHtml,
} from "./lib/article-og";
import { applyRouteMeta } from "./lib/route-meta";
import { app } from "./app";
import { migrate, closeDb } from "@focusflow/db";
import { seedDemoUser } from "./seed";
import { createFileOutboxEmailProvider, setEmailProvider } from "./lib/email";
import { startScheduler, stopScheduler } from "./scheduler";
const port = env.PORT;
const SHUTDOWN_DRAIN_TIMEOUT_MS = 8_000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (env.NODE_ENV === "production") {
  const frontendPath = path.resolve(__dirname, "..", "..", "..", "apps", "web", "dist");

  app.use(
    "/*",
    serveStatic({
      root: frontendPath,
      onFound: (filePath, c) => {
        if (filePath.includes("/assets/")) {
          c.header("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
    })
  );

  const articleOg = loadArticleOgManifest(frontendPath);
  const pageOg = loadPageOgManifest(frontendPath);

  app.get("*", (c) => {
    const pathname = new URL(c.req.url).pathname;
    if (isStaticAssetPath(pathname)) {
      return c.text("Not Found", 404);
    }

    const html = fs.readFileSync(path.join(frontendPath, "index.html"), "utf-8");
    c.header("Cache-Control", "private, max-age=60");

    const page = pageOg.get(pageOgKeyFromPath(pathname));
    if (page) {
      return c.html(injectPageOgMeta(html, page, siteOriginFromHtml(html)));
    }

    const slug = articleSlugFromPath(pathname);
    const article = slug ? articleOg.get(slug) : undefined;
    if (article) {
      return c.html(
        injectArticleOgMeta(html, article, siteOriginFromHtml(html))
      );
    }

    return c.html(applyRouteMeta(html, pathname));
  });
}

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

  if (env.NODE_ENV === "production" && env.EMAIL_OUTBOX_DIR) {
    console.warn("[config] EMAIL_OUTBOX_DIR is ignored in production (dev-only email outbox); emails go through Resend");
  } else if (env.EMAIL_OUTBOX_DIR && !env.RESEND_API_KEY) {
    setEmailProvider(createFileOutboxEmailProvider(env.EMAIL_OUTBOX_DIR));
    console.log(`[config] emails written to ${env.EMAIL_OUTBOX_DIR} (dev outbox)`);
  }

  if (env.NODE_ENV !== "production") {
    await seedDemoUser();
  }

  logNotificationConfigStatus();

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

  const closeServer = (timeoutMs: number) =>
    new Promise<void>((resolve) => {
      const timer = setTimeout(() => {
        console.warn(
          `Server did not drain within ${timeoutMs}ms, closing remaining connections`,
        );
        if ("closeAllConnections" in server) server.closeAllConnections();
        resolve();
      }, timeoutMs);
      timer.unref();
      server.close((err) => {
        clearTimeout(timer);
        if (err) console.error(`Error closing server: ${err.message}`);
        resolve();
      });
      if ("closeIdleConnections" in server) server.closeIdleConnections();
    });

  let shuttingDown = false;
  const shutdown = async (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`Received ${signal}, shutting down...`);
    try {
      await stopScheduler();
      await closeServer(SHUTDOWN_DRAIN_TIMEOUT_MS);
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
