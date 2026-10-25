// Email verification at sign-up (requireEmailVerification, lib/auth.ts) and
// the grandfathering migration 0064. Runs the real Better Auth handler on a
// real Postgres. Skips unless INTEGRATION_DB=1 (see helpers/test-db.ts).
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { eq, sql } from "drizzle-orm";
import { db, user as userTable } from "@focusflow/db";
import { app } from "../app";
import {
  createRecordingEmailProvider,
  setEmailProvider,
  type EmailProvider,
} from "../lib/email";
import { ensureMigrations, integrationDbAvailable, truncateAll } from "./helpers/test-db";

const MIGRATION_0064 = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../../packages/db/drizzle/0064_grandfather_email_verified.sql",
);

const PASSWORD = "mot-de-passe-test";

function post(route: string, body: unknown) {
  return app.request(`http://localhost/api/auth${route}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function signUp(email: string, name = "Parent Test") {
  return post("/sign-up/email", { name, email, password: PASSWORD });
}

function signIn(email: string, password = PASSWORD) {
  return post("/sign-in/email", { email, password });
}

async function emailVerified(email: string): Promise<boolean | undefined> {
  const [row] = await db
    .select({ v: userTable.emailVerified })
    .from(userTable)
    .where(eq(userTable.email, email));
  return row?.v;
}

function hasSessionCookie(res: Response): boolean {
  return /session_token=[^;]+/.test(res.headers.get("set-cookie") ?? "");
}

function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, typeof v === "object" && v !== null ? shape(v) : typeof v]),
    );
  }
  return typeof value;
}

describe.skipIf(!integrationDbAvailable)("email verification at sign-up — DB integration", () => {
  let outbox: ReturnType<typeof createRecordingEmailProvider>;
  let previous: EmailProvider;

  beforeAll(async () => {
    await ensureMigrations();
  });

  beforeEach(() => {
    outbox = createRecordingEmailProvider();
    previous = setEmailProvider(outbox);
  });

  afterEach(async () => {
    setEmailProvider(previous);
    await truncateAll();
  });

  afterAll(async () => {
    await truncateAll();
  });

  it("answers a sign-up the same way whether or not the address has an account", async () => {
    await signUp("deja-inscrit@toko.test");
    await db
      .update(userTable)
      .set({ emailVerified: true })
      .where(eq(userTable.email, "deja-inscrit@toko.test"));
    outbox.sent.length = 0;

    const existing = await signUp("deja-inscrit@toko.test", "Autre Nom");
    const fresh = await signUp("nouveau@toko.test");

    expect(existing.status).toBe(200);
    expect(fresh.status).toBe(200);
    const existingBody = (await existing.json()) as { token: unknown; user: unknown };
    const freshBody = (await fresh.json()) as { token: unknown; user: unknown };
    expect(existingBody.token).toBeNull();
    expect(freshBody.token).toBeNull();
    // Same fields, same types, same key order: nothing in the payload tells
    // the two apart.
    expect(shape(existingBody)).toEqual(shape(freshBody));
    expect(Object.keys(existingBody.user as object)).toEqual(
      Object.keys(freshBody.user as object),
    );
    expect(hasSessionCookie(existing)).toBe(false);
    expect(hasSessionCookie(fresh)).toBe(false);

    // The existing account is untouched and no duplicate was written.
    const rows = await db
      .select({ name: userTable.name })
      .from(userTable)
      .where(eq(userTable.email, "deja-inscrit@toko.test"));
    expect(rows).toEqual([{ name: "Parent Test" }]);

    // One email each: a verification link for the new address, a "vous
    // avez déjà un compte" note (no action link on the account) for the
    // existing one.
    const toExisting = outbox.sent.filter((m) => m.to === "deja-inscrit@toko.test");
    const toFresh = outbox.sent.filter((m) => m.to === "nouveau@toko.test");
    expect(toExisting).toHaveLength(1);
    expect(toExisting[0]!.subject).toMatch(/déjà un compte/);
    expect(toExisting[0]!.html).not.toContain("verify-email");
    expect(toFresh).toHaveLength(1);
    expect(toFresh[0]!.subject).toMatch(/Confirmez votre adresse/);
  });

  it("re-sends a verification link when the existing account is not verified yet", async () => {
    await signUp("pas-encore@toko.test");
    outbox.sent.length = 0;

    const again = await signUp("pas-encore@toko.test");

    expect(again.status).toBe(200);
    expect(outbox.sent).toHaveLength(1);
    expect(outbox.sent[0]!.html).toContain("verify-email");
  });

  it("refuses an unverified sign-in, and only after a correct password", async () => {
    await signUp("non-verifie@toko.test");

    const ok = await signIn("non-verifie@toko.test");
    expect(ok.status).toBe(403);
    expect(((await ok.json()) as { code?: string }).code).toBe("EMAIL_NOT_VERIFIED");
    expect(hasSessionCookie(ok)).toBe(false);

    const wrong = await signIn("non-verifie@toko.test", "mauvais-mot-de-passe");
    expect(wrong.status).toBe(401);
    expect(((await wrong.json()) as { code?: string }).code).toBe("INVALID_EMAIL_OR_PASSWORD");
  });

  it("verifies through the emailed link, signs the parent in and lands on the web dashboard", async () => {
    await signUp("lien@toko.test");
    const mail = outbox.sent.find((m) => m.to === "lien@toko.test");
    const href = mail?.html.match(/href="([^"]*verify-email[^"]*)"/)?.[1];
    expect(href).toBeTruthy();
    const link = new URL(href!.replaceAll("&amp;", "&"));
    expect(link.searchParams.get("callbackURL")).toMatch(/\/dashboard$/);

    const res = await app.request(`http://localhost${link.pathname}${link.search}`);

    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toMatch(/\/dashboard$/);
    expect(hasSessionCookie(res)).toBe(true);
    expect(await emailVerified("lien@toko.test")).toBe(true);
    expect((await signIn("lien@toko.test")).status).toBe(200);
  });

  it("answers a resend request identically for unknown and unverified addresses", async () => {
    await signUp("renvoi@toko.test");
    outbox.sent.length = 0;

    const known = await post("/send-verification-email", { email: "renvoi@toko.test" });
    const unknown = await post("/send-verification-email", { email: "inconnu@toko.test" });

    expect(known.status).toBe(200);
    expect(unknown.status).toBe(200);
    expect(await known.json()).toEqual(await unknown.json());
    expect(outbox.sent.map((m) => m.to)).toEqual(["renvoi@toko.test"]);
  });

  it("migration 0064 keeps accounts created before the deploy signed-in-able, and is idempotent", async () => {
    await signUp("avant-deploiement@toko.test");
    expect(await emailVerified("avant-deploiement@toko.test")).toBe(false);
    expect((await signIn("avant-deploiement@toko.test")).status).toBe(403);

    const migration = readFileSync(MIGRATION_0064, "utf8");
    await db.execute(sql.raw(migration));
    await db.execute(sql.raw(migration));

    expect(await emailVerified("avant-deploiement@toko.test")).toBe(true);
    const res = await signIn("avant-deploiement@toko.test");
    expect(res.status).toBe(200);
    expect(hasSessionCookie(res)).toBe(true);
  });
});
