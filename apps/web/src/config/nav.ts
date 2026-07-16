import {
  BarChart3,
  BookOpen,
  Activity,
  HandHeart,
  Trophy,
  Pill,
  ClipboardList,
  ListChecks,
  Library,
  Timer,
  UserCog,
  TrendingUp,
  ShieldCheck,
  Users,
  Settings,
  NotebookPen,
  FileText,
} from "lucide-react";

export type NavTarget =
  | "/dashboard"
  | "/suivi"
  | "/journal"
  | "/symptoms"
  | "/rewards"
  | "/routines"
  | "/crisis-list"
  | "/medications"
  | "/barkley"
  | "/timer"
  | "/report"
  | "/insights"
  | "/connaissances"
  | "/admin-analytics"
  | "/admin-users"
  | "/admin-settings"
  | "/account";

export type NavItem = {
  to: NavTarget;
  labelKey: string;
  shortLabelKey?: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Surfaced in the mobile bottom tab bar (max 4). */
  primary?: boolean;
  /** Section grouping in the desktop sidebar. */
  group: "main" | "admin";
  /** Restricts the item to users with `isAdmin === true`. */
  requiresAdmin?: boolean;
};

// Primary navigation — kept to 5 parent entries (Phase 1 goal, docs/product-
// strategy.md §6): Aujourd'hui, Suivi, Barkley, Rapport, Compte. Every daily
// tracking screen lives one tap away inside the /suivi hub, so the sidebar
// stays low-cognitive-load without hiding anything.
export const navItems: readonly NavItem[] = [
  { to: "/dashboard", labelKey: "nav.today", shortLabelKey: "nav.home", icon: BarChart3, primary: true, group: "main" },
  { to: "/suivi", labelKey: "nav.tracking", shortLabelKey: "nav.trackingShort", icon: NotebookPen, primary: true, group: "main" },
  { to: "/barkley", labelKey: "nav.barkley", shortLabelKey: "nav.barkleyShort", icon: ClipboardList, primary: true, group: "main" },
  { to: "/report", labelKey: "nav.report", icon: FileText, group: "main" },
  { to: "/account", labelKey: "nav.account", icon: UserCog, primary: true, group: "main" },

  // Admin — réservé aux utilisateurs avec isAdmin === true
  { to: "/admin-users", labelKey: "nav.adminUsers", icon: Users, group: "admin", requiresAdmin: true },
  { to: "/admin-analytics", labelKey: "nav.adminAnalytics", icon: ShieldCheck, group: "admin", requiresAdmin: true },
  { to: "/admin-settings", labelKey: "nav.adminSettings", icon: Settings, group: "admin", requiresAdmin: true },
] as const;

export const navGroups: { key: NavItem["group"]; labelKey: string }[] = [
  { key: "main", labelKey: "nav.groupMain" },
  { key: "admin", labelKey: "nav.groupAdmin" },
];

export const primaryNavItems = navItems.filter((i) => i.primary);

// Secondary screens, reachable from the /suivi hub (not the sidebar). Grouped
// for the hub layout; each keeps its own route + URL unchanged.
export type HubGroup = "daily" | "tools" | "resources";

export type HubItem = {
  to: NavTarget;
  labelKey: string;
  descriptionKey: string;
  icon: React.ComponentType<{ className?: string }>;
  hubGroup: HubGroup;
};

export const hubNavItems: readonly HubItem[] = [
  { to: "/journal", labelKey: "nav.journal", descriptionKey: "suiviHub.desc.journal", icon: BookOpen, hubGroup: "daily" },
  { to: "/symptoms", labelKey: "nav.symptoms", descriptionKey: "suiviHub.desc.symptoms", icon: Activity, hubGroup: "daily" },
  { to: "/medications", labelKey: "nav.medications", descriptionKey: "suiviHub.desc.medications", icon: Pill, hubGroup: "daily" },
  { to: "/routines", labelKey: "nav.routines", descriptionKey: "suiviHub.desc.routines", icon: ListChecks, hubGroup: "daily" },
  { to: "/rewards", labelKey: "nav.rewards", descriptionKey: "suiviHub.desc.rewards", icon: Trophy, hubGroup: "tools" },
  { to: "/timer", labelKey: "nav.timer", descriptionKey: "suiviHub.desc.timer", icon: Timer, hubGroup: "tools" },
  { to: "/insights", labelKey: "nav.insights", descriptionKey: "suiviHub.desc.insights", icon: TrendingUp, hubGroup: "tools" },
  { to: "/crisis-list", labelKey: "nav.crisisList", descriptionKey: "suiviHub.desc.crisisList", icon: HandHeart, hubGroup: "resources" },
  { to: "/connaissances", labelKey: "nav.knowledgeBase", descriptionKey: "suiviHub.desc.knowledgeBase", icon: Library, hubGroup: "resources" },
] as const;

export const hubGroups: { key: HubGroup; labelKey: string }[] = [
  { key: "daily", labelKey: "suiviHub.groups.daily" },
  { key: "tools", labelKey: "suiviHub.groups.tools" },
  { key: "resources", labelKey: "suiviHub.groups.resources" },
];
