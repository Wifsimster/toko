import { vi } from "vitest";

vi.mock("../middleware/auth", async () => {
  const { testAuthMiddleware, testRequireSession } = await import(
    "./helpers/auth-mock"
  );
  return {
    authMiddleware: testAuthMiddleware,
    requireSession: testRequireSession,
  };
});

import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { db, userPreferences } from "@focusflow/db";
import { checkMobileTabsSaved, pickMobileTabs, resolveMobileTabs, serverMobileTabs } from "@focusflow/validators";
import { app } from "../app";
import { ensureMigrations, integrationDbAvailable, truncateAll } from "./helpers/test-db";
import { createUser } from "./helpers/fixtures";
import { TEST_USER_HEADER } from "./helpers/auth-mock";

function req(userId: string, method = "GET", body?: unknown) {
  return app.request("/api/preferences", {
    method,
    headers: { "Content-Type": "application/json", [TEST_USER_HEADER]: userId },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

async function storedTabs(userId: string) {
  const [row] = await db
    .select({ mobileTabs: userPreferences.mobileTabs })
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId));
  return row?.mobileTabs;
}

describe.skipIf(!integrationDbAvailable)("preferences — mobileTabs", () => {
  beforeAll(async () => {
    await ensureMigrations();
  });

  afterEach(async () => {
    await truncateAll();
  });

  it("GET without a row returns mobileTabs: null (default bar)", async () => {
    const u = await createUser();
    const res = await req(u.id);
    expect(res.status).toBe(200);
    expect((await res.json()).mobileTabs).toBeNull();
  });

  it("PATCH stores the order, GET reads it back", async () => {
    const u = await createUser();
    const res = await req(u.id, "PATCH", { mobileTabs: ["symptoms", "articles"] });
    expect(res.status).toBe(200);
    expect(await storedTabs(u.id)).toEqual(["symptoms", "articles"]);

    const get = await (await req(u.id)).json();
    expect(get.mobileTabs).toEqual(["symptoms", "articles"]);
    expect(get.dailyReminderOptIn).toBe(false);
  });

  it("the app accepts the PATCH answer and shows the saved bar from GET", async () => {
    const u = await createUser();
    const sent = ["crisis", "insights"] as const;
    const patched = await (await req(u.id, "PATCH", { mobileTabs: sent })).json();
    expect(checkMobileTabsSaved(sent, patched)).toEqual({ ok: true, tabs: [...sent] });

    const got = await (await req(u.id)).json();
    const server = serverMobileTabs(got);
    expect(
      pickMobileTabs({ userId: u.id, server, cached: { userId: u.id, tabs: ["timer"] } }),
    ).toEqual([...sent]);

    const reset = await (await req(u.id, "PATCH", { mobileTabs: null })).json();
    expect(checkMobileTabsSaved(null, reset)).toEqual({ ok: true, tabs: null });
  });

  it("PATCH accepts the pages added to the catalogue (crise, récompenses, Barkley)", async () => {
    const u = await createUser();
    const res = await req(u.id, "PATCH", { mobileTabs: ["crisis", "rewards"] });
    expect(res.status).toBe(200);
    expect(await storedTabs(u.id)).toEqual(["crisis", "rewards"]);
    await req(u.id, "PATCH", { mobileTabs: ["barkley"] });
    expect(await storedTabs(u.id)).toEqual(["barkley"]);
  });

  it("PATCH null resets to the default bar", async () => {
    const u = await createUser();
    await req(u.id, "PATCH", { mobileTabs: ["insights"] });
    const res = await req(u.id, "PATCH", { mobileTabs: null });
    expect(res.status).toBe(200);
    expect(await storedTabs(u.id)).toBeNull();
  });

  it("PATCH from an older app with 3 tabs is stored and echoed, so its save check passes", async () => {
    const u = await createUser();
    const res = await req(u.id, "PATCH", { mobileTabs: ["articles", "routines", "timer"] });
    expect(res.status).toBe(200);
    expect((await res.json()).mobileTabs).toEqual(["articles", "routines", "timer"]);
    expect(await storedTabs(u.id)).toEqual(["articles", "routines", "timer"]);
  });

  it("PATCH on another setting leaves the bar alone", async () => {
    const u = await createUser();
    await req(u.id, "PATCH", { mobileTabs: ["timer", "insights"] });
    await req(u.id, "PATCH", { weeklyDigestOptIn: true });
    expect(await storedTabs(u.id)).toEqual(["timer", "insights"]);
  });

  it.each([
    ["an empty list", []],
    ["more than 3 tabs", ["articles", "routines", "timer", "report"]],
    ["an unknown id", ["articles", "settings"]],
    ["a fixed end", ["home", "timer"]],
    ["a duplicate", ["timer", "timer"]],
    ["a non-array", "articles"],
  ])("PATCH rejects %s with 422 and stores nothing", async (_label, mobileTabs) => {
    const u = await createUser();
    const res = await req(u.id, "PATCH", { mobileTabs });
    expect(res.status).toBe(422);
    expect(await storedTabs(u.id)).toBeUndefined();
  });

  it("GET drops ids stored by an older version and never echoes them", async () => {
    const u = await createUser();
    await db.insert(userPreferences).values({ userId: u.id, mobileTabs: ["calm", "insights", "future-tab"] });
    expect((await (await req(u.id)).json()).mobileTabs).toEqual(["insights"]);

    const patched = await (await req(u.id, "PATCH", { weeklyDigestOptIn: true })).json();
    expect(patched.mobileTabs).toEqual(["insights"]);
  });

  it("GET returns a bar saved with three tabs as is; the new app shows the first two", async () => {
    const u = await createUser();
    await db.insert(userPreferences).values({ userId: u.id, mobileTabs: ["crisis", "rewards", "barkley"] });
    const tabs = (await (await req(u.id)).json()).mobileTabs;
    expect(tabs).toEqual(["crisis", "rewards", "barkley"]);
    expect(resolveMobileTabs(tabs)).toEqual(["crisis", "rewards"]);
  });

  it("GET reads a list with nothing usable left as the default bar", async () => {
    const u = await createUser();
    await db.insert(userPreferences).values({ userId: u.id, mobileTabs: ["calm"] });
    expect((await (await req(u.id)).json()).mobileTabs).toBeNull();
  });

  it("PATCH accepts the destinations of the redesigned bar (Suivi, Compte, Lexique)", async () => {
    const u = await createUser();
    const res = await req(u.id, "PATCH", { mobileTabs: ["account", "lexicon"] });
    expect(res.status).toBe(200);
    expect((await (await req(u.id)).json()).mobileTabs).toEqual(["account", "lexicon"]);
    await req(u.id, "PATCH", { mobileTabs: ["suivi"] });
    expect((await (await req(u.id)).json()).mobileTabs).toEqual(["suivi"]);
  });

  it("each account keeps its own bar", async () => {
    const a = await createUser();
    const b = await createUser();
    await req(a.id, "PATCH", { mobileTabs: ["insights"] });
    expect((await (await req(b.id)).json()).mobileTabs).toBeNull();
  });
});
