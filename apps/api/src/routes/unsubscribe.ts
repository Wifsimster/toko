import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db, userPreferences } from "@focusflow/db";
import type { AppEnv } from "../types";
import {
  verifyUnsubscribeToken,
  CATEGORY_COLUMN,
  type EmailCategory,
} from "../lib/unsubscribe";

// Public, token-authenticated one-click unsubscribe for non-transactional
// emails (RFC 8058). No session required — the signed token IS the auth.
export const unsubscribeRoutes = new Hono<AppEnv>();

async function optOut(userId: string, category: EmailCategory): Promise<void> {
  await db
    .update(userPreferences)
    .set({ [CATEGORY_COLUMN[category]]: false, updatedAt: new Date() })
    .where(eq(userPreferences.userId, userId));
}

function page(title: string, message: string): string {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>body{font-family:system-ui,sans-serif;max-width:32rem;margin:4rem auto;padding:0 1.5rem;color:#2b2320;line-height:1.6}h1{font-size:1.25rem}a{color:#b85c43}</style>
</head><body><h1>${title}</h1><p>${message}</p>
<p><a href="/account">Gérer mes préférences de notification</a></p></body></html>`;
}

// GET is used when the recipient clicks the "unsubscribe" link in their mail
// client; POST is the RFC 8058 one-click variant the client sends silently.
unsubscribeRoutes.get("/", async (c) => {
  const token = c.req.query("token") ?? "";
  const parsed = verifyUnsubscribeToken(token);
  if (!parsed) {
    return c.html(
      page(
        "Lien invalide",
        "Ce lien de désinscription n'est pas valide ou a expiré. Vous pouvez gérer vos préférences depuis votre compte."
      ),
      400
    );
  }
  await optOut(parsed.userId, parsed.category);
  return c.html(
    page(
      "Désinscription confirmée",
      "Vous ne recevrez plus ces e-mails. Vous pouvez réactiver les rappels à tout moment depuis votre compte."
    )
  );
});

unsubscribeRoutes.post("/", async (c) => {
  const token = c.req.query("token") ?? "";
  const parsed = verifyUnsubscribeToken(token);
  if (!parsed) return c.json({ error: "Invalid token" }, 400);
  await optOut(parsed.userId, parsed.category);
  return c.json({ unsubscribed: true });
});
