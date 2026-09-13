import { Sun, Moon, Coffee, CloudSun, Sparkles } from "lucide-react";
import type { TimeOfDay } from "@focusflow/validators";
import { todayISO } from "@/lib/date";

/** When a routine runs, and what "today" means for it. */

export const TIME_SLOTS: { value: TimeOfDay; iconKey: string }[] = [
  { value: "morning", iconKey: "morning" },
  { value: "noon", iconKey: "noon" },
  { value: "evening", iconKey: "evening" },
  { value: "bedtime", iconKey: "bedtime" },
  { value: "anytime", iconKey: "anytime" },
];

export function timeIcon(slot: TimeOfDay) {
  switch (slot) {
    case "morning":
      return Sun;
    case "noon":
      return CloudSun;
    case "evening":
      return Coffee;
    case "bedtime":
      return Moon;
    case "anytime":
    default:
      return Sparkles;
  }
}

export function todayIso() {
  return todayISO();
}

export function todayDayOfWeek() {
  // JS Sunday=0 … Saturday=6 — convert to Monday=0 … Sunday=6 to match model.
  const js = new Date().getDay();
  return (js + 6) % 7;
}
