import {
  HUB_GROUPS,
  HUB_ITEMS,
  MORE_NAV,
  PRIMARY_NAV,
  type AppNavTarget,
  type HubGroupKey,
} from "@focusflow/validators";
import { nav as navCopy } from "../lib/copy";

export type TabRoute = "AccueilTab" | "SuiviTab" | "BarkleyTab" | "CompteTab" | "PlusTab";

export const TAB_ROUTE_BY_TARGET: Partial<Record<AppNavTarget, TabRoute>> = {
  "/dashboard": "AccueilTab",
  "/suivi": "SuiviTab",
  "/barkley": "BarkleyTab",
  "/account": "CompteTab",
};

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

export type SectionId =
  | "articles"
  | "barkley"
  | "timer"
  | "journal"
  | "symptoms"
  | "routines"
  | "medications"
  | "calm"
  | "insights"
  | "report"
  | "crisis"
  | "rewards";

export const SECTIONS: Record<SectionId, { route: TabRoute; root: string; child: boolean }> = {
  articles: { route: "SuiviTab", root: "Connaissances", child: false },
  barkley: { route: "BarkleyTab", root: "Barkley", child: true },
  timer: { route: "SuiviTab", root: "Timer", child: false },
  journal: { route: "SuiviTab", root: "Journal", child: false },
  symptoms: { route: "SuiviTab", root: "Symptoms", child: false },
  routines: { route: "SuiviTab", root: "Routines", child: false },
  medications: { route: "SuiviTab", root: "Medications", child: true },
  calm: { route: "PlusTab", root: "CalmMinutes", child: true },
  insights: { route: "SuiviTab", root: "Insights", child: true },
  report: { route: "PlusTab", root: "Report", child: true },
  crisis: { route: "SuiviTab", root: "CrisisList", child: true },
  rewards: { route: "SuiviTab", root: "Rewards", child: true },
};

export const label = (key: string): string => navCopy.labels[key] ?? key;

export type BarTab = { route: TabRoute; to: AppNavTarget | null; icon: string; title: string };

export function bottomBar(): BarTab[] {
  const fixed: BarTab[] = PRIMARY_NAV.map((item) => {
    const route = TAB_ROUTE_BY_TARGET[item.to];
    if (!route) throw new Error(`Aucun onglet mobile pour ${item.to}`);
    return { route, to: item.to, icon: item.icon, title: label(item.shortLabelKey) };
  });
  return [...fixed, { route: "PlusTab", to: null, icon: MORE_NAV.icon, title: label(MORE_NAV.labelKey) }];
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

export const PLUS_SCREENS = [
  { root: "Report", icon: "FileText", title: label("nav.report"), child: true },
  { root: "CalmMinutes", icon: "Leaf", title: navCopy.calmMinutes, child: true },
] as const;

export const SUIVI_TITLE = label("suiviHub.title");
export const SUIVI_SUBTITLE = label("suiviHub.subtitle");
