export function todayISO(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const FR_MONTHS = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

const FR_WEEKDAYS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

export function formatFrLongDate(d: Date): string {
  return `${FR_WEEKDAYS[d.getDay()]} ${d.getDate()} ${FR_MONTHS[d.getMonth()]}`;
}

export function formatFrDate(iso: string): string {
  const [, month, day] = iso.split("-").map(Number);
  if (!month || !day) return iso;
  return `${day} ${FR_MONTHS[month - 1] ?? ""}`.trim();
}

export function formatFrEntryDate(iso: string, now: Date = new Date()): string {
  const today = todayISO(now);
  if (iso === today) return "Aujourd'hui";
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  if (iso === todayISO(yesterday)) return "Hier";
  const year = Number(iso.slice(0, 4));
  const base = formatFrDate(iso);
  return year && year !== now.getFullYear() ? `${base} ${year}` : base;
}
