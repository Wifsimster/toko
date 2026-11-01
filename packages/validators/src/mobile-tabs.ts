import { z } from "zod";

export const MOBILE_TAB_IDS = [
  "suivi",
  "barkley",
  "account",
  "report",
  "articles",
  "lexicon",
  "symptoms",
  "medications",
  "routines",
  "rewards",
  "timer",
  "insights",
  "crisis",
] as const;

export type MobileTabId = (typeof MOBILE_TAB_IDS)[number];

export const MOBILE_TABS_MIN = 1;
export const MOBILE_TABS_MAX = 3;

export const DEFAULT_MOBILE_TABS: readonly MobileTabId[] = [
  "suivi",
  "barkley",
  "account",
];

export function isMobileTabId(value: unknown): value is MobileTabId {
  return (
    typeof value === "string" &&
    (MOBILE_TAB_IDS as readonly string[]).includes(value)
  );
}

export const mobileTabsSchema = z
  .array(z.enum(MOBILE_TAB_IDS, { message: "Onglet inconnu" }))
  .min(MOBILE_TABS_MIN, "Choisissez au moins un onglet")
  .max(MOBILE_TABS_MAX, `${MOBILE_TABS_MAX} onglets au plus`)
  .refine((ids) => new Set(ids).size === ids.length, {
    message: "Chaque onglet ne peut apparaître qu'une fois",
  });

const LEGACY_MOBILE_TAB_IDS: Record<string, MobileTabId> = { journal: "suivi" };

export function resolveMobileTabs(stored: unknown): MobileTabId[] {
  if (!Array.isArray(stored)) return [...DEFAULT_MOBILE_TABS];
  const out: MobileTabId[] = [];
  for (const raw of stored) {
    const id = typeof raw === "string" ? (LEGACY_MOBILE_TAB_IDS[raw] ?? raw) : raw;
    if (isMobileTabId(id) && !out.includes(id)) out.push(id);
    if (out.length === MOBILE_TABS_MAX) break;
  }
  return out.length >= MOBILE_TABS_MIN ? out : [...DEFAULT_MOBILE_TABS];
}

export function normalizeMobileTabs(stored: unknown): MobileTabId[] | null {
  const tabs = resolveMobileTabs(stored);
  return isDefaultMobileTabs(tabs) ? null : tabs;
}

export type CachedMobileTabs = { userId: string; tabs: unknown };

export function pickMobileTabs(input: {
  userId: string | null | undefined;
  server: unknown;
  cached: CachedMobileTabs | null | undefined;
}): MobileTabId[] {
  if (input.server !== undefined) return resolveMobileTabs(input.server);
  if (input.cached && input.userId && input.cached.userId === input.userId) {
    return resolveMobileTabs(input.cached.tabs);
  }
  return [...DEFAULT_MOBILE_TABS];
}

function hasMobileTabsField(body: unknown): body is { mobileTabs: unknown } {
  return typeof body === "object" && body !== null && "mobileTabs" in body;
}

export function serverMobileTabs(body: unknown): unknown {
  return hasMobileTabsField(body) ? body.mobileTabs : undefined;
}

export type MobileTabsSaveCheck =
  | { ok: true; tabs: MobileTabId[] | null }
  | { ok: false; reason: "unsupported" | "mismatch" };

export function checkMobileTabsSaved(
  sent: readonly MobileTabId[] | null,
  response: unknown,
): MobileTabsSaveCheck {
  if (!hasMobileTabsField(response)) return { ok: false, reason: "unsupported" };
  const got = response.mobileTabs;
  if (sent === null) {
    return got === null ? { ok: true, tabs: null } : { ok: false, reason: "mismatch" };
  }
  const same =
    Array.isArray(got) && got.length === sent.length && got.every((id, i) => id === sent[i]);
  return same ? { ok: true, tabs: [...sent] } : { ok: false, reason: "mismatch" };
}

export function toggleMobileTab(
  tabs: readonly MobileTabId[],
  id: MobileTabId,
): MobileTabId[] {
  if (tabs.includes(id)) {
    return tabs.length > MOBILE_TABS_MIN ? tabs.filter((t) => t !== id) : [...tabs];
  }
  return tabs.length < MOBILE_TABS_MAX ? [...tabs, id] : [...tabs];
}

export function moveMobileTab(
  tabs: readonly MobileTabId[],
  id: MobileTabId,
  delta: -1 | 1,
): MobileTabId[] {
  return moveMobileTabTo(tabs, id, tabs.indexOf(id) + delta);
}

export function moveMobileTabTo(
  tabs: readonly MobileTabId[],
  id: MobileTabId,
  to: number,
): MobileTabId[] {
  const from = tabs.indexOf(id);
  if (from < 0 || !Number.isFinite(to)) return [...tabs];
  const target = Math.min(Math.max(Math.round(to), 0), tabs.length - 1);
  const next = tabs.filter((t) => t !== id);
  next.splice(target, 0, id);
  return next;
}

export function isDefaultMobileTabs(tabs: readonly MobileTabId[]): boolean {
  return (
    tabs.length === DEFAULT_MOBILE_TABS.length &&
    tabs.every((t, i) => t === DEFAULT_MOBILE_TABS[i])
  );
}
