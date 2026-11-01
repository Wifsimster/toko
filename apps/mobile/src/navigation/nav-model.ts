import {
  DEFAULT_MOBILE_TABS,
  HUB_GROUPS,
  HUB_ITEMS,
  MOBILE_TAB_IDS,
  MORE_NAV,
  PRIMARY_NAV,
  type AppNavTarget,
  type HubGroupKey,
  type MobileTabId,
} from "@focusflow/validators";
import { menuBar as menuBarCopy, nav as navCopy } from "../lib/copy";

export type MiddleTabRoute =
  | "SuiviTab"
  | "BarkleyTab"
  | "CompteTab"
  | "RapportTab"
  | "ArticlesTab"
  | "LexiqueTab"
  | "JournalTab"
  | "SymptomesTab"
  | "MedicamentsTab"
  | "RoutinesTab"
  | "RecompensesTab"
  | "MinuteurTab"
  | "InsightsTab"
  | "CriseTab";

export type TabRoute = "AccueilTab" | MiddleTabRoute | "PlusTab";

export type SectionRoot =
  | "Connaissances"
  | "Lexique"
  | "Journal"
  | "Symptoms"
  | "Medications"
  | "Routines"
  | "Rewards"
  | "Timer"
  | "Insights"
  | "CrisisList";

export const SECTION_BY_TARGET: Partial<Record<AppNavTarget, { root: SectionRoot; child: boolean }>> = {
  "/connaissances": { root: "Connaissances", child: false },
  "/lexique": { root: "Lexique", child: false },
  "/journal": { root: "Journal", child: false },
  "/symptoms": { root: "Symptoms", child: false },
  "/medications": { root: "Medications", child: true },
  "/routines": { root: "Routines", child: false },
  "/rewards": { root: "Rewards", child: true },
  "/timer": { root: "Timer", child: false },
  "/insights": { root: "Insights", child: true },
  "/crisis-list": { root: "CrisisList", child: true },
};

export const label = (key: string): string => navCopy.labels[key] ?? key;

export type TabRoot = SectionRoot | "SuiviHub" | "Barkley" | "Settings" | "Report";

type TabPlace = { route: MiddleTabRoute; root: TabRoot; child: boolean; to: AppNavTarget | null };

const TAB_PLACES: Record<MobileTabId, TabPlace> = {
  suivi: { route: "SuiviTab", root: "SuiviHub", child: false, to: "/suivi" },
  barkley: { route: "BarkleyTab", root: "Barkley", child: true, to: "/barkley" },
  account: { route: "CompteTab", root: "Settings", child: false, to: "/account" },
  report: { route: "RapportTab", root: "Report", child: true, to: null },
  articles: { route: "ArticlesTab", root: "Connaissances", child: false, to: "/connaissances" },
  lexicon: { route: "LexiqueTab", root: "Lexique", child: false, to: "/lexique" },
  journal: { route: "JournalTab", root: "Journal", child: false, to: "/journal" },
  symptoms: { route: "SymptomesTab", root: "Symptoms", child: false, to: "/symptoms" },
  medications: { route: "MedicamentsTab", root: "Medications", child: true, to: "/medications" },
  routines: { route: "RoutinesTab", root: "Routines", child: false, to: "/routines" },
  rewards: { route: "RecompensesTab", root: "Rewards", child: true, to: "/rewards" },
  timer: { route: "MinuteurTab", root: "Timer", child: false, to: "/timer" },
  insights: { route: "InsightsTab", root: "Insights", child: true, to: "/insights" },
  crisis: { route: "CriseTab", root: "CrisisList", child: true, to: "/crisis-list" },
};

export type MenuBarGroupKey = "main" | HubGroupKey;

export type TabDef = TabPlace & {
  id: MobileTabId;
  icon: string;
  title: string;
  short: string;
  group: MenuBarGroupKey;
  inHub: boolean;
};

