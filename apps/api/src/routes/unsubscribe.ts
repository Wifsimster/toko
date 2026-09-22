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

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) =>
    ch === "&" ? "&amp;" : ch === "<" ? "&lt;" : ch === ">" ? "&gt;" : ch === '"' ? "&quot;" : "&#39;"
  );
}

function page(title: string, message: string, extra = ""): string {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${title}</title>
<style>body{font-family:system-ui,sans-serif;max-width:32rem;margin:4rem auto;padding:0 1.5rem;color:#2b2320;line-height:1.6}h1{font-size:1.25rem}a{color:#b85c43}button{font:inherit;font-size:1rem;padding:.75rem 1.25rem;border:0;border-radius:.5rem;background:#b85c43;color:#fff;cursor:pointer}</style>
</head><body><h1>${title}</h1><p>${message}</p>${extra}
<p><a href="/account">Gérer mes préférences de notification</a></p></body></html>`;
}

function invalidPage(): string {
  return page(
    "Lien invalide",
    "Ce lien de désinscription n'est pas valide ou a expiré. Vous pouvez gérer vos préférences depuis votre compte."
  );
}

// Hidden field sent by the confirmation page's form, so the POST handler can
// answer the browser with a page instead of the RFC 8058 JSON body.
const PAGE_FIELD = "from";
const PAGE_VALUE = "page";

// GET is what the recipient's mail client opens from the "unsubscribe" link.
// It must NOT change anything: mail security scanners prefetch links, which
// would silently unsubscribe people. It only shows a confirmation button.
unsubscribeRoutes.get("/", (c) => {
  const token = c.req.query("token") ?? "";
  if (!verifyUnsubscribeToken(token)) {
    return c.html(invalidPage(), 400);
  }
  const action = `/api/unsubscribe?token=${encodeURIComponent(token)}`;
  return c.html(
    page(
      "Ne plus recevoir ces e-mails ?",
      "Cliquez sur le bouton pour confirmer. Vous pourrez les réactiver à tout moment depuis votre compte.",
      `<form method="post" action="${escapeHtml(action)}"><input type="hidden" name="${PAGE_FIELD}" value="${PAGE_VALUE}"><button type="submit">Me désinscrire</button></form>`
    )
  );
});

// POST performs the opt-out. Mail clients send it silently for RFC 8058
// one-click unsubscribe (JSON response); the confirmation page above sends it
// from a button click (HTML response).
unsubscribeRoutes.post("/", async (c) => {
  const token = c.req.query("token") ?? "";
  const fromPage = await isFromPage(c.req.raw);
  const parsed = verifyUnsubscribeToken(token);
  if (!parsed) {
    return fromPage
      ? c.html(invalidPage(), 400)
      : c.json({ error: "Invalid token" }, 400);
  }
  await optOut(parsed.userId, parsed.category);
  if (fromPage) {
    return c.html(
      page(
        "Désinscription confirmée",
        "Vous ne recevrez plus ces e-mails. Vous pouvez réactiver les rappels à tout moment depuis votre compte."
      )
    );
  }
  return c.json({ unsubscribed: true });
});

async function isFromPage(req: Request): Promise<boolean> {
  const type = req.headers.get("content-type") ?? "";
  if (!type.includes("application/x-www-form-urlencoded")) return false;
  try {
    const body = new URLSearchParams(await req.clone().text());
    return body.get(PAGE_FIELD) === PAGE_VALUE;
  } catch {
    return false;
  }
}
