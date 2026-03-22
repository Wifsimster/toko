import { serve } from "@hono/node-server";
import { app } from "./app";

const port = Number(process.env.PORT) || 3001;

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`🚀 Tokō API running on http://localhost:${info.port}`);
});
