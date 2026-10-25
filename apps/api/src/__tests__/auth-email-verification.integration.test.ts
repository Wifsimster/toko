// Email verification at sign-up (requireEmailVerification, lib/auth.ts), the
// pre-registration takeover it must not open, and the grandfathering
// migration 0064. Runs the real Better Auth handler on a real Postgres.
// Skips unless INTEGRATION_DB=1 (see helpers/test-db.ts).
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { eq, sql } from "drizzle-orm";
import {
  db,
  user as userTable,
  passkey,
  pushSubscriptions,
  twoFactor,
  verification,
} from "@focusflow/db";
import { app } from "../app";
import {
  createRecordingEmailProvider,
  setEmailProvider,
  type EmailPayload,
  type EmailProvider,
} from "../lib/email";
import { ensureMigrations, integrationDbAvailable, truncateAll } from "./helpers/test-db";

const MIGRATION_0064 = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../../packages/db/drizzle/0064_grandfather_email_verified.sql",
);

const PASSWORD = "mot-de-passe-test";

function post(route: string, body: unknown, cookie?: string) {
  return app.request(`http://localhost/api/auth${route}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(cookie ? { cookie } : {}) },
    body: JSON.stringify(body),
  });
}

function signUp(email: string, password = PASSWORD, name = "Parent Test") {
  return post("/sign-up/email", { name, email, password });
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

function sessionCookie(res: Response): string | null {
  // A non-empty session token cookie (sign-out style clears are empty).
  const match = (res.headers.get("set-cookie") ?? "").match(/([\w.-]*session_token)=([^;]+)/);
  return match ? `${match[1]}=${match[2]}` : null;
}

// Every cookie the response sets, as a browser would send them back
// (session_token and, if the server used a cookie cache, session_data).
function browserCookies(res: Response): string {
  return res.headers
    .getSetCookie()
    .map((c) => c.split(";")[0]!)
    .filter((c) => !c.endsWith("="))
    .join("; ");
}

// What a browser holding these cookies gets from get-session: no
// cache-bypass flag, so any server-side cookie cache would be in play.
async function sessionUser(cookie: string): Promise<unknown> {
  const res = await app.request("http://localhost/api/auth/get-session", {
    headers: { cookie },
  });
  return ((await res.json()) as { user?: unknown } | null)?.user ?? null;
}

function api(path: string, init: { cookie?: string; key?: string; method?: string; body?: unknown } = {}) {
  return app.request(`http://localhost${path}`, {
    method: init.method ?? "GET",
    headers: {
      ...(init.cookie ? { cookie: init.cookie } : {}),
      ...(init.key ? { authorization: `Bearer ${init.key}` } : {}),
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
    ...(init.body ? { body: JSON.stringify(init.body) } : {}),
  });
}

function linkIn(mail: EmailPayload | undefined, pattern: RegExp): URL {
  const href = mail?.html.match(new RegExp(`href="([^"]*${pattern.source}[^"]*)"`))?.[1];
  if (!href) throw new Error(`no ${pattern} link in ${mail?.subject ?? "(no mail)"}`);
  return new URL(href.replaceAll("&amp;", "&"));
}

