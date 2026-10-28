import { z } from "zod";

/**
 * Barre d'onglets de l'app Android (apps/mobile), choisie par compte.
 *
 * Accueil (premier) et Plus (dernier) sont fixes : ils ne figurent pas dans
 * la liste enregistrée. Le parent choisit et ordonne de 1 à 3 onglets du
 * milieu dans ce catalogue. Tout écran reste joignable par Plus, quel que
 * soit le choix.
 *
 * Ajouter un identifiant ici suffit côté données : une ancienne version de
 * l'app ignore les identifiants qu'elle ne connaît pas (`resolveMobileTabs`).
 */
export const MOBILE_TAB_IDS = [
  "articles",
  "routines",
  "timer",
  "journal",
  "symptoms",
  "medications",
] as const;

export type MobileTabId = (typeof MOBILE_TAB_IDS)[number];

export const MOBILE_TABS_MIN = 1;
export const MOBILE_TABS_MAX = 3;

/** Barre par défaut : Accueil, Articles, Routines, Minuteur, Plus. */
export const DEFAULT_MOBILE_TABS: readonly MobileTabId[] = [
  "articles",
  "routines",
  "timer",
];

export function isMobileTabId(value: unknown): value is MobileTabId {
  return (
    typeof value === "string" &&
    (MOBILE_TAB_IDS as readonly string[]).includes(value)
  );
}

/** Ce que l'API accepte : identifiants connus, sans doublon, de 1 à 3. */
export const mobileTabsSchema = z
  .array(z.enum(MOBILE_TAB_IDS, { message: "Onglet inconnu" }))
  .min(MOBILE_TABS_MIN, "Choisissez au moins un onglet")
  .max(MOBILE_TABS_MAX, `${MOBILE_TABS_MAX} onglets au plus`)
  .refine((ids) => new Set(ids).size === ids.length, {
    message: "Chaque onglet ne peut apparaître qu'une fois",
  });

/**
 * Lit une valeur enregistrée (API ou cache local) sans jamais échouer :
 * ignore les identifiants inconnus (version plus récente) ou les doublons,
 * garde au plus 3 onglets et retombe sur la barre par défaut si rien
 * d'utilisable ne reste (null, liste vide, valeur corrompue).
 */
export function resolveMobileTabs(stored: unknown): MobileTabId[] {
  if (!Array.isArray(stored)) return [...DEFAULT_MOBILE_TABS];
  const out: MobileTabId[] = [];
  for (const id of stored) {
    if (isMobileTabId(id) && !out.includes(id)) out.push(id);
    if (out.length === MOBILE_TABS_MAX) break;
  }
  return out.length >= MOBILE_TABS_MIN ? out : [...DEFAULT_MOBILE_TABS];
}

/** Valeur mise en cache sur le téléphone, liée au compte qui l'a écrite. */
export type CachedMobileTabs = { userId: string; tabs: unknown };

/**
 * La barre à afficher : la valeur du serveur dès qu'elle est connue, sinon le
 * cache local du même compte (démarrage, hors ligne), sinon la barre par
 * défaut. Un cache écrit par un autre compte sur le même téléphone est ignoré.
 */
export function pickMobileTabs(input: {
  userId: string | null | undefined;
  /** `undefined` tant que le serveur n'a pas répondu ; `null` = défaut. */
  server: unknown;
  cached: CachedMobileTabs | null | undefined;
}): MobileTabId[] {
  if (input.server !== undefined) return resolveMobileTabs(input.server);
  if (input.cached && input.userId && input.cached.userId === input.userId) {
    return resolveMobileTabs(input.cached.tabs);
  }
  return [...DEFAULT_MOBILE_TABS];
}

/** Ajoute (à la fin) ou retire un onglet ; refuse de passer sous 1 ou au-dessus de 3. */
export function toggleMobileTab(
  tabs: readonly MobileTabId[],
  id: MobileTabId,
): MobileTabId[] {
  if (tabs.includes(id)) {
    return tabs.length > MOBILE_TABS_MIN ? tabs.filter((t) => t !== id) : [...tabs];
  }
  return tabs.length < MOBILE_TABS_MAX ? [...tabs, id] : [...tabs];
}

/** Déplace un onglet d'un cran (-1 vers la gauche, +1 vers la droite). */
export function moveMobileTab(
  tabs: readonly MobileTabId[],
  id: MobileTabId,
  delta: -1 | 1,
): MobileTabId[] {
  return moveMobileTabTo(tabs, id, tabs.indexOf(id) + delta);
}

/**
 * Place un onglet à la position `to` (0 = juste après Accueil) et décale les
 * autres ; une position hors de la liste est ramenée au bord le plus proche.
 * Sert au glisser-déposer, où `to` vient du doigt et peut déborder.
 */
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

/** Vrai si la liste équivaut à la barre par défaut (même ordre). */
export function isDefaultMobileTabs(tabs: readonly MobileTabId[]): boolean {
  return (
    tabs.length === DEFAULT_MOBILE_TABS.length &&
    tabs.every((t, i) => t === DEFAULT_MOBILE_TABS[i])
  );
}
