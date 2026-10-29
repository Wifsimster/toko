import { useTranslation } from "react-i18next";
import {
  Activity,
  BookOpen,
  Crown,
  FileText,
  HandHeart,
  History,
  ListChecks,
  Pill,
  Sparkles,
  User,
  UserPlus,
  UserMinus,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAuditLogForChild,
  type AuditEntry,
  type AuditEntityType,
} from "@/hooks/use-audit-log";

interface Props {
  childId: string;
  limit?: number;
}

const ENTITY_ICONS: Record<AuditEntityType, React.ComponentType<{ className?: string }>> = {
  child: Crown,
  symptom: Activity,
  journal: BookOpen,
  medication: Pill,
  medication_log: Pill,
  crisis_item: HandHeart,
  child_access: UserMinus,
  child_invitation: UserPlus,
  strength: Sparkles,
  routine: ListChecks,
  routine_completion: ListChecks,
  admin_document: FileText,
};

export function RecentActivity({ childId, limit = 50 }: Props) {
  const { t } = useTranslation();
  const { data, isLoading } = useAuditLogForChild(childId, limit);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border/60 py-8 text-center text-sm text-muted-foreground">
        <History className="size-5" />
        <p>{t("auditLog.empty")}</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {data.map((entry) => (
        <ActivityRow key={entry.id} entry={entry} />
      ))}
    </ul>
  );
}

function ActivityRow({ entry }: { entry: AuditEntry }) {
  const { t, i18n } = useTranslation();
  const Icon = ENTITY_ICONS[entry.entityType] ?? User;

  const actor = entry.actorName ?? t("auditLog.deletedActor");
  const text = entry.summary ?? defaultSummary(t, entry);

  const date = new Date(entry.createdAt);
  const locale = i18n.resolvedLanguage === "en" ? "en-US" : "fr-FR";
  const relative = formatRelative(date, locale);
  const exact = date.toLocaleString(locale, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <li className="flex items-start gap-3 rounded-lg border border-border/60 bg-background/40 p-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm">
          <span className="font-medium">{actor}</span>{" "}
          <span className="text-muted-foreground">, {text}</span>
        </p>
        <p
          className="mt-0.5 text-xs text-muted-foreground"
          title={exact}
        >
          {relative}
        </p>
      </div>
    </li>
  );
}

function formatRelative(date: Date, locale: string): string {
  const diff = Date.now() - date.getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return locale.startsWith("en") ? "just now" : "à l'instant";
  if (min < 60) return locale.startsWith("en") ? `${min} min ago` : `il y a ${min} min`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return locale.startsWith("en") ? `${hr} h ago` : `il y a ${hr} h`;
  const d = Math.floor(hr / 24);
  if (d === 1) return locale.startsWith("en") ? "yesterday" : "hier";
  if (d < 7) return locale.startsWith("en") ? `${d} d ago` : `il y a ${d} j`;
  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
  });
}

function defaultSummary(
  t: (key: string) => string,
  entry: AuditEntry,
): string {
  return t(`auditLog.fallback.${entry.entityType}.${entry.action}`);
}
