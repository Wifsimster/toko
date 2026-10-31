export type AppNavTarget =
  | "/dashboard"
  | "/suivi"
  | "/barkley"
  | "/account"
  | "/journal"
  | "/symptoms"
  | "/medications"
  | "/routines"
  | "/rewards"
  | "/timer"
  | "/insights"
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
  { to: "/suivi", labelKey: "nav.tracking", shortLabelKey: "nav.trackingShort", icon: "NotebookPen" },
  { to: "/barkley", labelKey: "nav.barkley", shortLabelKey: "nav.barkleyShort", icon: "ClipboardList" },
  { to: "/account", labelKey: "nav.account", shortLabelKey: "nav.accountShort", icon: "UserCog" },
];

export const MORE_NAV = { labelKey: "nav.more", icon: "Menu" } as const;

export type HubGroupKey = "knowledge" | "daily" | "tools" | "resources";

export type HubEntry = {
  to: AppNavTarget;
  labelKey: string;
  descriptionKey: string;
  icon: string;
  hubGroup: HubGroupKey;
};

export const HUB_ITEMS: readonly HubEntry[] = [
  { to: "/connaissances", labelKey: "nav.articles", descriptionKey: "suiviHub.desc.articles", icon: "Newspaper", hubGroup: "knowledge" },
  { to: "/lexique", labelKey: "nav.lexicon", descriptionKey: "suiviHub.desc.lexicon", icon: "BookA", hubGroup: "knowledge" },
  { to: "/quiz", labelKey: "nav.quiz", descriptionKey: "suiviHub.desc.quiz", icon: "Compass", hubGroup: "knowledge" },
  { to: "/journal", labelKey: "nav.journal", descriptionKey: "suiviHub.desc.journal", icon: "BookOpen", hubGroup: "daily" },
  { to: "/symptoms", labelKey: "nav.symptoms", descriptionKey: "suiviHub.desc.symptoms", icon: "Activity", hubGroup: "daily" },
  { to: "/medications", labelKey: "nav.medications", descriptionKey: "suiviHub.desc.medications", icon: "Pill", hubGroup: "daily" },
  { to: "/routines", labelKey: "nav.routines", descriptionKey: "suiviHub.desc.routines", icon: "ListChecks", hubGroup: "daily" },
  { to: "/rewards", labelKey: "nav.rewards", descriptionKey: "suiviHub.desc.rewards", icon: "Trophy", hubGroup: "tools" },
  { to: "/timer", labelKey: "nav.timer", descriptionKey: "suiviHub.desc.timer", icon: "Timer", hubGroup: "tools" },
  { to: "/insights", labelKey: "nav.insights", descriptionKey: "suiviHub.desc.insights", icon: "TrendingUp", hubGroup: "tools" },
  { to: "/crisis-list", labelKey: "nav.crisisList", descriptionKey: "suiviHub.desc.crisisList", icon: "HandHeart", hubGroup: "resources" },
];

export const HUB_GROUPS: readonly { key: HubGroupKey; labelKey: string }[] = [
  { key: "knowledge", labelKey: "suiviHub.groups.knowledge" },
  { key: "daily", labelKey: "suiviHub.groups.daily" },
  { key: "tools", labelKey: "suiviHub.groups.tools" },
  { key: "resources", labelKey: "suiviHub.groups.resources" },
];