function follow(link: URL) {
  return app.request(`http://localhost${link.pathname}${link.search}`);
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
  const mailsTo = (to: string) => outbox.sent.filter((m) => m.to === to);

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
    await signUp("pas-confirme@toko.test");
    outbox.sent.length = 0;

    const verified = await signUp("deja-inscrit@toko.test", PASSWORD, "Autre Nom");
    const unverified = await signUp("pas-confirme@toko.test", PASSWORD, "Autre Nom");
    const fresh = await signUp("nouveau@toko.test");

    const bodies: { token: unknown; user: object }[] = [];
    for (const res of [verified, unverified, fresh]) {
      expect(res.status).toBe(200);
      expect(sessionCookie(res)).toBeNull();
      bodies.push((await res.json()) as { token: unknown; user: object });
    }
    for (const body of bodies) {
      expect(body.token).toBeNull();
      // Same fields, same types, same key order: nothing in the payload
      // tells the three cases apart.
      expect(shape(body)).toEqual(shape(bodies[2]));
      expect(Object.keys(body.user)).toEqual(Object.keys(bodies[2]!.user));
    }

    // The existing accounts are untouched and no duplicate was written.
    const rows = await db
      .select({ name: userTable.name })
      .from(userTable)
      .where(eq(userTable.email, "deja-inscrit@toko.test"));
    expect(rows).toEqual([{ name: "Parent Test" }]);

    // One email each. Verified owner: "déjà un compte", sign-in link only.
    // Unconfirmed owner: a password-reset link, never a verification link.
    // New address: a verification link.
    expect(mailsTo("deja-inscrit@toko.test")).toHaveLength(1);
    expect(mailsTo("deja-inscrit@toko.test")[0]!.subject).toMatch(/déjà un compte/);
    expect(mailsTo("deja-inscrit@toko.test")[0]!.html).not.toContain("verify-email");
    expect(mailsTo("pas-confirme@toko.test")).toHaveLength(1);
    expect(mailsTo("pas-confirme@toko.test")[0]!.subject).toMatch(/Finalisez votre compte/);
    expect(mailsTo("pas-confirme@toko.test")[0]!.html).toContain("/reset-password?token=");
    expect(mailsTo("pas-confirme@toko.test")[0]!.html).not.toContain("verify-email");
    expect(mailsTo("nouveau@toko.test")).toHaveLength(1);
    expect(mailsTo("nouveau@toko.test")[0]!.subject).toMatch(/Confirmez votre adresse/);
  });

  it("refuses an unverified sign-in, and only after a correct password", async () => {
    await signUp("non-verifie@toko.test");

    const ok = await signIn("non-verifie@toko.test");
    expect(ok.status).toBe(403);
    expect(((await ok.json()) as { code?: string }).code).toBe("EMAIL_NOT_VERIFIED");
    expect(sessionCookie(ok)).toBeNull();

    const wrong = await signIn("non-verifie@toko.test", "mauvais-mot-de-passe");
    expect(wrong.status).toBe(401);
    expect(((await wrong.json()) as { code?: string }).code).toBe("INVALID_EMAIL_OR_PASSWORD");
  });

  it("the emailed link confirms the address without signing anyone in, then the parent signs in", async () => {
    await signUp("lien@toko.test");
    const link = linkIn(mailsTo("lien@toko.test")[0], /verify-email/);
    expect(link.searchParams.get("callbackURL")).toMatch(/\/login\?verified=1$/);

    const res = await follow(link);

    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toMatch(/\/login\?verified=1$/);
    expect(sessionCookie(res)).toBeNull();
    expect(await emailVerified("lien@toko.test")).toBe(true);
    expect((await signIn("lien@toko.test")).status).toBe(200);
  });

  it("an expired or tampered link lands on the sign-in page with an error", async () => {
    await signUp("abime@toko.test");
    const link = linkIn(mailsTo("abime@toko.test")[0], /verify-email/);
    link.searchParams.set("token", `${link.searchParams.get("token")}x`);

    const res = await follow(link);

    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toMatch(/\/login\?verified=1&error=INVALID_TOKEN$/);
    expect(await emailVerified("abime@toko.test")).toBe(false);
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

  describe("pre-registration takeover", () => {
    const VICTIM = "victime@toko.test";
    const ATTACKER_PASSWORD = "mdp-de-l-attaquant";
    const VICTIM_PASSWORD = "mdp-de-la-victime";

    it("victim signs up on a pre-registered address: the reset link hands her the account alone", async () => {
      // The attacker registers the victim's address with a password of his.
      await signUp(VICTIM, ATTACKER_PASSWORD, "Attaquant");
      outbox.sent.length = 0;

      // The victim signs up later. Same answer as any sign-up; her mailbox
      // gets "Finalisez votre compte", a password-reset link.
      const res = await signUp(VICTIM, VICTIM_PASSWORD, "Victime");
      expect(res.status).toBe(200);
      expect(sessionCookie(res)).toBeNull();
      expect(mailsTo(VICTIM)).toHaveLength(1);
      const reset = linkIn(mailsTo(VICTIM)[0], /reset-password\?token=/);

      const done = await post("/reset-password", {
        token: reset.searchParams.get("token"),
        newPassword: VICTIM_PASSWORD,
      });
      expect(done.status).toBe(200);

      // The reset proved the mailbox: the address is confirmed, the
      // attacker's password is dead, the victim's works.
      expect(await emailVerified(VICTIM)).toBe(true);
      expect((await signIn(VICTIM, ATTACKER_PASSWORD)).status).toBe(401);
      const victim = await signIn(VICTIM, VICTIM_PASSWORD);
      expect(victim.status).toBe(200);
      expect(sessionCookie(victim)).not.toBeNull();
    });

    it("victim clicks a verification link for the pre-registered account: never signed in, and her reset revokes the attacker", async () => {
      await signUp(VICTIM, ATTACKER_PASSWORD, "Attaquant");
      // The attacker (or the reminder job) has a verification link sent to
      // the victim's mailbox; she clicks it.
      outbox.sent.length = 0;
      await post("/send-verification-email", { email: VICTIM });
      const verify = await follow(linkIn(mailsTo(VICTIM)[0], /verify-email/));

      // No session: she is never signed into an account whose password a
      // third party knows.
      expect(verify.status).toBe(302);
      expect(sessionCookie(verify)).toBeNull();

      // The address is now confirmed, so the attacker can sign in…
      const attacker = await signIn(VICTIM, ATTACKER_PASSWORD);
      expect(attacker.status).toBe(200);
      const attackerCookie = browserCookies(attacker);
      expect(await sessionUser(attackerCookie)).not.toBeNull();

      // …until the victim, who has no password for it, uses "Mot de passe
      // oublié ?": the reset replaces the password and drops every session.
      outbox.sent.length = 0;
      await post("/request-password-reset", { email: VICTIM, redirectTo: "/reset-password" });
      const reset = linkIn(mailsTo(VICTIM)[0], /reset-password\?token=/);
      expect(
        (await post("/reset-password", { token: reset.searchParams.get("token"), newPassword: VICTIM_PASSWORD }))
          .status,
      ).toBe(200);

      expect(await sessionUser(attackerCookie)).toBeNull();
      expect((await signIn(VICTIM, ATTACKER_PASSWORD)).status).toBe(401);
      expect((await signIn(VICTIM, VICTIM_PASSWORD)).status).toBe(200);
    });
  });

  describe("a reset takes the account back from whoever was in it", () => {
    const VICTIM = "reprise@toko.test";
    const ATTACKER_PASSWORD = "mdp-de-l-attaquant";
    const VICTIM_PASSWORD = "mdp-de-la-victime";

    // Pre-registered by the attacker, confirmed by the victim's click on a
    // verification link: the attacker can sign in until the victim resets.
    async function attackerInside() {
      await signUp(VICTIM, ATTACKER_PASSWORD, "Attaquant");
      outbox.sent.length = 0;
      await post("/send-verification-email", { email: VICTIM });
      await follow(linkIn(mailsTo(VICTIM)[0], /verify-email/));
      const res = await signIn(VICTIM, ATTACKER_PASSWORD);
      expect(res.status).toBe(200);
      return browserCookies(res);
    }

    async function victimResets() {
      outbox.sent.length = 0;
      await post("/request-password-reset", { email: VICTIM, redirectTo: "/reset-password" });
      const reset = linkIn(mailsTo(VICTIM)[0], /reset-password\?token=/);
      const res = await post("/reset-password", {
        token: reset.searchParams.get("token"),
        newPassword: VICTIM_PASSWORD,
      });
      expect(res.status).toBe(200);
    }

    it("an agent key created before the reset is refused after it", async () => {
      const attackerCookie = await attackerInside();
      const created = await api("/api/agent-keys", {
        cookie: attackerCookie,
        method: "POST",
        body: { name: "Clé de l'attaquant" },
      });
      expect(created.status).toBe(201);
      const { secret } = (await created.json()) as { secret: string };
      expect((await api("/api/children", { key: secret })).status).toBe(200);

      await victimResets();

      expect((await api("/api/children", { key: secret })).status).toBe(401);
    });

    it("the session the reset revoked is refused on the very next request", async () => {
      const attackerCookie = await attackerInside();
      expect((await api("/api/children", { cookie: attackerCookie })).status).toBe(200);

      await victimResets();

      // Same cookies as the attacker's browser, no cache bypass.
      expect((await api("/api/children", { cookie: attackerCookie })).status).toBe(401);
      expect(
        (await api("/api/agent-keys", { cookie: attackerCookie, method: "POST", body: { name: "Après" } }))
          .status,
      ).toBe(401);
      expect(await sessionUser(attackerCookie)).toBeNull();
    });

    it("passkeys, trusted devices, push subscriptions and 2FA enrolled before the proof are removed", async () => {
      await signUp(VICTIM, ATTACKER_PASSWORD, "Attaquant");
      const [row] = await db.select({ id: userTable.id }).from(userTable).where(eq(userTable.email, VICTIM));
      const userId = row!.id;
      // verification rows have no FK to the user and survive truncateAll:
      // unique ids keep reruns on the same database independent.
      const trustId = `trust-device-${crypto.randomUUID()}`;
      await db.insert(passkey).values({
        id: crypto.randomUUID(), userId, publicKey: "pk", credentialID: "cred", counter: 0, deviceType: "singleDevice", backedUp: false,
      });
      await db.insert(verification).values({
        id: crypto.randomUUID(), identifier: trustId, value: userId, expiresAt: new Date(Date.now() + 86_400_000),
      });
      await db.insert(pushSubscriptions).values({ userId, endpoint: "https://push.example.test/1", p256dh: "p", authKey: "a" });
      await db.insert(twoFactor).values({ id: crypto.randomUUID(), userId, secret: "s", backupCodes: "b" });
      await db.update(userTable).set({ twoFactorEnabled: true }).where(eq(userTable.id, userId));

      await victimResets();

      expect(await db.select().from(passkey).where(eq(passkey.userId, userId))).toEqual([]);
      expect(await db.select().from(verification).where(eq(verification.identifier, trustId))).toEqual([]);
      expect(await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId))).toEqual([]);
      expect(await db.select().from(twoFactor).where(eq(twoFactor.userId, userId))).toEqual([]);
      const [after] = await db
        .select({ verified: userTable.emailVerified, twoFactorEnabled: userTable.twoFactorEnabled })
        .from(userTable)
        .where(eq(userTable.id, userId));
      expect(after).toEqual({ verified: true, twoFactorEnabled: false });
      expect((await signIn(VICTIM, VICTIM_PASSWORD)).status).toBe(200);
    });

    it("on an already confirmed account, a reset keeps the parent's 2FA", async () => {
      await signUp(VICTIM, ATTACKER_PASSWORD, "Parent");
      await db.update(userTable).set({ emailVerified: true, twoFactorEnabled: true }).where(eq(userTable.email, VICTIM));
      const [row] = await db.select({ id: userTable.id }).from(userTable).where(eq(userTable.email, VICTIM));
      await db.insert(twoFactor).values({ id: "tf-2", userId: row!.id, secret: "s", backupCodes: "b" });

      await victimResets();

      expect(await db.select({ id: twoFactor.id }).from(twoFactor).where(eq(twoFactor.userId, row!.id))).toEqual([
        { id: "tf-2" },
      ]);
    });
  });

  it("migration 0064 unblocks accounts created before its cutoff, never later ones, and is idempotent", async () => {
    await signUp("avant-deploiement@toko.test");
    await signUp("apres-deploiement@toko.test");
    await db
      .update(userTable)
      .set({ createdAt: new Date("2026-10-01T10:00:00Z") })
      .where(eq(userTable.email, "avant-deploiement@toko.test"));
    await db
      .update(userTable)
      .set({ createdAt: new Date("2026-10-27T10:00:00Z") })
      .where(eq(userTable.email, "apres-deploiement@toko.test"));
    expect((await signIn("avant-deploiement@toko.test")).status).toBe(403);

    const migration = readFileSync(MIGRATION_0064, "utf8");
    await db.execute(sql.raw(migration));
    await db.execute(sql.raw(migration));

    expect(await emailVerified("avant-deploiement@toko.test")).toBe(true);
    const res = await signIn("avant-deploiement@toko.test");
    expect(res.status).toBe(200);
    expect(sessionCookie(res)).not.toBeNull();
    // A replay after the deploy leaves new-rule accounts alone.
    expect(await emailVerified("apres-deploiement@toko.test")).toBe(false);
  });
});
