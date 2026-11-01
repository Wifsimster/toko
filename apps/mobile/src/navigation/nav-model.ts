import {
  DEFAULT_MOBILE_TABS,
  MOBILE_TAB_IDS,
  MORE_GROUPS,
  MORE_NAV,
  PRIMARY_NAV,
  isMobileTabId,
  type MobileTabId,
  type MoreGroupKey,
} from "@focusflow/validators";
import { nav as navCopy, plus as plusCopy } from "../lib/copy";

export type MiddleTabRoute =
  | "SuiviTab"
  | "BarkleyTab"
  | "CompteTab"
  | "RapportTab"
  | "ArticlesTab"
  | "LexiqueTab"
  | "SymptomesTab"
  | "MedicamentsTab"
  | "RoutinesTab"
  | "RecompensesTab"
  | "MinuteurTab"
  | "InsightsTab"
  | "CriseTab";

export type TabRoute = "AccueilTab" | MiddleTabRoute | "PlusTab";

export type TabRoot =
  | "Journal"
  | "Barkley"
  | "Settings"
  | "Report"
  | "Connaissances"
  | "Lexique"
  | "Symptoms"
  | "Medications"
  | "Routines"
  | "Rewards"
  | "Timer"
  | "Insights"
  | "CrisisList";

export const label = (key: string): string => navCopy.labels[key] ?? key;

type TabPlace = {
  route: MiddleTabRoute;
  root: TabRoot;
  child: boolean;
  icon: string;
  titleKey: string;
  shortKey: string;
};

const TAB_PLACES: Record<MobileTabId, TabPlace> = {
  suivi: { route: "SuiviTab", root: "Journal", child: false, icon: "NotebookPen", titleKey: "nav.journal", shortKey: "nav.trackingShort" },
  barkley: { route: "BarkleyTab", root: "Barkley", child: true, icon: "ClipboardList", titleKey: "nav.barkley", shortKey: "nav.barkleyShort" },
  account: { route: "CompteTab", root: "Settings", child: false, icon: "UserCog", titleKey: "nav.account", shortKey: "nav.accountShort" },
  report: { route: "RapportTab", root: "Report", child: true, icon: "FileText", titleKey: "nav.report", shortKey: "nav.report" },
  articles: { route: "ArticlesTab", root: "Connaissances", child: false, icon: "Newspaper", titleKey: "nav.articles", shortKey: "nav.articles" },
  lexicon: { route: "LexiqueTab", root: "Lexique", child: false, icon: "BookA", titleKey: "nav.lexicon", shortKey: "nav.lexicon" },
  symptoms: { route: "SymptomesTab", root: "Symptoms", child: false, icon: "Activity", titleKey: "nav.symptoms", shortKey: "nav.symptoms" },
  medications: { route: "MedicamentsTab", root: "Medications", child: true, icon: "Pill", titleKey: "nav.medications", shortKey: "nav.medicationsShort" },
  routines: { route: "RoutinesTab", root: "Routines", child: false, icon: "ListChecks", titleKey: "nav.routines", shortKey: "nav.routines" },
  rewards: { route: "RecompensesTab", root: "Rewards", child: true, icon: "Trophy", titleKey: "nav.rewards", shortKey: "nav.rewardsShort" },
  timer: { route: "MinuteurTab", root: "Timer", child: false, icon: "Timer", titleKey: "nav.timer", shortKey: "nav.timer" },
  insights: { route: "InsightsTab", root: "Insights", child: true, icon: "TrendingUp", titleKey: "nav.insights", shortKey: "nav.insights" },
  crisis: { route: "CriseTab", root: "CrisisList", child: true, icon: "HandHeart", titleKey: "nav.crisisList", shortKey: "nav.crisis" },
};

export type TabDef = {
  id: MobileTabId;
  route: MiddleTabRoute;
  root: TabRoot;
  child: boolean;
  icon: string;
  title: string;
  short: string;
  description: string;
};

export const TAB_DEFS = Object.fromEntries(
  MOBILE_TAB_IDS.map((id): [MobileTabId, TabDef] => {
    const place = TAB_PLACES[id];
    return [
      id,
      {
        id,
        route: place.route,
        root: place.root,
        child: place.child,
        icon: place.icon,
        title: label(place.titleKey),
        short: label(place.shortKey),
        description: plusCopy.descriptions[id],
      },
    ];
  }),
) as Record<MobileTabId, TabDef>;

export const MIDDLE_TAB_ROUTES: readonly MiddleTabRoute[] = MOBILE_TAB_IDS.map(
  (id) => TAB_PLACES[id].route,
);

export type PlusGroupKey = MoreGroupKey;

export type PlusGroup = { key: PlusGroupKey; title: string; items: TabDef[] };

export const PLUS_GROUPS: readonly PlusGroup[] = MORE_GROUPS.map((group) => ({
  key: group.key,
  title: plusCopy.groups[group.key],
  items: group.ids.filter(isMobileTabId).map((id) => TAB_DEFS[id]),
}));

export type BarTab = {
  route: TabRoute;
  id: MobileTabId | null;
  icon: string;
  title: string;
};

const HOME_NAV = PRIMARY_NAV.find((item) => item.to === "/dashboard");

export function bottomBar(tabs: readonly MobileTabId[] = DEFAULT_MOBILE_TABS): BarTab[] {
  if (!HOME_NAV) throw new Error("Aucun onglet mobile pour /dashboard");
  return [
    { route: "AccueilTab", id: null, icon: HOME_NAV.icon, title: label(HOME_NAV.shortLabelKey) },
    ...tabs.map((id): BarTab => {
      const def = TAB_DEFS[id];
      return { route: def.route, id, icon: def.icon, title: def.short };
    }),
    { route: "PlusTab", id: null, icon: MORE_NAV.icon, title: label(MORE_NAV.labelKey) },
  ];
}

export function hiddenTabRoutes(tabs: readonly MobileTabId[]): MiddleTabRoute[] {
  return MOBILE_TAB_IDS.filter((id) => !tabs.includes(id)).map((id) => TAB_PLACES[id].route);
}

export type SectionTarget = { route: TabRoute; screen: TabRoot; initial: boolean; child: boolean };

export function sectionTarget(tabs: readonly MobileTabId[], id: MobileTabId): SectionTarget {
  const def = TAB_DEFS[id];
  if (tabs.includes(id)) return { route: def.route, screen: def.root, initial: true, child: def.child };
  return { route: "PlusTab", screen: def.root, initial: false, child: def.child };
}
