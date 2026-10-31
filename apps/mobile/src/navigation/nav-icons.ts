import {
  Activity,
  BarChart3,
  BookA,
  BookOpen,
  ClipboardList,
  Compass,
  FileText,
  HandHeart,
  Leaf,
  ListChecks,
  Menu,
  Newspaper,
  NotebookPen,
  Pill,
  Timer,
  TrendingUp,
  Trophy,
  UserCog,
  type LucideIcon,
} from "lucide-react-native";

const ICONS: Record<string, LucideIcon> = {
  Activity,
  BarChart3,
  BookA,
  BookOpen,
  ClipboardList,
  Compass,
  FileText,
  HandHeart,
  Leaf,
  ListChecks,
  Menu,
  Newspaper,
  NotebookPen,
  Pill,
  Timer,
  TrendingUp,
  Trophy,
  UserCog,
};

export function navIcon(name: string): LucideIcon {
  const icon = ICONS[name];
  if (!icon) throw new Error(`Icône inconnue : ${name}`);
  return icon;
}
