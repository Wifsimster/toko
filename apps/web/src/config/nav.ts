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
} from "lucide-react";

export type NavItem = {
  to: "/dashboard" | "/journal" | "/symptoms" | "/rewards" | "/routines" | "/crisis-list" | "/medications" | "/barkley" | "/timer" | "/admin-analytics" | "/admin-users" | "/admin-settings" | "/connaissances" | "/account" | "/insights";
  labelKey: string;
  shortLabelKey?: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Surfaced in the mobile bottom tab bar (max 4). */
  primary?: boolean;
  /** Section grouping in the desktop sidebar. */
  group: "knowledge" | "tracking" | "care" | "account" | "admin";
  /** Restricts the item to users with `isAdmin === true`. */
  requiresAdmin?: boolean;
};

export const navItems: readonly NavItem[] = [
  // Ressources — apprentissage et outils de référence
  { to: "/connaissances", labelKey: "nav.knowledgeBase", icon: Library, group: "knowledge" },
  { to: "/barkley", labelKey: "nav.barkley", shortLabelKey: "nav.barkleyShort", icon: ClipboardList, group: "knowledge" },

  // Suivi — vue d'ensemble, saisies quotidiennes, puis revue des tendances
  { to: "/dashboard", labelKey: "nav.dashboard", shortLabelKey: "nav.home", icon: BarChart3, primary: true, group: "tracking" },
  { to: "/journal", labelKey: "nav.journal", icon: BookOpen, primary: true, group: "tracking" },
  { to: "/symptoms", labelKey: "nav.symptoms", icon: Activity, primary: true, group: "tracking" },
  { to: "/routines", labelKey: "nav.routines", shortLabelKey: "nav.routinesShort", icon: ListChecks, primary: true, group: "tracking" },
  { to: "/rewards", labelKey: "nav.rewards", shortLabelKey: "nav.rewardsShort", icon: Trophy, group: "tracking" },
  { to: "/insights", labelKey: "nav.insights", icon: TrendingUp, group: "tracking" },

  // Soins — urgence d'abord, puis routines médicales
  { to: "/crisis-list", labelKey: "nav.crisisList", shortLabelKey: "nav.crisis", icon: HandHeart, group: "care" },
  { to: "/medications", labelKey: "nav.medications", icon: Pill, group: "care" },
  { to: "/timer", labelKey: "nav.timer", icon: Timer, group: "care" },

  // Compte — paramètres
  { to: "/account", labelKey: "nav.account", icon: UserCog, group: "account" },

  // Admin — réservé aux utilisateurs avec isAdmin === true
  { to: "/admin-users", labelKey: "nav.adminUsers", icon: Users, group: "admin", requiresAdmin: true },
  { to: "/admin-analytics", labelKey: "nav.adminAnalytics", icon: ShieldCheck, group: "admin", requiresAdmin: true },
  { to: "/admin-settings", labelKey: "nav.adminSettings", icon: Settings, group: "admin", requiresAdmin: true },
] as const;

export const navGroups: { key: NavItem["group"]; labelKey: string }[] = [
  { key: "knowledge", labelKey: "nav.groupKnowledge" },
  { key: "tracking", labelKey: "nav.groupTracking" },
  { key: "care", labelKey: "nav.groupCare" },
  { key: "account", labelKey: "nav.groupAccount" },
  { key: "admin", labelKey: "nav.groupAdmin" },
];

export const primaryNavItems = navItems.filter((i) => i.primary);
