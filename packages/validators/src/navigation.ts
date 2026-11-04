import type { MobileTabId } from "./mobile-tabs";

export type AppNavTarget =
  | "/dashboard"
  | "/barkley"
  | "/account"
  | "/journal"
  | "/symptoms"
  | "/medications"
  | "/routines"
  | "/rewards"
  | "/timer"
  | "/insights"
  | "/report"
  | "/crisis-list"
  | "/connaissances"
  | "/lexique"
  | "/quiz";

export type PrimaryNavEntry = {
  to: AppNavTarget;
  labelKey: string;
  shortLabelKey: string;
  icon: string;
};

export const PRIMARY_NAV: readonly PrimaryNavEntry[] = [
  { to: "/dashboard", labelKey: "nav.today", shortLabelKey: "nav.home", icon: "BarChart3" },
  { to: "/journal", labelKey: "nav.tracking", shortLabelKey: "nav.trackingShort", icon: "NotebookPen" },
  { to: "/barkley", labelKey: "nav.barkley", shortLabelKey: "nav.barkleyShort", icon: "ClipboardList" },
];

export const MORE_NAV = { to: "/plus", labelKey: "nav.more", icon: "Menu" } as const;

export type MoreEntryId = MobileTabId | "quiz";

export type MoreEntry = {
  id: MoreEntryId;
  to: AppNavTarget;
  labelKey: string;
  descriptionKey: string;
  icon: string;
};

const entry = (id: MoreEntryId, to: AppNavTarget, labelKey: string, icon: string): MoreEntry => ({
  id,
  to,
  labelKey,
  descriptionKey: `more.desc.${id}`,
  icon,
});

export const MORE_ENTRIES: Readonly<Record<MoreEntryId, MoreEntry>> = {
  suivi: entry("suivi", "/journal", "nav.journal", "NotebookPen"),
  symptoms: entry("symptoms", "/symptoms", "nav.symptoms", "Activity"),
  medications: entry("medications", "/medications", "nav.medications", "Pill"),
  routines: entry("routines", "/routines", "nav.routines", "ListChecks"),
  barkley: entry("barkley", "/barkley", "nav.barkley", "ClipboardList"),
  rewards: entry("rewards", "/rewards", "nav.rewards", "Trophy"),
  timer: entry("timer", "/timer", "nav.timer", "Timer"),
  insights: entry("insights", "/insights", "nav.insights", "TrendingUp"),
  report: entry("report", "/report", "nav.report", "FileText"),
  articles: entry("articles", "/connaissances", "nav.articles", "Newspaper"),
  lexicon: entry("lexicon", "/lexique", "nav.lexicon", "BookA"),
  quiz: entry("quiz", "/quiz", "nav.quiz", "Compass"),
  crisis: entry("crisis", "/crisis-list", "nav.crisisList", "HandHeart"),
  account: entry("account", "/account", "nav.account", "UserCog"),
};

export type MoreGroupKey = "daily" | "tools" | "understand" | "help" | "account";

export type MoreGroup = { key: MoreGroupKey; labelKey: string; ids: readonly MoreEntryId[] };

export const MORE_GROUPS: readonly MoreGroup[] = [
  { key: "daily", labelKey: "more.groups.daily", ids: ["suivi", "symptoms", "medications", "routines"] },
  { key: "tools", labelKey: "more.groups.tools", ids: ["barkley", "rewards", "timer", "insights", "report"] },
  { key: "understand", labelKey: "more.groups.understand", ids: ["articles", "lexicon", "quiz"] },
  { key: "help", labelKey: "more.groups.help", ids: ["crisis"] },
  { key: "account", labelKey: "more.groups.account", ids: ["account"] },
];
