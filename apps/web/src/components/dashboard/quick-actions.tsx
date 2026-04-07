import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  Activity,
  BookOpen,
  Pill,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const actions = [
  { to: "/symptoms" as const, labelKey: "quickActions.logSymptoms", icon: Activity },
  { to: "/journal" as const, labelKey: "quickActions.writeJournal", icon: BookOpen },
  { to: "/medications" as const, labelKey: "quickActions.logMedication", icon: Pill },
  { to: "/barkley" as const, labelKey: "quickActions.barkley", icon: ClipboardList },
] as const;

export function QuickActions() {
  const { t } = useTranslation();

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {actions.map((action) => (
        <Button
          key={action.to}
          variant="outline"
          size="sm"
          render={<Link to={action.to} />}
          className="shrink-0 gap-1.5"
        >
          <action.icon className="h-3.5 w-3.5" />
          {t(action.labelKey)}
        </Button>
      ))}
    </div>
  );
}
