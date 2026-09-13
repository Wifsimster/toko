import { toISODate } from "@/lib/date";

/** The Monday-anchored week the tracking grid is laid out on. */

export function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function formatDate(d: Date): string {
  return toISODate(d);
}

// Delete a tracked behavior, guarded by an explicit confirmation so a parent