function defineTab(id: MobileTabId): TabDef {
  const place = TAB_PLACES[id];
  const primary = PRIMARY_NAV.find((item) => item.to === place.to);
  if (primary) {
    return {
      ...place,
      id,
      icon: primary.icon,
      title: label(primary.labelKey),
      short: label(primary.shortLabelKey),
      group: "main",
      inHub: false,
    };
  }
  const hub = HUB_ITEMS.find((item) => item.to === place.to);
  if (hub) {
    const title = label(hub.labelKey);
    return {
      ...place,
      id,
      icon: hub.icon,
      title,
      short: menuBarCopy.short[id] ?? title,
      group: hub.hubGroup,
      inHub: true,
    };
  }
  const title = label("nav.report");
  return { ...place, id, icon: "FileText", title, short: title, group: "main", inHub: false };
}

export const TAB_DEFS = Object.fromEntries(
  MOBILE_TAB_IDS.map((id) => [id, defineTab(id)]),
) as Record<MobileTabId, TabDef>;

export const MIDDLE_TAB_ROUTES: readonly MiddleTabRoute[] = MOBILE_TAB_IDS.map(
  (id) => TAB_PLACES[id].route,
);

export const MENU_BAR_GROUPS: readonly { key: MenuBarGroupKey; title: string }[] = [
  { key: "main", title: menuBarCopy.mainGroup },
  ...HUB_GROUPS.map((group) => ({ key: group.key, title: label(group.labelKey) })),
];

export type BarTab = {
  route: TabRoute;
  id: MobileTabId | null;
  to: AppNavTarget | null;
  icon: string;
  title: string;
};

const HOME_NAV = PRIMARY_NAV.find((item) => item.to === "/dashboard");

export function bottomBar(tabs: readonly MobileTabId[] = DEFAULT_MOBILE_TABS): BarTab[] {
  if (!HOME_NAV) throw new Error("Aucun onglet mobile pour /dashboard");
  return [
    { route: "AccueilTab", id: null, to: HOME_NAV.to, icon: HOME_NAV.icon, title: label(HOME_NAV.shortLabelKey) },
    ...tabs.map((id): BarTab => {
      const def = TAB_DEFS[id];
      return { route: def.route, id, to: def.to, icon: def.icon, title: def.short };
    }),
    { route: "PlusTab", id: null, to: null, icon: MORE_NAV.icon, title: label(MORE_NAV.labelKey) },
  ];
}

export function hiddenTabRoutes(tabs: readonly MobileTabId[]): MiddleTabRoute[] {
  return MOBILE_TAB_IDS.filter((id) => !tabs.includes(id)).map((id) => TAB_PLACES[id].route);
}

export type SectionTarget = { route: TabRoute; screen: TabRoot; initial: boolean; child: boolean };

export function sectionTarget(tabs: readonly MobileTabId[], id: MobileTabId): SectionTarget {
  const def = TAB_DEFS[id];
  if (tabs.includes(id)) return { route: def.route, screen: def.root, initial: true, child: def.child };
  if (def.inHub && tabs.includes("suivi")) {
    return { route: "SuiviTab", screen: def.root, initial: false, child: def.child };
  }
  return { route: "PlusTab", screen: def.root, initial: false, child: def.child };
}

const PLUS_CANDIDATES: readonly MobileTabId[] = ["suivi", "barkley", "account", "report"];

export function plusScreens(tabs: readonly MobileTabId[]): TabDef[] {
  return PLUS_CANDIDATES.filter((id) => !tabs.includes(id)).map((id) => TAB_DEFS[id]);
}

export type HubRow = {
  to: AppNavTarget;
  root: SectionRoot;
  child: boolean;
  icon: string;
  title: string;
  description: string;
};

export type HubSection = { key: HubGroupKey; title: string; rows: HubRow[] };

export function hubSections(): HubSection[] {
  return HUB_GROUPS.map((group) => ({
    key: group.key,
    title: label(group.labelKey),
    rows: HUB_ITEMS.flatMap((item): HubRow[] => {
      const section = SECTION_BY_TARGET[item.to];
      if (item.hubGroup !== group.key || !section) return [];
      return [
        {
          to: item.to,
          root: section.root,
          child: section.child,
          icon: item.icon,
          title: label(item.labelKey),
          description: label(item.descriptionKey),
        },
      ];
    }),
  })).filter((section) => section.rows.length > 0);
}

export const SUIVI_TITLE = label("suiviHub.title");
export const SUIVI_SUBTITLE = label("suiviHub.subtitle");
