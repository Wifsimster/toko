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
  Sparkles,
  Timer,
  Stethoscope,
  Vault,
  Award,
  History,
  UserCog,
  Brain,
  HeartPulse,
  MessageSquareText,
  TrendingUp,
} from "lucide-react";

export type NavItem = {
  to: "/dashboard" | "/journal" | "/symptoms" | "/rewards" | "/routines" | "/crisis-list" | "/medications" | "/barkley" | "/strengths" | "/timer" | "/care-pathway" | "/admin-vault" | "/achievements" | "/activity" | "/connaissances" | "/account" | "/decodeur" | "/burnout" | "/insights" | "/scripts";
  labelKey: string;
  shortLabelKey?: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Surfaced in the mobile bottom tab bar (max 4). */
  primary?: boolean;
  /** Section grouping in the desktop sidebar. */
  group: "knowledge" | "tracking" | "care" | "account";
};

export const navItems: readonly NavItem[] = [
  { to: "/connaissances", labelKey: "nav.knowledgeBase", icon: Library, group: "knowledge" },
  { to: "/decodeur", labelKey: "nav.behaviorDecoder", icon: Brain, group: "knowledge" },
  { to: "/scripts", labelKey: "nav.communicationScripts", icon: MessageSquareText, group: "knowledge" },
  { to: "/dashboard", labelKey: "nav.dashboard", shortLabelKey: "nav.home", icon: BarChart3, primary: true, group: "tracking" },
  { to: "/insights", labelKey: "nav.insights", icon: TrendingUp, group: "tracking" },
  { to: "/journal", labelKey: "nav.journal", icon: BookOpen, primary: true, group: "tracking" },
  { to: "/symptoms", labelKey: "nav.symptoms", icon: Activity, primary: true, group: "tracking" },
  { to: "/strengths", labelKey: "nav.strengths", icon: Sparkles, group: "tracking" },
  { to: "/routines", labelKey: "nav.routines", shortLabelKey: "nav.routinesShort", icon: ListChecks, primary: true, group: "tracking" },
  { to: "/rewards", labelKey: "nav.rewards", shortLabelKey: "nav.rewardsShort", icon: Trophy, group: "tracking" },
  { to: "/crisis-list", labelKey: "nav.crisisList", shortLabelKey: "nav.crisis", icon: HandHeart, group: "care" },
  { to: "/medications", labelKey: "nav.medications", icon: Pill, group: "care" },
  { to: "/timer", labelKey: "nav.timer", icon: Timer, group: "care" },
  { to: "/care-pathway", labelKey: "nav.carePathway", icon: Stethoscope, group: "care" },
  { to: "/admin-vault", labelKey: "nav.adminVault", icon: Vault, group: "care" },
  { to: "/burnout", labelKey: "nav.burnout", icon: HeartPulse, group: "care" },
  { to: "/barkley", labelKey: "nav.barkley", shortLabelKey: "nav.barkleyShort", icon: ClipboardList, group: "care" },
  { to: "/activity", labelKey: "nav.activity", icon: History, group: "account" },
  { to: "/achievements", labelKey: "nav.achievements", icon: Award, group: "account" },
  { to: "/account", labelKey: "nav.account", icon: UserCog, group: "account" },
] as const;

export const navGroups: { key: NavItem["group"]; labelKey: string }[] = [
  { key: "knowledge", labelKey: "nav.groupKnowledge" },
  { key: "tracking", labelKey: "nav.groupTracking" },
  { key: "care", labelKey: "nav.groupCare" },
  { key: "account", labelKey: "nav.groupAccount" },
];

export const primaryNavItems = navItems.filter((i) => i.primary);
