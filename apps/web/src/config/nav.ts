import {
  BarChart3,
  BookOpen,
  Activity,
  HandHeart,
  Trophy,
  Pill,
  ClipboardList,
  Newspaper,
  UserCog,
} from "lucide-react";

export type NavItem = {
  to: "/dashboard" | "/journal" | "/symptoms" | "/rewards" | "/crisis-list" | "/medications" | "/barkley" | "/actualites" | "/account";
  labelKey: string;
  shortLabelKey?: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Surfaced in the mobile bottom tab bar (max 4). */
  primary?: boolean;
  /** Section grouping in the desktop sidebar. */
  group: "tracking" | "care" | "account";
};

export const navItems: readonly NavItem[] = [
  { to: "/dashboard", labelKey: "nav.dashboard", shortLabelKey: "nav.home", icon: BarChart3, primary: true, group: "tracking" },
  { to: "/journal", labelKey: "nav.journal", icon: BookOpen, primary: true, group: "tracking" },
  { to: "/symptoms", labelKey: "nav.symptoms", icon: Activity, group: "tracking" },
  { to: "/rewards", labelKey: "nav.rewards", shortLabelKey: "nav.rewardsShort", icon: Trophy, group: "tracking" },
  { to: "/crisis-list", labelKey: "nav.crisisList", shortLabelKey: "nav.crisis", icon: HandHeart, primary: true, group: "care" },
  { to: "/medications", labelKey: "nav.medications", icon: Pill, group: "care" },
  { to: "/barkley", labelKey: "nav.barkley", shortLabelKey: "nav.barkleyShort", icon: ClipboardList, primary: true, group: "care" },
  { to: "/actualites", labelKey: "nav.news", icon: Newspaper, group: "account" },
  { to: "/account", labelKey: "nav.account", icon: UserCog, group: "account" },
] as const;

export const navGroups: { key: NavItem["group"]; labelKey: string }[] = [
  { key: "tracking", labelKey: "nav.groupTracking" },
  { key: "care", labelKey: "nav.groupCare" },
  { key: "account", labelKey: "nav.groupAccount" },
];

export const primaryNavItems = navItems.filter((i) => i.primary);
