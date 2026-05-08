import { useTranslation } from "react-i18next";
import { useSession } from "@/lib/auth-client";

function firstName(fullName: string | null | undefined): string | null {
  if (!fullName) return null;
  const trimmed = fullName.trim();
  if (!trimmed) return null;
  const parts = trimmed.split(/\s+/);
  return parts[0] ?? null;
}

function timeOfDayKey(now = new Date()): "morning" | "afternoon" | "evening" {
  const h = now.getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

export function DailyGreeting() {
  const { t } = useTranslation();
  const session = useSession();
  const name = firstName(session.data?.user?.name);
  const period = timeOfDayKey();

  const greeting = name
    ? t(`dashboard.greeting.${period}WithName`, { name })
    : t(`dashboard.greeting.${period}`);

  return <>{greeting}</>;
}
