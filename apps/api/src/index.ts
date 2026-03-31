import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { app } from "./app";
import { migrate } from "@focusflow/db";
import { seedDemoUser } from "./seed";
import { validateStripeEnv } from "./lib/stripe";

const port = Number(process.env.PORT) || 3001;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Serve frontend static files in production
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.resolve(__dirname, "..", "..", "..", "apps", "web", "dist");

  app.use(
    "/*",
    serveStatic({ root: frontendPath })
  );

  // SPA fallback: serve index.html for all non-API routes
  app.get("*", (c) => {
    const html = fs.readFileSync(path.join(frontendPath, "index.html"), "utf-8");
    c.header("Cache-Control", "no-cache");
    return c.html(html);
  });
}

async function start() {
  validateStripeEnv();
  await migrate();
  await seedDemoUser();

  serve({ fetch: app.fetch, port }, (info) => {
    console.log(`Tokō API running on http://localhost:${info.port}`);
  });
}

start();
