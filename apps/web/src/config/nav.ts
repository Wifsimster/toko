import {
  BarChart3,
  Activity,
  HandHeart,
  Trophy,
  Pill,
  ClipboardList,
  ListChecks,
  Newspaper,
  BookA,
  Timer,
  UserCog,
  TrendingUp,
  ShieldCheck,
  Users,
  Settings,
  NotebookPen,
  FileText,
  Compass,
  Menu,
} from "lucide-react";
import type { MoreEntryId } from "@focusflow/validators";

export type NavTarget =
  | "/dashboard"
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
  | "/lexique"
  | "/quiz"
  | "/plus"
  | "/admin-analytics"
  | "/admin-users"
  | "/admin-settings"
  | "/account";

type Icon = React.ComponentType<{ className?: string }>;

export type NavItem = {
  to: NavTarget;
  labelKey: string;
  shortLabelKey?: string;
  icon: Icon;
  primary?: boolean;
  group: "main" | "admin";
  requiresAdmin?: boolean;
};

export const moreNavItem: NavItem = { to: "/plus", labelKey: "nav.more", icon: Menu, group: "main" };

export const navItems: readonly NavItem[] = [
  { to: "/dashboard", labelKey: "nav.today", shortLabelKey: "nav.home", icon: BarChart3, primary: true, group: "main" },
  { to: "/journal", labelKey: "nav.tracking", shortLabelKey: "nav.trackingShort", icon: NotebookPen, primary: true, group: "main" },
  { to: "/barkley", labelKey: "nav.barkley", shortLabelKey: "nav.barkleyShort", icon: ClipboardList, primary: true, group: "main" },
  { to: "/account", labelKey: "nav.account", shortLabelKey: "nav.accountShort", icon: UserCog, primary: true, group: "main" },
  moreNavItem,

  { to: "/admin-users", labelKey: "nav.adminUsers", icon: Users, group: "admin", requiresAdmin: true },
  { to: "/admin-analytics", labelKey: "nav.adminAnalytics", icon: ShieldCheck, group: "admin", requiresAdmin: true },
  { to: "/admin-settings", labelKey: "nav.adminSettings", icon: Settings, group: "admin", requiresAdmin: true },
] as const;

export const navGroups: { key: NavItem["group"]; labelKey: string }[] = [
  { key: "main", labelKey: "nav.groupMain" },
  { key: "admin", labelKey: "nav.groupAdmin" },
];

export const primaryNavItems = navItems.filter((i) => i.primary);

export const adminNavItems = navItems.filter((i) => i.group === "admin");

export type MoreItem = {
  id: MoreEntryId;
  to: NavTarget;
  labelKey: string;
  descriptionKey: string;
  icon: Icon;
};

const more = (id: MoreEntryId, to: NavTarget, labelKey: string, icon: Icon): MoreItem => ({
  id,
  to,
  labelKey,
  descriptionKey: `more.desc.${id}`,
  icon,
});

export const moreItems: Readonly<Record<MoreEntryId, MoreItem>> = {
  suivi: more("suivi", "/journal", "nav.journal", NotebookPen),
  symptoms: more("symptoms", "/symptoms", "nav.symptoms", Activity),
  medications: more("medications", "/medications", "nav.medications", Pill),
  routines: more("routines", "/routines", "nav.routines", ListChecks),
  barkley: more("barkley", "/barkley", "nav.barkley", ClipboardList),
  rewards: more("rewards", "/rewards", "nav.rewards", Trophy),
  timer: more("timer", "/timer", "nav.timer", Timer),
  insights: more("insights", "/insights", "nav.insights", TrendingUp),
  report: more("report", "/report", "nav.report", FileText),
  articles: more("articles", "/connaissances", "nav.articles", Newspaper),
  lexicon: more("lexicon", "/lexique", "nav.lexicon", BookA),
  quiz: more("quiz", "/quiz", "nav.quiz", Compass),
  crisis: more("crisis", "/crisis-list", "nav.crisisList", HandHeart),
  account: more("account", "/account", "nav.account", UserCog),
};

export const matchesPath = (pathname: string, to: string) => pathname === to || pathname.startsWith(`${to}/`);

export function isMoreActive(pathname: string): boolean {
  if (matchesPath(pathname, moreNavItem.to)) return true;
  if (primaryNavItems.some((i) => matchesPath(pathname, i.to))) return false;
  return Object.values(moreItems).some((i) => matchesPath(pathname, i.to));
}
