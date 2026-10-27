/** Local calendar date as YYYY-MM-DD (mirrors apps/web/src/lib/date.ts). */
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

/** Date locale -> "Lundi 26 octobre" (accueil). Sans Intl, comme formatFrDate. */
export function formatFrLongDate(d: Date): string {
  return `${FR_WEEKDAYS[d.getDay()]} ${d.getDate()} ${FR_MONTHS[d.getMonth()]}`;
}

/** "2026-01-15" -> "15 janvier". Manual to avoid relying on Intl in Hermes. */
export function formatFrDate(iso: string): string {
  const [, month, day] = iso.split("-").map(Number);
  if (!month || !day) return iso;
  return `${day} ${FR_MONTHS[month - 1] ?? ""}`.trim();
}
